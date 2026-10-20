namespace TradeBlotter.Api.Features.Positions;

public sealed record PositionResponse(string Symbol, decimal NetQuantity, decimal AverageCost);
