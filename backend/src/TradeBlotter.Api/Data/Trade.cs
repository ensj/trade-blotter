namespace TradeBlotter.Api.Data;

public sealed class Trade
{
    public Guid Id { get; set; }
    public required string Symbol { get; set; }
    public Side Side { get; set; }
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public DateTime Timestamp { get; set; }
}
