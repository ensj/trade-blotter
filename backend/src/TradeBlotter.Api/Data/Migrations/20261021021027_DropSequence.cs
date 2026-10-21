using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TradeBlotter.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class DropSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(name: "PK_Trades", table: "Trades");

            migrationBuilder.DropIndex(name: "IX_Trades_Id", table: "Trades");

            migrationBuilder.DropColumn(name: "Sequence", table: "Trades");

            migrationBuilder.AddPrimaryKey(name: "PK_Trades", table: "Trades", column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(name: "PK_Trades", table: "Trades");

            migrationBuilder
                .AddColumn<long>(
                    name: "Sequence",
                    table: "Trades",
                    type: "INTEGER",
                    nullable: false,
                    defaultValue: 0L
                )
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddPrimaryKey(name: "PK_Trades", table: "Trades", column: "Sequence");

            migrationBuilder.CreateIndex(
                name: "IX_Trades_Id",
                table: "Trades",
                column: "Id",
                unique: true
            );
        }
    }
}
