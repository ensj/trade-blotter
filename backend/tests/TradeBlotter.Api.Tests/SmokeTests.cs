using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TradeBlotter.Api.Tests;

public class SmokeTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Swagger_document_is_served()
    {
        var response = await factory.CreateClient().GetAsync("/swagger/v1/swagger.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
