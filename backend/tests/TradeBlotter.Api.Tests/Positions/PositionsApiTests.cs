using System.Net;
using System.Net.Http.Json;
using System.Text;
using TradeBlotter.Api.Features.Positions;

namespace TradeBlotter.Api.Tests.Positions;

public sealed class PositionsApiTests : IDisposable
{
    private readonly ApiFactory factory = new();

    [Fact]
    public async Task Positions_reflect_posted_trades()
    {
        var client = factory.CreateClient();
        foreach (
            var body in new[]
            {
                """{ "symbol": "msft", "side": "Sell", "quantity": 25.5, "price": 412.1 }""",
                """{ "symbol": "AAPL", "side": "Buy", "quantity": 100, "price": 10 }""",
                """{ "symbol": "AAPL", "side": "Buy", "quantity": 100, "price": 20 }""",
                """{ "symbol": "TSLA", "side": "Buy", "quantity": 5, "price": 200 }""",
                """{ "symbol": "TSLA", "side": "Sell", "quantity": 5, "price": 210 }""",
            }
        )
            (
                await client.PostAsync(
                    "/trades",
                    new StringContent(body, Encoding.UTF8, "application/json")
                )
            ).EnsureSuccessStatusCode();

        var response = await client.GetAsync("/positions");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [new("AAPL", 200m, 15m), new("MSFT", -25.5m, 412.1m)],
            await response.Content.ReadFromJsonAsync<PositionResponse[]>(TestJson.Options)
        );
    }

    public void Dispose() => factory.Dispose();
}
