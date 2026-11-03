using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SolarGuard.Api.Migrations
{
    /// <inheritdoc />
    public partial class ServisniNalogi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TechnicianId",
                table: "Installations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ServiceOrders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AlarmId = table.Column<Guid>(type: "uuid", nullable: false),
                    InstallationId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssigneeId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceOrders_Alarms_AlarmId",
                        column: x => x.AlarmId,
                        principalTable: "Alarms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceOrders_AspNetUsers_AssigneeId",
                        column: x => x.AssigneeId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceOrders_Installations_InstallationId",
                        column: x => x.InstallationId,
                        principalTable: "Installations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Installations_TechnicianId",
                table: "Installations",
                column: "TechnicianId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_AlarmId",
                table: "ServiceOrders",
                column: "AlarmId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_AssigneeId_Status",
                table: "ServiceOrders",
                columns: new[] { "AssigneeId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_InstallationId",
                table: "ServiceOrders",
                column: "InstallationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Installations_AspNetUsers_TechnicianId",
                table: "Installations",
                column: "TechnicianId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Installations_AspNetUsers_TechnicianId",
                table: "Installations");

            migrationBuilder.DropTable(
                name: "ServiceOrders");

            migrationBuilder.DropIndex(
                name: "IX_Installations_TechnicianId",
                table: "Installations");

            migrationBuilder.DropColumn(
                name: "TechnicianId",
                table: "Installations");
        }
    }
}
