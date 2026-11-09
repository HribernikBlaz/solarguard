using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SolarGuard.Api.Migrations
{
    /// <inheritdoc />
    public partial class CenaElektrike : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ElectricityPrice",
                table: "Installations",
                type: "numeric(8,4)",
                precision: 8,
                scale: 4,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ElectricityPriceChanges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InstallationId = table.Column<Guid>(type: "uuid", nullable: false),
                    PricePerKwh = table.Column<decimal>(type: "numeric(8,4)", precision: 8, scale: 4, nullable: false),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElectricityPriceChanges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ElectricityPriceChanges_Installations_InstallationId",
                        column: x => x.InstallationId,
                        principalTable: "Installations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ElectricityPriceChanges_InstallationId_ValidFrom",
                table: "ElectricityPriceChanges",
                columns: new[] { "InstallationId", "ValidFrom" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ElectricityPriceChanges");

            migrationBuilder.DropColumn(
                name: "ElectricityPrice",
                table: "Installations");
        }
    }
}
