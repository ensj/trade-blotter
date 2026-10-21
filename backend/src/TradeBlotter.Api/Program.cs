using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using TradeBlotter.Api.Data;
using TradeBlotter.Api.Features.Positions;
using TradeBlotter.Api.Features.Trades;
using TradeBlotter.Api.Http;

var builder = WebApplication.CreateBuilder(args);

builder
    .Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(allowIntegerValues: false)
        );
        // The contract sends money as JSON numbers; reject "100" instead of coercing it.
        o.JsonSerializerOptions.NumberHandling = JsonNumberHandling.Strict;
    })
    .ConfigureApiBehaviorOptions(o =>
        o.InvalidModelStateResponseFactory = ValidationProblemFactory.Create
    );
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SupportNonNullableReferenceTypes();
    o.SchemaFilter<SideSchemaFilter>();
    // Swashbuckle maps decimal to "double"; money is decimal end to end.
    o.MapType<decimal>(() => new OpenApiSchema { Type = "number", Format = "decimal" });
    o.MapType<decimal?>(() =>
        new OpenApiSchema
        {
            Type = "number",
            Format = "decimal",
            Nullable = true,
        }
    );
});

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlite(builder.Configuration.GetConnectionString("TradeBlotter"))
);
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<TradeService>();
builder.Services.AddScoped<PositionService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();

// Exposes the entry point to WebApplicationFactory in the test project.
public partial class Program;
