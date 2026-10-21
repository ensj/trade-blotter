using Microsoft.EntityFrameworkCore;
using TradeBlotter.Api.Data;

namespace TradeBlotter.Api.Features.Trades;

public sealed class TradeService(AppDbContext db, TimeProvider clock)
{
    // Expects a request that passed model validation, including TradeValidator.
    public async Task<TradeResponse> CreateAsync(CreateTradeRequest request, CancellationToken ct)
    {
        var trade = new Trade
        {
            Id = Guid.NewGuid(),
            Symbol = TradeValidator.NormalizeSymbol(request.Symbol!),
            Side = TradeValidator.ParseSide(request.Side!),
            Quantity = request.Quantity!.Value,
            Price = request.Price!.Value,
            Timestamp = clock.GetUtcNow().UtcDateTime,
        };
        db.Trades.Add(trade);
        await db.SaveChangesAsync(ct);
        return ToResponse(trade);
    }

    public async Task<IReadOnlyList<TradeResponse>> ListAsync(CancellationToken ct) =>
        await db
            .Trades.AsNoTracking()
            .OrderByDescending(t => t.Timestamp)
            .ThenByDescending(t => t.Id)
            .Select(t => ToResponse(t))
            .ToListAsync(ct);

    public async Task<TradeResponse?> GetAsync(Guid id, CancellationToken ct) =>
        await db
            .Trades.AsNoTracking()
            .Where(t => t.Id == id)
            .Select(t => ToResponse(t))
            .SingleOrDefaultAsync(ct);

    private static TradeResponse ToResponse(Trade t) =>
        new(t.Id, t.Symbol, t.Side, t.Quantity, t.Price, t.Timestamp);
}
