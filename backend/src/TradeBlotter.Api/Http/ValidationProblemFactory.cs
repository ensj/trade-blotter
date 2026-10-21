using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace TradeBlotter.Api.Http;

// Replaces System.Text.Json's messages, which name .NET types, with one plain error per bad field.
public static class ValidationProblemFactory
{
    public const string InvalidBodyMessage = "The request body is not a valid JSON trade.";

    public static IActionResult Create(ActionContext context)
    {
        var jsonPaths = context
            .ModelState.Where(e => e.Key.StartsWith('$') && e.Value!.Errors.Count > 0)
            .Select(e => e.Key)
            .ToList();
        var state = jsonPaths.Count == 0 ? context.ModelState : Translate(jsonPaths, context);

        var problem = context
            .HttpContext.RequestServices.GetRequiredService<ProblemDetailsFactory>()
            .CreateValidationProblemDetails(context.HttpContext, state);
        return new BadRequestObjectResult(problem)
        {
            ContentTypes = { "application/problem+json", "application/problem+xml" },
        };
    }

    // Keeps only the JSON errors: the "request field is required" error that follows a failed bind is noise.
    private static ModelStateDictionary Translate(List<string> paths, ActionContext context)
    {
        var bodyType = context
            .ActionDescriptor.Parameters.FirstOrDefault(p =>
                p.BindingInfo?.BindingSource == BindingSource.Body
            )
            ?.ParameterType;
        var state = new ModelStateDictionary();
        foreach (var path in paths)
        {
            var property = bodyType?.GetProperty(
                TopLevelName(path),
                BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase
            );
            if (property is null)
                state.AddModelError("$", InvalidBodyMessage);
            else
                state.AddModelError(property.Name, MessageFor(property));
        }
        return state;
    }

    // "$.side" → "side"; "$" and "$[0]" have no property name.
    private static string TopLevelName(string path) =>
        path.StartsWith("$.") ? path[2..].Split('.', '[')[0] : "";

    private static string MessageFor(PropertyInfo property)
    {
        var type = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
        if (type.IsEnum)
            return $"{property.Name} must be {string.Join(" or ", Enum.GetNames(type))}.";
        if (type == typeof(string))
            return $"{property.Name} must be a string.";
        if (type == typeof(decimal))
            return $"{property.Name} must be a number.";
        return $"{property.Name} has an invalid value.";
    }
}
