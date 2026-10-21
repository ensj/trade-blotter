using System.ComponentModel.DataAnnotations;

namespace TradeBlotter.Api.Features.Trades;

// A property attribute, not IValidatableObject: MVC skips object-level validation when any
// [Required] fails, which would hide the other fields' errors.
[AttributeUsage(AttributeTargets.Property)]
public sealed class TradeRulesAttribute : ValidationAttribute
{
    // No error yields null, which is ValidationResult.Success.
    protected override ValidationResult? IsValid(object? value, ValidationContext context) =>
        TradeValidator
            .Validate((CreateTradeRequest)context.ObjectInstance)
            .FirstOrDefault(e => e.MemberNames.Contains(context.MemberName));
}
