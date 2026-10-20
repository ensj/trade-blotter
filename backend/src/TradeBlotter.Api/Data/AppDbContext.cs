using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace TradeBlotter.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Trade> Trades => Set<Trade>();

    // SQLite drops DateTimeKind; every stored DateTime is UTC, so mark reads as UTC to keep the Z on serialization.
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder) =>
        configurationBuilder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var trade = modelBuilder.Entity<Trade>();
        trade.HasKey(t => t.Sequence);
        trade.HasIndex(t => t.Id).IsUnique();
        trade.Property(t => t.Symbol).HasMaxLength(10);
        trade.Property(t => t.Side).HasConversion<string>().HasMaxLength(4);
        trade.HasIndex(t => t.Timestamp);
    }
}

internal sealed class UtcDateTimeConverter()
    : ValueConverter<DateTime, DateTime>(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
