using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace TradeBlotter.Api.Http;

// Turns skeleton stubs into 501 ProblemDetails instead of 500.
public sealed class NotImplementedExceptionHandler(IProblemDetailsService problemDetails)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken ct
    )
    {
        if (exception is not NotImplementedException)
            return false;

        context.Response.StatusCode = StatusCodes.Status501NotImplemented;
        return await problemDetails.TryWriteAsync(
            new()
            {
                HttpContext = context,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status501NotImplemented,
                    Title = "Not implemented",
                },
            }
        );
    }
}
