using System.Text.Json;
using System.Text.Json.Serialization;

namespace TradeBlotter.Api.Tests;

// What a client of the API needs to read its responses: web defaults plus string enums.
public static class TestJson
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };
}
