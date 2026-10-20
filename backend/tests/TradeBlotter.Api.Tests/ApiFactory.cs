using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TradeBlotter.Api.Tests;

// Each fixture gets its own throwaway SQLite file.
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string dbPath = Path.Combine(
        Path.GetTempPath(),
        $"trade-blotter-test-{Guid.NewGuid():N}.db"
    );

    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.UseSetting("ConnectionStrings:TradeBlotter", $"Data Source={dbPath}");

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
        File.Delete(dbPath);
    }
}
