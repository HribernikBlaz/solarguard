using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SolarGuard.Api.Migrations
{
    /// <inheritdoc />
    public partial class ServisniNaloziZgodovina : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "ServiceOrders",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ServiceOrderChanges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ChangedById = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceOrderChanges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceOrderChanges_AspNetUsers_ChangedById",
                        column: x => x.ChangedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceOrderChanges_ServiceOrders_ServiceOrderId",
                        column: x => x.ServiceOrderId,
                        principalTable: "ServiceOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrderChanges_ChangedById",
                table: "ServiceOrderChanges",
                column: "ChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrderChanges_ServiceOrderId_ChangedAt",
                table: "ServiceOrderChanges",
                columns: new[] { "ServiceOrderId", "ChangedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceOrderChanges");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "ServiceOrders");
        }
    }
}
