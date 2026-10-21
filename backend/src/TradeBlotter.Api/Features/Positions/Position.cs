namespace TradeBlotter.Api.Features.Positions;

// The calculator's unrounded result; PositionService rounds it into a PositionResponse.
public sealed record Position(string Symbol, decimal NetQuantity, decimal AverageCost);
