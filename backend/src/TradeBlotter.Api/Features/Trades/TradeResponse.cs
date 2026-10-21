namespace TradeBlotter.Api.Features.Trades;

public sealed record TradeResponse(
    Guid Id,
    string Symbol,
    Side Side,
    decimal Quantity,
    decimal Price,
    DateTime Timestamp
);
