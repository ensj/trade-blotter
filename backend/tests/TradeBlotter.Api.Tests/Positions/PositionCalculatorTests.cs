using TradeBlotter.Api.Data;
using TradeBlotter.Api.Features.Positions;

namespace TradeBlotter.Api.Tests.Positions;

public class PositionCalculatorTests
{
    private static readonly DateTime T0 = new(2026, 10, 19, 14, 0, 0, DateTimeKind.Utc);

    // One trade string per row: "B 100@10" is Buy 100 at 10.
    [Theory]
    [InlineData("B 100@10, B 100@20", 200, 15)]
    [InlineData("B 100@10, S 40@50", 60, 10)]
    [InlineData("B 100@10, S 150@12", -50, 12)]
    [InlineData("S 50@20, S 50@10", -100, 15)]
    [InlineData("S 100@20, B 30@5", -70, 20)]
    [InlineData("B 100@10, S 100@12, B 10@30", 10, 30)]
    public void Worked_examples(string trades, decimal net, decimal avg) =>
        Assert.Equal([new("AAPL", net, avg)], Calculate(trades));

    [Fact]
    public void Position_closed_to_zero_is_omitted() =>
        Assert.Empty(Calculate("B 100@10, S 100@12"));

    [Fact]
    public void No_trades_means_no_positions() => Assert.Empty(PositionCalculator.Calculate([]));

    [Fact]
    public void Symbol_with_only_sells_is_short_at_weighted_average() =>
        Assert.Equal([new("AAPL", -40, 12.5m)], Calculate("S 10@20, S 30@10"));

    [Fact]
    public void Short_closed_then_reopened_starts_fresh() =>
        Assert.Equal([new("AAPL", -5, 7)], Calculate("S 10@20, B 10@5, S 5@7"));

    [Fact]
    public void Short_flipping_long_takes_the_flip_price() =>
        Assert.Equal([new("AAPL", 20, 9)], Calculate("S 10@20, B 30@9"));

    [Fact]
    public void Reducing_after_averaging_keeps_the_average() =>
        Assert.Equal([new("AAPL", 150, 15)], Calculate("B 100@10, B 100@20, S 50@99"));

    [Fact]
    public void Fractional_quantities_stay_exact() =>
        Assert.Equal([new("AAPL", 0.3m, 1.5m)], Calculate("B 0.1@1, B 0.1@2, B 0.1@1.5"));

    [Fact]
    public void Fractional_sells_closing_to_exactly_zero_are_omitted() =>
        Assert.Empty(Calculate("B 0.3@1, S 0.1@1, S 0.2@1"));

    [Fact]
    public void Average_is_unrounded() =>
        Assert.Equal(10m / 3m, Assert.Single(Calculate("B 1@1, B 1@2, B 1@7")).AverageCost);

    [Fact]
    public void Symbols_are_independent_and_sorted()
    {
        var trades = new[]
        {
            Trade("MSFT", Side.Buy, 10, 400),
            Trade("AAPL", Side.Buy, 100, 10, T0.AddSeconds(1)),
            Trade("MSFT", Side.Sell, 4, 999, T0.AddSeconds(2)),
            Trade("FLAT", Side.Buy, 1, 1, T0.AddSeconds(3)),
            Trade("AAPL", Side.Buy, 100, 20, T0.AddSeconds(4)),
            Trade("FLAT", Side.Sell, 1, 2, T0.AddSeconds(5)),
            Trade("BRK.B", Side.Sell, 3, 300, T0.AddSeconds(6)),
        };

        Assert.Equal(
            [new("AAPL", 200, 15), new("BRK.B", -3, 300), new("MSFT", 6, 400)],
            PositionCalculator.Calculate(trades)
        );
    }

    [Fact]
    public void Trades_are_applied_in_timestamp_order_not_input_order()
    {
        var trades = new[]
        {
            Trade("AAPL", Side.Buy, 10, 30, T0.AddSeconds(2)),
            Trade("AAPL", Side.Sell, 100, 12, T0.AddSeconds(1)),
            Trade("AAPL", Side.Buy, 100, 10, T0),
        };

        Assert.Equal([new("AAPL", 10, 30)], PositionCalculator.Calculate(trades));
    }

    [Fact]
    public void Timestamp_ties_are_applied_in_id_order()
    {
        var trades = new[]
        {
            Trade("AAPL", Side.Buy, 10, 30, T0, id: Id(3)),
            Trade("AAPL", Side.Sell, 100, 12, T0, id: Id(2)),
            Trade("AAPL", Side.Buy, 100, 10, T0, id: Id(1)),
        };

        Assert.Equal([new("AAPL", 10, 30)], PositionCalculator.Calculate(trades));
    }

    private static Guid Id(int n) => new($"00000000-0000-0000-0000-{n:D12}");

    private static IReadOnlyList<Position> Calculate(string trades) =>
        PositionCalculator.Calculate(
            trades
                .Split(", ")
                .Select(
                    (t, i) =>
                    {
                        var side = t[0] == 'B' ? Side.Buy : Side.Sell;
                        var parts = t[2..].Split('@');
                        return Trade(
                            "AAPL",
                            side,
                            decimal.Parse(parts[0]),
                            decimal.Parse(parts[1]),
                            T0.AddSeconds(i)
                        );
                    }
                )
                .ToList()
        );

    private static Trade Trade(
        string symbol,
        Side side,
        decimal quantity,
        decimal price,
        DateTime? timestamp = null,
        Guid? id = null
    ) =>
        new()
        {
            Id = id ?? Guid.NewGuid(),
            Symbol = symbol,
            Side = side,
            Quantity = quantity,
            Price = price,
            Timestamp = timestamp ?? T0,
        };
}
