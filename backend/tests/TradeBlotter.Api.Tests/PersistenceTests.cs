using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TradeBlotter.Api.Data;

namespace TradeBlotter.Api.Tests;

public class PersistenceTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Timestamp_round_trips_as_utc_and_serializes_with_z()
    {
        var timestamp = new DateTime(2026, 10, 19, 14, 3, 11, 123, DateTimeKind.Utc);
        var id = Guid.NewGuid();
        await using (var write = NewContext())
        {
            write.Trades.Add(
                new Trade
                {
                    Id = id,
                    Symbol = "AAPL",
                    Side = Side.Buy,
                    Quantity = 100m,
                    Price = 187.25m,
                    Timestamp = timestamp,
                }
            );
            await write.SaveChangesAsync();
        }

        await using var read = NewContext();
        var trade = await read.Trades.SingleAsync(t => t.Id == id);

        Assert.Equal(DateTimeKind.Utc, trade.Timestamp.Kind);
        Assert.Equal(timestamp, trade.Timestamp);
        Assert.Equal("\"2026-10-19T14:03:11.123Z\"", JsonSerializer.Serialize(trade.Timestamp));
    }

    [Fact]
    public async Task Decimals_round_trip_exactly()
    {
        var trade = NewTrade();
        trade.Quantity = 0.0001m;
        trade.Price = 999_999_999.9999m;
        await using (var write = NewContext())
        {
            write.Trades.Add(trade);
            await write.SaveChangesAsync();
        }

        await using var read = NewContext();
        var stored = await read.Trades.SingleAsync(t => t.Id == trade.Id);

        Assert.Equal(0.0001m, stored.Quantity);
        Assert.Equal(999_999_999.9999m, stored.Price);
    }

    private static Trade NewTrade() =>
        new()
        {
            Id = Guid.NewGuid(),
            Symbol = "MSFT",
            Side = Side.Sell,
            Quantity = 1m,
            Price = 1m,
            Timestamp = DateTime.UtcNow,
        };

    private AppDbContext NewContext() =>
        factory.Services.CreateScope().ServiceProvider.GetRequiredService<AppDbContext>();
}
