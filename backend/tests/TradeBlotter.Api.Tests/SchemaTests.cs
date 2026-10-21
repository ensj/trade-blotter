using Microsoft.EntityFrameworkCore;
using TradeBlotter.Api.Data;

namespace TradeBlotter.Api.Tests;

public sealed class SchemaTests : IDisposable
{
    private readonly TestDb testDb = new();

    [Fact]
    public async Task A_row_written_as_raw_sql_reads_back_with_a_utc_timestamp()
    {
        await using (var db = testDb.NewContext())
        {
            await db.Database.ExecuteSqlRawAsync(
                """
                INSERT INTO Trades (Id, Symbol, Side, Quantity, Price, Timestamp)
                VALUES ('3F2B8C1E-6A4D-4E2B-9C7A-1D5E8F0A2B3C', 'AAPL', 'Sell', '25.5', '412.1',
                        '2026-10-19 14:03:11.123')
                """
            );
        }

        await using var read = testDb.NewContext();
        var trade = await read.Trades.SingleAsync(t =>
            t.Id == Guid.Parse("3f2b8c1e-6a4d-4e2b-9c7a-1d5e8f0a2b3c")
        );
        Assert.Equal(
            ("AAPL", Side.Sell, 25.5m, 412.1m),
            (trade.Symbol, trade.Side, trade.Quantity, trade.Price)
        );
        Assert.Equal(new DateTime(2026, 10, 19, 14, 3, 11, 123, DateTimeKind.Utc), trade.Timestamp);
        Assert.Equal(DateTimeKind.Utc, trade.Timestamp.Kind);
    }

    public void Dispose() => testDb.Dispose();
}
