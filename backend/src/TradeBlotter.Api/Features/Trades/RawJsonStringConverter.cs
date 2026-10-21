using System.Text.Json;
using System.Text.Json.Serialization;

namespace TradeBlotter.Api.Features.Trades;

// Binds any JSON value as text so a bad value reaches validation instead of failing the whole body.
public sealed class RawJsonStringConverter : JsonConverter<string>
{
    public override string Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    ) =>
        reader.TokenType == JsonTokenType.String
            ? reader.GetString()!
            : JsonDocument.ParseValue(ref reader).RootElement.GetRawText();

    public override void Write(
        Utf8JsonWriter writer,
        string value,
        JsonSerializerOptions options
    ) => writer.WriteStringValue(value);
}
