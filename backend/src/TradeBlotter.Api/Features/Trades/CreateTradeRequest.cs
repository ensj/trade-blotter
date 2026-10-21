using System.ComponentModel.DataAnnotations;

namespace TradeBlotter.Api.Features.Trades;

// Nullable so a missing field fails [Required] instead of binding to a default.
// A class, not a record: Swashbuckle reads [Required] from properties, not constructor parameters.
public sealed class CreateTradeRequest : IValidatableObject
{
    [Required]
    public string? Symbol { get; init; }

    [Required]
    public Side? Side { get; init; }

    [Required]
    public decimal? Quantity { get; init; }

    [Required]
    public decimal? Price { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext) =>
        TradeValidator.Validate(this);
}
