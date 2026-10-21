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
                Request(symbol: " aapl ", side: Side.Sell, quantity: 2.5m, price: 10m),
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
    public async Task List_is_newest_first_with_ties_broken_by_insert_order()
    {
        var older = await Service().CreateAsync(Request(symbol: "OLD"), default);
        clock.Advance(TimeSpan.FromSeconds(1));
        var tieFirst = await Service().CreateAsync(Request(symbol: "TIE1"), default);
        var tieSecond = await Service().CreateAsync(Request(symbol: "TIE2"), default);

        var list = await Service().ListAsync(default);

        Assert.Equal([tieSecond, tieFirst, older], list);
    }

    [Fact]
    public async Task List_orders_by_timestamp_before_insert_order()
    {
        await using (var write = db.NewContext())
        {
            write.Trades.Add(Entity("LATE", Start.UtcDateTime.AddMinutes(1)));
            write.Trades.Add(Entity("EARLY", Start.UtcDateTime));
            await write.SaveChangesAsync();
        }

        var list = await Service().ListAsync(default);

        Assert.Equal(["LATE", "EARLY"], list.Select(t => t.Symbol));
    }

    [Fact]
    public async Task List_of_an_empty_store_is_empty()
    {
        Assert.Empty(await Service().ListAsync(default));
    }

    private static Data.Trade Entity(string symbol, DateTime timestamp) =>
        new()
        {
            Id = Guid.NewGuid(),
            Symbol = symbol,
            Side = Side.Buy,
            Quantity = 1m,
            Price = 1m,
            Timestamp = timestamp,
        };

    private TradeService Service() => new(db.NewContext(), clock);

    public void Dispose() => db.Dispose();
}
