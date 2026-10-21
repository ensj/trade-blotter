using TradeBlotter.Api.Features.Trades;

namespace TradeBlotter.Api.Tests.Trades;

public class TradeValidatorTests
{
    [Theory]
    [InlineData("aapl", "AAPL")]
    [InlineData("  msft ", "MSFT")]
    [InlineData("brk.b", "BRK.B")]
    public void NormalizeSymbol_trims_and_upper_cases(string raw, string expected) =>
        Assert.Equal(expected, TradeValidator.NormalizeSymbol(raw));

    [Theory]
    [InlineData("A")]
    [InlineData("AAPL")]
    [InlineData("BRK.B")]
    [InlineData("RDS-A")]
    [InlineData("1234567890")]
    [InlineData(" spy ")]
    public void Valid_symbols_pass(string symbol) =>
        Assert.Empty(TradeValidator.Validate(Request(symbol: symbol)));

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("ABCDEFGHIJK")]
    [InlineData("AA PL")]
    [InlineData("AAPL$")]
    [InlineData("ÄPPL")]
    [InlineData("A_B")]
    public void Invalid_symbols_fail(string symbol) =>
        Assert.Equal(["Symbol"], ErrorKeys(Request(symbol: symbol)));

    [Theory]
    [InlineData("0.0001")]
    [InlineData("1")]
    [InlineData("1000000000")]
    [InlineData("1.50000")]
    public void Valid_amounts_pass(string amount)
    {
        var value = decimal.Parse(amount);

        Assert.Empty(TradeValidator.Validate(Request(quantity: value, price: value)));
    }

    [Theory]
    [InlineData("0")]
    [InlineData("-1")]
    [InlineData("1000000000.0001")]
    [InlineData("0.00001")]
    [InlineData("1.23456")]
    [InlineData("79228162514264337593543950335")]
    public void Invalid_amounts_fail(string amount)
    {
        var value = decimal.Parse(amount);

        Assert.Equal(["Quantity"], ErrorKeys(Request(quantity: value)));
        Assert.Equal(["Price"], ErrorKeys(Request(price: value)));
    }

    [Fact]
    public void Every_invalid_field_is_reported()
    {
        var errors = ErrorKeys(Request(symbol: "!", quantity: 0m, price: -1m));

        Assert.Equal(["Symbol", "Quantity", "Price"], errors);
    }

    [Fact]
    public void Errors_carry_a_message_naming_the_field()
    {
        var errors = TradeValidator.Validate(Request(symbol: "!", quantity: 0m, price: 0m));

        Assert.All(errors, e => Assert.StartsWith(e.MemberNames.Single(), e.ErrorMessage));
    }

    [Fact]
    public void Missing_fields_are_left_to_required()
    {
        Assert.Empty(TradeValidator.Validate(new CreateTradeRequest()));
    }

    private static string[] ErrorKeys(CreateTradeRequest request) =>
        TradeValidator.Validate(request).SelectMany(e => e.MemberNames).ToArray();

    internal static CreateTradeRequest Request(
        string symbol = "AAPL",
        Side side = Side.Buy,
        decimal quantity = 100m,
        decimal price = 187.25m
    ) =>
        new()
        {
            Symbol = symbol,
            Side = side,
            Quantity = quantity,
            Price = price,
        };
}
