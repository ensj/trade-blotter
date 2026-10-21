using Microsoft.Extensions.Time.Testing;
using TradeBlotter.Api.Data;
using TradeBlotter.Api.Features.Trades;
using static TradeBlotter.Api.Tests.Trades.TradeValidatorTests;

namespace TradeBlotter.Api.Tests.Trades;

public sealed class TradeServiceTests : IDisposable
{
    private static readonly DateTimeOffset Start = new(2026, 10, 19, 14, 3, 11, 123, TimeSpan.Zero);

    private readonly TestDb db = new();
    private readonly FakeTimeProvider clock = new(Start);

    [Fact]
    public async Task Create_stores_the_normalized_trade_with_server_time()
    {
        var created = await Service()
            .CreateAsync(
                Request(symbol: " aapl ", side: "sell", quantity: 2.5m, price: 10m),
                default
            );

        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.Equal("AAPL", created.Symbol);
        Assert.Equal(Side.Sell, created.Side);
        Assert.Equal(2.5m, created.Quantity);
        Assert.Equal(10m, created.Price);
        Assert.Equal(Start.UtcDateTime, created.Timestamp);
        Assert.Equal(DateTimeKind.Utc, created.Timestamp.Kind);
        Assert.Equal(created, await Service().GetAsync(created.Id, default));
    }

    [Fact]
    public async Task Create_assigns_distinct_ids()
    {
        var first = await Service().CreateAsync(Request(), default);
        var second = await Service().CreateAsync(Request(), default);

        Assert.NotEqual(first.Id, second.Id);
    }

    [Fact]
    public async Task Get_unknown_id_returns_null()
    {
        await Service().CreateAsync(Request(), default);

        Assert.Null(await Service().GetAsync(Guid.NewGuid(), default));
    }

    [Fact]
    public async Task List_is_newest_first_with_ties_broken_by_id_descending()
    {
        var at = Start.UtcDateTime;
        await Add(
            Entity("TIE_HIGH", at.AddSeconds(1), Id(2)),
            Entity("OLD", at, Id(9)),
            Entity("TIE_LOW", at.AddSeconds(1), Id(1))
        );

        var list = await Service().ListAsync(default);

        Assert.Equal(["TIE_HIGH", "TIE_LOW", "OLD"], list.Select(t => t.Symbol));
    }

    // The calculator breaks ties with Guid.CompareTo in memory; SQLite sorts the stored text.
    // Both must agree or the blotter and positions would disagree on which tied trade came first.
    [Fact]
    public async Task Database_tie_order_matches_guid_order()
    {
        var tied = Enumerable
            .Range(0, 200)
            .Select(i => Entity($"T{i}", Start.UtcDateTime, Guid.NewGuid()))
            .ToArray();
        await Add(tied);

        var list = await Service().ListAsync(default);

        Assert.Equal(tied.Select(t => t.Id).OrderDescending(), list.Select(t => t.Id));
    }

    [Fact]
    public async Task List_orders_by_timestamp_before_id()
    {
        await Add(
            Entity("LATE", Start.UtcDateTime.AddMinutes(1), Id(1)),
            Entity("EARLY", Start.UtcDateTime, Id(2))
        );

        var list = await Service().ListAsync(default);

        Assert.Equal(["LATE", "EARLY"], list.Select(t => t.Symbol));
    }

    [Fact]
    public async Task List_of_an_empty_store_is_empty()
    {
        Assert.Empty(await Service().ListAsync(default));
    }

    private async Task Add(params Data.Trade[] trades)
    {
        await using var write = db.NewContext();
        write.Trades.AddRange(trades);
        await write.SaveChangesAsync();
    }

    private static Guid Id(int n) => new($"00000000-0000-0000-0000-{n:D12}");

    private static Data.Trade Entity(string symbol, DateTime timestamp, Guid id) =>
        new()
        {
            Id = id,
            Symbol = symbol,
            Side = Side.Buy,
            Quantity = 1m,
            Price = 1m,
            Timestamp = timestamp,
        };

    private TradeService Service() => new(db.NewContext(), clock);

    public void Dispose() => db.Dispose();
}
