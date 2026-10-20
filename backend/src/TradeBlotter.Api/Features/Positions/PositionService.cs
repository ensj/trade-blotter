namespace TradeBlotter.Api.Features.Positions;

// Skeleton stub; Part 2 computes positions from trade history.
public sealed class PositionService
{
    public Task<IReadOnlyList<PositionResponse>> ListAsync(CancellationToken ct) =>
        Task.FromResult<IReadOnlyList<PositionResponse>>([]);
}
