using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TradeBlotter.Api.Features.Trades;

// Nullable so a missing field fails [Required] instead of binding to a default.
// Side is a string so an unknown side is reported with the other invalid fields.
// A class, not a record: Swashbuckle reads [Required] from properties, not constructor parameters.
public sealed class CreateTradeRequest
{
    [Required]
    [TradeRules]
    public string? Symbol { get; init; }

    [Required]
    [TradeRules]
    [JsonConverter(typeof(RawJsonStringConverter))]
    public string? Side { get; init; }

    [Required]
    [TradeRules]
    public decimal? Quantity { get; init; }

    [Required]
    [TradeRules]
    public decimal? Price { get; init; }
}
