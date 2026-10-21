using TradeBlotter.Api.Data;
using TradeBlotter.Api.Features.Positions;

namespace TradeBlotter.Api.Tests.Positions;

public sealed class PositionServiceTests : IDisposable
{
    private readonly TestDb db = new();

    [Fact]
    public async Task Rounds_average_cost_to_six_places_away_from_zero()
    {
        // (1 + 1.000001) / 2 = 1.0000005, a midpoint at the 7th place.
        await Add(("AAPL", Side.Buy, 1m, 1m), ("AAPL", Side.Buy, 1m, 1.000001m));
        // 10 / 3 = 3.333…, rounds down.
        await Add(
            ("MSFT", Side.Buy, 1m, 1m),
            ("MSFT", Side.Buy, 1m, 2m),
            ("MSFT", Side.Buy, 1m, 7m)
        );

        var positions = await new PositionService(db.NewContext()).ListAsync(default);

        Assert.Equal([new("AAPL", 2m, 1.000001m), new("MSFT", 3m, 3.333333m)], positions);
    }

    [Fact]
    public async Task Empty_store_has_no_positions() =>
        Assert.Empty(await new PositionService(db.NewContext()).ListAsync(default));

    private async Task Add(
        params (string Symbol, Side Side, decimal Quantity, decimal Price)[] trades
    )
    {
        await using var write = db.NewContext();
        foreach (var (symbol, side, quantity, price) in trades)
            write.Trades.Add(
                new Trade
                {
                    Id = Guid.NewGuid(),
                    Symbol = symbol,
                    Side = side,
                    Quantity = quantity,
                    Price = price,
                    Timestamp = DateTime.UtcNow,
                }
            );
        await write.SaveChangesAsync();
    }

    public void Dispose() => db.Dispose();
}
