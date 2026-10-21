using Microsoft.EntityFrameworkCore;
using TradeBlotter.Api.Data;

namespace TradeBlotter.Api.Features.Positions;

public sealed class PositionService(AppDbContext db)
{
    // Six places survive JavaScript's number parsing; the calculator itself stays unrounded.
    private const int AverageCostDecimals = 6;

    // SQLite can't sum or order decimals, so positions are computed in memory over all trades.
    public async Task<IReadOnlyList<PositionResponse>> ListAsync(CancellationToken ct)
    {
        var trades = await db.Trades.AsNoTracking().ToListAsync(ct);
        return PositionCalculator
            .Calculate(trades)
            .Select(p => new PositionResponse(
                p.Symbol,
                p.NetQuantity,
                Math.Round(p.AverageCost, AverageCostDecimals, MidpointRounding.AwayFromZero)
            ))
            .ToList();
    }
}
