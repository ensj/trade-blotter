using System.Net;
using System.Net.Http.Json;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace TradeBlotter.Api.Tests;

public sealed class ErrorHandlingTests : IDisposable
{
    private const string ProblemJson = "application/problem+json";

    private readonly ApiFactory factory = new();

    [Theory]
    [InlineData("""{ "symbol": "AAPL", "side": "Buy", "quantity": -1, "price": 1 }""", "Quantity")]
    [InlineData("", "")]
    public async Task Bad_request_bodies_return_400_validation_problem(string body, string key)
    {
        var problem = await PostExpectingValidationProblem(body);

        Assert.Contains(key, problem.Errors.Keys);
    }

    [Theory]
    [InlineData(
        """{ "symbol": "AAPL", "side": "Short", "quantity": 1, "price": 1 }""",
        "Side",
        "Side must be Buy or Sell."
    )]
    [InlineData(
        """{ "symbol": "AAPL", "side": 0, "quantity": 1, "price": 1 }""",
        "Side",
        "Side must be Buy or Sell."
    )]
    [InlineData(
        """{ "symbol": "AAPL", "Side": "buy!", "quantity": 1, "price": 1 }""",
        "Side",
        "Side must be Buy or Sell."
    )]
    [InlineData(
        """{ "symbol": "AAPL", "side": "Buy", "quantity": "1", "price": 1 }""",
        "Quantity",
        "Quantity must be a number."
    )]
    [InlineData(
        """{ "symbol": "AAPL", "side": "Buy", "quantity": 1e30, "price": 1 }""",
        "Quantity",
        "Quantity must be a number."
    )]
    [InlineData(
        """{ "symbol": "AAPL", "side": "Buy", "quantity": 1, "price": true }""",
        "Price",
        "Price must be a number."
    )]
    [InlineData(
        """{ "symbol": 42, "side": "Buy", "quantity": 1, "price": 1 }""",
        "Symbol",
        "Symbol must be a string."
    )]
    [InlineData(
        """{ "symbol": "AAPL", "side": "Buy", "quantity": 1, """,
        "$",
        "The request body is not a valid JSON trade."
    )]
    [InlineData("""[1, 2]""", "$", "The request body is not a valid JSON trade.")]
    public async Task Json_binding_errors_return_one_clean_error(
        string body,
        string key,
        string message
    )
    {
        var problem = await PostExpectingValidationProblem(body);

        var error = Assert.Single(problem.Errors);
        Assert.Equal(key, error.Key);
        Assert.Equal([message], error.Value);
    }

    [Fact]
    public async Task Json_null_body_is_a_validation_problem_not_a_crash()
    {
        var problem = await PostExpectingValidationProblem("null");

        Assert.NotEmpty(problem.Errors);
    }

    private async Task<ValidationProblemDetails> PostExpectingValidationProblem(string body)
    {
        var response = await factory
            .CreateClient()
            .PostAsync("/trades", new StringContent(body, Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Equal(400, problem!.Status);
        return problem;
    }

    [Fact]
    public async Task Non_json_body_returns_415_problem()
    {
        var response = await factory
            .CreateClient()
            .PostAsync("/trades", new StringContent("symbol=AAPL", Encoding.UTF8, "text/plain"));

        await AssertProblem(response, HttpStatusCode.UnsupportedMediaType);
    }

    [Theory]
    [InlineData("/trades/3f2b8c1e-6a4d-4e2b-9c7a-1d5e8f0a2b3c")]
    [InlineData("/trades/not-a-guid")]
    [InlineData("/nowhere")]
    public async Task Unknown_resources_return_404_problem(string path)
    {
        var response = await factory.CreateClient().GetAsync(path);

        await AssertProblem(response, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Unhandled_exception_returns_500_problem_without_internals_outside_development()
    {
        var client = factory
            .WithWebHostBuilder(b =>
                b.UseEnvironment("Production")
                    .ConfigureTestServices(s => s.AddSingleton<TimeProvider, BrokenClock>())
            )
            .CreateClient();

        var response = await client.PostAsync(
            "/trades",
            new StringContent(
                """{ "symbol": "AAPL", "side": "Buy", "quantity": 1, "price": 1 }""",
                Encoding.UTF8,
                "application/json"
            )
        );

        await AssertProblem(response, HttpStatusCode.InternalServerError);
        var body = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain(BrokenClock.Message, body);
        Assert.DoesNotContain(nameof(BrokenClock), body);
        Assert.DoesNotContain("   at ", body);
    }

    private static async Task AssertProblem(HttpResponseMessage response, HttpStatusCode status)
    {
        Assert.Equal(status, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal((int)status, problem!.Status);
        Assert.False(string.IsNullOrEmpty(problem.Title));
    }

    private sealed class BrokenClock : TimeProvider
    {
        public const string Message = "clock exploded";

        public override DateTimeOffset GetUtcNow() => throw new InvalidOperationException(Message);
    }

    public void Dispose() => factory.Dispose();
}
