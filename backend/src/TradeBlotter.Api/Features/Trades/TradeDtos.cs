using System.ComponentModel.DataAnnotations;

namespace TradeBlotter.Api.Features.Trades;

// Nullable so a missing field fails [Required] instead of binding to a default.
// A class, not a record: Swashbuckle reads [Required] from properties, not constructor parameters.
public sealed class CreateTradeRequest
{
    [Required]
    public string? Symbol { get; init; }

    [Required]
    public Side? Side { get; init; }

    [Required]
    public decimal? Quantity { get; init; }

    [Required]
    public decimal? Price { get; init; }
}

public sealed record TradeResponse(
    Guid Id,
    string Symbol,
    Side Side,
    decimal Quantity,
    decimal Price,
    DateTime Timestamp
);
