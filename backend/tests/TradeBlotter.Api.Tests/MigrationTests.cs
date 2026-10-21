using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TradeBlotter.Api.Data;

namespace TradeBlotter.Api.Tests;

public sealed class MigrationTests : IDisposable
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");

    public MigrationTests() => connection.Open();

    [Fact]
    public async Task Upgrading_a_database_from_the_first_migration_keeps_its_trades()
    {
        await using var db = NewContext();
        await db.GetService<IMigrator>().MigrateAsync("InitialCreate");
        await db.Database.ExecuteSqlRawAsync(
            """
            INSERT INTO Trades (Id, Symbol, Side, Quantity, Price, Timestamp)
            VALUES ('3F2B8C1E-6A4D-4E2B-9C7A-1D5E8F0A2B3C', 'AAPL', 'Sell', '25.5', '412.1',
                    '2026-10-19 14:03:11.123')
            """
        );

        await db.Database.MigrateAsync();

        await using var read = NewContext();
        var trade = await read.Trades.SingleAsync(t =>
            t.Id == Guid.Parse("3f2b8c1e-6a4d-4e2b-9c7a-1d5e8f0a2b3c")
        );
        Assert.Equal(
            ("AAPL", Side.Sell, 25.5m, 412.1m),
            (trade.Symbol, trade.Side, trade.Quantity, trade.Price)
        );
        Assert.Equal(new DateTime(2026, 10, 19, 14, 3, 11, 123, DateTimeKind.Utc), trade.Timestamp);
    }

    private AppDbContext NewContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options);

    public void Dispose() => connection.Dispose();
}
