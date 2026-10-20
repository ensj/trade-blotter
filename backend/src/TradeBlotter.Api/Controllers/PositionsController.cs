using Microsoft.AspNetCore.Mvc;
using TradeBlotter.Api.Features.Positions;

namespace TradeBlotter.Api.Controllers;

[ApiController]
[Route("positions")]
public sealed class PositionsController(PositionService positions) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<PositionResponse>>(StatusCodes.Status200OK)]
    public async Task<IReadOnlyList<PositionResponse>> List(CancellationToken ct) =>
        await positions.ListAsync(ct);
}
