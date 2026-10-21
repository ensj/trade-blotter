using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace TradeBlotter.Api.Features.Trades;

public static partial class TradeValidator
{
    private const decimal MaxAmount = 1_000_000_000m;
    private const int MaxDecimalPlaces = 4;
    private const int MaxSymbolLength = 10;

    public static string NormalizeSymbol(string symbol) => symbol.Trim().ToUpperInvariant();

    // Missing fields are reported by [Required]; this checks the values that are present.
    public static IEnumerable<ValidationResult> Validate(CreateTradeRequest request)
    {
        if (request.Symbol is { } symbol && !IsValidSymbol(NormalizeSymbol(symbol)))
            yield return Error(
                $"Symbol must be 1-{MaxSymbolLength} characters of A-Z, 0-9, '.' or '-'.",
                nameof(request.Symbol)
            );
        if (request.Quantity is { } quantity && !IsValidAmount(quantity))
            yield return Error(AmountMessage(nameof(request.Quantity)), nameof(request.Quantity));
        if (request.Price is { } price && !IsValidAmount(price))
            yield return Error(AmountMessage(nameof(request.Price)), nameof(request.Price));
    }

    private static bool IsValidSymbol(string symbol) =>
        symbol.Length is >= 1 and <= MaxSymbolLength && SymbolPattern().IsMatch(symbol);

    private static bool IsValidAmount(decimal value) =>
        value > 0 && value <= MaxAmount && decimal.Round(value, MaxDecimalPlaces) == value;

    private static string AmountMessage(string field) =>
        $"{field} must be greater than 0, at most {MaxAmount:N0}, with at most {MaxDecimalPlaces} decimal places.";

    private static ValidationResult Error(string message, string member) => new(message, [member]);

    [GeneratedRegex("^[A-Z0-9.\\-]+$")]
    private static partial Regex SymbolPattern();
}
