using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SolarGuard.Api.Migrations
{
    /// <inheritdoc />
    public partial class LastnikSistemaInDatumNamestitve : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Devices_InstallationId",
                table: "Devices");

            migrationBuilder.AddColumn<Guid>(
                name: "OwnerId",
                table: "Installations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "InstalledOn",
                table: "Devices",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            // obstoječe naprave dobijo datum namestitve sistema
            migrationBuilder.Sql(@"UPDATE ""Devices"" SET ""InstalledOn"" = i.""InstallationDate"" FROM ""Installations"" i WHERE i.""Id"" = ""Devices"".""InstallationId"";");

            migrationBuilder.CreateIndex(
                name: "IX_Installations_OwnerId",
                table: "Installations",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_InstallationId_SerialNumber",
                table: "Devices",
                columns: new[] { "InstallationId", "SerialNumber" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Installations_AspNetUsers_OwnerId",
                table: "Installations",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Installations_AspNetUsers_OwnerId",
                table: "Installations");

            migrationBuilder.DropIndex(
                name: "IX_Installations_OwnerId",
                table: "Installations");

            migrationBuilder.DropIndex(
                name: "IX_Devices_InstallationId_SerialNumber",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Installations");

            migrationBuilder.DropColumn(
                name: "InstalledOn",
                table: "Devices");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_InstallationId",
                table: "Devices",
                column: "InstallationId");
        }
    }
}
