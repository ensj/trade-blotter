using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using TradeBlotter.Api.Data;
using TradeBlotter.Api.Features.Positions;
using TradeBlotter.Api.Features.Trades;

namespace TradeBlotter.Api.Tests;

public class ContractTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient client = factory.CreateClient();

    [Theory]
    [InlineData("/trades")]
    [InlineData("/positions")]
    public async Task List_endpoints_return_an_empty_array(string path)
    {
        var response = await client.GetAsync(path);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("[]", await response.Content.ReadAsStringAsync());
    }

    [Theory]
    [InlineData("""{ "side": "Buy", "quantity": 1, "price": 1 }""", "symbol")]
    [InlineData("""{ "symbol": "AAPL", "quantity": 1, "price": 1 }""", "side")]
    [InlineData("""{ "symbol": "AAPL", "side": "Buy", "price": 1 }""", "quantity")]
    [InlineData("""{ "symbol": "AAPL", "side": "Buy", "quantity": 1 }""", "price")]
    public async Task Post_missing_field_returns_validation_problem(string body, string errorKey)
    {
        var response = await client.PostAsync("/trades", Json(body));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Contains(errorKey, problem!.Errors.Keys);
    }

    [Fact]
    public void Side_serializes_as_a_string()
    {
        var trade = new TradeResponse(Guid.Empty, "AAPL", Side.Sell, 1m, 2m, DateTime.UnixEpoch);

        Assert.Contains("\"side\":\"Sell\"", Serialize(trade));
    }

    [Fact]
    public void Example_responses_match_the_dtos()
    {
        var trades = Deserialize<TradeResponse[]>(Example("trades.json"));
        var positions = Deserialize<PositionResponse[]>(Example("positions.json"));

        Assert.Equal(Side.Buy, trades[0].Side);
        Assert.Equal(DateTimeKind.Utc, trades[0].Timestamp.Kind);
        Assert.Equal(187.25m, positions[0].AverageCost);
    }

    [Theory]
    [InlineData("TradeResponse", "id,symbol,side,quantity,price,timestamp")]
    [InlineData("PositionResponse", "symbol,netQuantity,averageCost")]
    [InlineData("CreateTradeRequest", "price,quantity,side,symbol")]
    public async Task Openapi_marks_every_field_the_api_always_sends_as_required(
        string schema,
        string fields
    )
    {
        using var doc = JsonDocument.Parse(await client.GetStringAsync("/swagger/v1/swagger.json"));
        var required = doc
            .RootElement.GetProperty("components")
            .GetProperty("schemas")
            .GetProperty(schema)
            .GetProperty("required")
            .EnumerateArray()
            .Select(e => e.GetString())
            .Order();

        Assert.Equal(fields.Split(',').Order(), required);
    }

    // Set UPDATE_OPENAPI=1 to rewrite docs/openapi.json from the running app.
    [Fact]
    public async Task Committed_openapi_document_matches_the_app()
    {
        var live = await client.GetStringAsync("/swagger/v1/swagger.json");
        var path = Path.Combine(RepoRoot(), "docs", "openapi.json");
        if (Environment.GetEnvironmentVariable("UPDATE_OPENAPI") == "1")
            await File.WriteAllTextAsync(path, live + "\n");

        Assert.Equal(live + "\n", await File.ReadAllTextAsync(path));
    }

    private string Serialize<T>(T value) => JsonSerializer.Serialize(value, MvcJsonOptions());

    private T Deserialize<T>(string json) => JsonSerializer.Deserialize<T>(json, MvcJsonOptions())!;

    private JsonSerializerOptions MvcJsonOptions() =>
        factory
            .Services.GetRequiredService<IOptions<Microsoft.AspNetCore.Mvc.JsonOptions>>()
            .Value.JsonSerializerOptions;

    private static StringContent Json(string body) => new(body, Encoding.UTF8, "application/json");

    private static string Example(string name) =>
        File.ReadAllText(Path.Combine(RepoRoot(), "docs", "examples", name));

    private static string RepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (!File.Exists(Path.Combine(dir.FullName, "global.json")))
            dir = dir.Parent!;
        return dir.FullName;
    }
}
