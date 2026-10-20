namespace TradeBlotter.Api.Features.Trades;

// Skeleton stub; Part 2 implements validation, persistence and ordering.
public sealed class TradeService
{
    public Task<TradeResponse> CreateAsync(CreateTradeRequest request, CancellationToken ct) =>
        throw new NotImplementedException();

    public Task<IReadOnlyList<TradeResponse>> ListAsync(CancellationToken ct) =>
        Task.FromResult<IReadOnlyList<TradeResponse>>([]);

    public Task<TradeResponse?> GetAsync(Guid id, CancellationToken ct) =>
        Task.FromResult<TradeResponse?>(null);
}
