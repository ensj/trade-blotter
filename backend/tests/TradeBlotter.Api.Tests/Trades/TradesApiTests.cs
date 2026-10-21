using System.Net;
using System.Net.Http.Json;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Time.Testing;
using TradeBlotter.Api.Features.Trades;

namespace TradeBlotter.Api.Tests.Trades;

public sealed class TradesApiTests : IDisposable
{
    private static readonly DateTimeOffset Start = new(2026, 10, 19, 14, 3, 11, 123, TimeSpan.Zero);

    private readonly FakeTimeProvider clock = new(Start);
    private readonly ApiFactory factory = new();
    private readonly HttpClient client;

    public TradesApiTests() =>
        client = factory
            .WithWebHostBuilder(b =>
                b.ConfigureTestServices(s => s.AddSingleton<TimeProvider>(clock))
            )
            .CreateClient();

    [Fact]
    public async Task Post_returns_201_with_location_and_the_trade()
    {
        var response = await Post(
            """{ "symbol": " aapl", "side": "Buy", "quantity": 100, "price": 187.25 }"""
        );

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var trade = await response.Content.ReadFromJsonAsync<TradeResponse>(TestJson.Options);
        Assert.Equal("AAPL", trade!.Symbol);
        Assert.Equal(Side.Buy, trade.Side);
        Assert.Equal(100m, trade.Quantity);
        Assert.Equal(187.25m, trade.Price);
        Assert.Equal($"/trades/{trade.Id}", response.Headers.Location?.AbsolutePath);
        Assert.Contains(
            "\"timestamp\":\"2026-10-19T14:03:11.123Z\"",
            await response.Content.ReadAsStringAsync()
        );
    }

    [Fact]
    public async Task Location_resolves_to_the_created_trade()
    {
        var created = await Post(
            """{ "symbol": "MSFT", "side": "Sell", "quantity": 25.5, "price": 412.1 }"""
        );

        var fetched = await client.GetAsync(created.Headers.Location);

        Assert.Equal(HttpStatusCode.OK, fetched.StatusCode);
        Assert.Equal(
            await created.Content.ReadFromJsonAsync<TradeResponse>(TestJson.Options),
            await fetched.Content.ReadFromJsonAsync<TradeResponse>(TestJson.Options)
        );
    }

    [Fact]
    public async Task Get_lists_trades_newest_first()
    {
        await Post("""{ "symbol": "A", "side": "Buy", "quantity": 1, "price": 1 }""");
        clock.Advance(TimeSpan.FromMinutes(1));
        await Post("""{ "symbol": "B", "side": "Buy", "quantity": 1, "price": 1 }""");
        await Post("""{ "symbol": "C", "side": "Buy", "quantity": 1, "price": 1 }""");

        var trades = await client.GetFromJsonAsync<TradeResponse[]>("/trades", TestJson.Options);

        Assert.Equal(["C", "B", "A"], trades!.Select(t => t.Symbol));
    }

    [Theory]
    [InlineData(
        """{ "symbol": "TOOLONGSYMBOL", "side": "Buy", "quantity": 1, "price": 1 }""",
        "Symbol"
    )]
    [InlineData("""{ "symbol": "AAPL", "side": "Buy", "quantity": 0, "price": 1 }""", "Quantity")]
    [InlineData(
        """{ "symbol": "AAPL", "side": "Buy", "quantity": 1, "price": 1.23456 }""",
        "Price"
    )]
    public async Task Post_invalid_values_returns_validation_problem(string body, string key)
    {
        var response = await Post(body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Equal([key], problem!.Errors.Keys);
        Assert.Empty(
            await client.GetFromJsonAsync<TradeResponse[]>("/trades", TestJson.Options) ?? []
        );
    }

    private Task<HttpResponseMessage> Post(string body) =>
        client.PostAsync("/trades", new StringContent(body, Encoding.UTF8, "application/json"));

    public void Dispose() => factory.Dispose();
}
