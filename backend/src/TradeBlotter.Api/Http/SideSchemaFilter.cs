using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using TradeBlotter.Api.Data;
using TradeBlotter.Api.Features.Trades;

namespace TradeBlotter.Api.Http;

// CreateTradeRequest.Side binds as a string so it can be validated with the other fields;
// the contract still documents it as the Side enum.
public sealed class SideSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(CreateTradeRequest))
            schema.Properties["side"] = context.SchemaGenerator.GenerateSchema(
                typeof(Side),
                context.SchemaRepository
            );
    }
}
