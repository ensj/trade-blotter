using TradeBlotter.Api.Features.Trades;

namespace TradeBlotter.Api.Data;

public sealed class Trade
{
    // SQLite only autoincrements an INTEGER PRIMARY KEY, so Sequence is the key and Id a unique alternate.
    public long Sequence { get; set; }
    public Guid Id { get; set; }
    public required string Symbol { get; set; }
    public Side Side { get; set; }
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public DateTime Timestamp { get; set; }
}
