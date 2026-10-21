using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using TradeBlotter.Api.Features.Positions;
using TradeBlotter.Api.Features.Trades;

namespace TradeBlotter.Api.Http;

// The API always sends every response field, so the contract marks them all required;
// otherwise generated clients see each one as optional.
public sealed class ResponseSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(TradeResponse) || context.Type == typeof(PositionResponse))
            schema.Required = new SortedSet<string>(schema.Properties.Keys);
    }
}
