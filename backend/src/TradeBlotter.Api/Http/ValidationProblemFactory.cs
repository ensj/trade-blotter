using System.Reflection;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Options;

namespace TradeBlotter.Api.Http;

// Replaces System.Text.Json's messages, which name .NET types, with one plain error per bad field,
// and keys every error by its camelCase JSON name.
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

        var services = context.HttpContext.RequestServices;
        var problem = services
            .GetRequiredService<ProblemDetailsFactory>()
            .CreateValidationProblemDetails(context.HttpContext, state);
        var naming = services
            .GetRequiredService<IOptions<JsonOptions>>()
            .Value.JsonSerializerOptions.PropertyNamingPolicy;
        if (naming is not null)
            RenameKeys(problem.Errors, naming);
        return new BadRequestObjectResult(problem)
        {
            ContentTypes = { "application/problem+json", "application/problem+xml" },
        };
    }

    // Model state keys are C# property names; clients send camelCase JSON, so key errors the same way.
    private static void RenameKeys(IDictionary<string, string[]> errors, JsonNamingPolicy naming)
    {
        var renamed = errors
            .GroupBy(e => naming.ConvertName(e.Key))
            .ToDictionary(g => g.Key, g => g.SelectMany(e => e.Value).ToArray());
        errors.Clear();
        foreach (var (key, messages) in renamed)
            errors[key] = messages;
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
        if (type == typeof(string))
            return $"{property.Name} must be a string.";
        if (type == typeof(decimal))
            return $"{property.Name} must be a number.";
        return $"{property.Name} has an invalid value.";
    }
}
