using Microsoft.AspNetCore.Mvc;
using TradeBlotter.Api.Features.Trades;

namespace TradeBlotter.Api.Controllers;

[ApiController]
[Route("trades")]
public sealed class TradesController(TradeService trades) : ControllerBase
{
    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType<TradeResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TradeResponse>> Create(
        CreateTradeRequest request,
        CancellationToken ct
    )
    {
        var trade = await trades.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = trade.Id }, trade);
    }

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<TradeResponse>>(StatusCodes.Status200OK)]
    public async Task<IReadOnlyList<TradeResponse>> List(CancellationToken ct) =>
        await trades.ListAsync(ct);

    [HttpGet("{id:guid}")]
    [ProducesResponseType<TradeResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TradeResponse>> Get(Guid id, CancellationToken ct) =>
        await trades.GetAsync(id, ct) is { } trade ? trade : NotFound();
}
