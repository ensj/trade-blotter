using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TradeBlotter.Api.Data;

namespace TradeBlotter.Api.Tests;

// An in-memory SQLite database that lives as long as this object holds the connection open.
public sealed class TestDb : IDisposable
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");

    public TestDb()
    {
        connection.Open();
        using var db = NewContext();
        db.Database.Migrate();
    }

    public AppDbContext NewContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options);

    public void Dispose() => connection.Dispose();
}
