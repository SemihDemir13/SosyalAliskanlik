using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SosyalAliskanlikApp.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialBadges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Badges",
                columns: new[] { "Id", "Code", "CreatedAt", "Description", "IconUrl", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("843425f1-3558-4d57-b672-466f9a53f191"), "STREAK_7_DAYS", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bir alışkanlıkta 7 günlük seriye ulaştın.", "/badges/streak_7.png", "İstikrar Abidesi (7 Gün)", null },
                    { new Guid("e838e55e-149a-41d3-a4c3-a36a2656919e"), "STREAK_30_DAYS", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bir alışkanlıkta 30 günlük seriye ulaştın.", "/badges/streak_30.png", "Usta Takipçi (30 Gün)", null },
                    { new Guid("ef70211c-3333-40a2-8233-a3a82f254593"), "FIRST_COMPLETION", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "İlk alışkanlığını başarıyla tamamladın.", "/badges/first_step.png", "İlk Adım", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: new Guid("843425f1-3558-4d57-b672-466f9a53f191"));

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: new Guid("e838e55e-149a-41d3-a4c3-a36a2656919e"));

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: new Guid("ef70211c-3333-40a2-8233-a3a82f254593"));
        }
    }
}
