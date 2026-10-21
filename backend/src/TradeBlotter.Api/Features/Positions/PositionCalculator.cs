using TradeBlotter.Api.Data;
using TradeBlotter.Api.Features.Trades;

namespace TradeBlotter.Api.Features.Positions;

// Average-cost positions, unrounded. Rules: docs/superpowers/specs/2026-10-19-trade-blotter-design.md.
public static class PositionCalculator
{
    public static IReadOnlyList<PositionResponse> Calculate(IEnumerable<Trade> trades)
    {
        var positions = new Dictionary<string, (decimal Net, decimal Avg)>();
        foreach (var trade in trades.OrderBy(t => t.Timestamp).ThenBy(t => t.Sequence))
        {
            var (net, avg) = positions.GetValueOrDefault(trade.Symbol);
            positions[trade.Symbol] = Apply(net, avg, trade);
        }

        return positions
            .Where(p => p.Value.Net != 0)
            .OrderBy(p => p.Key, StringComparer.Ordinal)
            .Select(p => new PositionResponse(p.Key, p.Value.Net, p.Value.Avg))
            .ToList();
    }

    private static (decimal Net, decimal Avg) Apply(decimal net, decimal avg, Trade trade)
    {
        var q = trade.Quantity;
        var signed = trade.Side == Side.Buy ? q : -q;
        var newNet = net + signed;
        var held = Math.Abs(net);

        if (net == 0 || Math.Sign(net) == Math.Sign(signed))
            return (newNet, (held * avg + q * trade.Price) / (held + q));
        // Reducing keeps the average; flipping through zero opens at this trade's price.
        // Closing to exactly zero keeps a stale average, which the next trade ignores because held is 0.
        return (newNet, q <= held ? avg : trade.Price);
    }
}
