using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SosyalAliskanlikApp.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBadgeSystemAndSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RelatedHabitId",
                table: "UserBadges",
                type: "uuid",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Badges",
                columns: new[] { "Id", "Code", "CreatedAt", "Description", "IconUrl", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("4d4d4d4d-4444-4444-8444-444444444444"), "TOTAL_10_COMPLETIONS", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Toplamda 10 kez bir alışkanlığı tamamladın.", "/badges/total_10.svg", "Acemi Takipçi", null },
                    { new Guid("5e5e5e5e-5555-4555-8555-555555555555"), "TOTAL_50_COMPLETIONS", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Toplamda 50 kez bir alışkanlığı tamamladın.", "/badges/total_50.svg", "Çırak Takipçi", null },
                    { new Guid("843425f1-3558-4d57-b672-466f9a53f191"), "STREAK_7_DAYS", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bir alışkanlıkta 7 günlük seriye ulaştın.", "/badges/streak_7.png", "İstikrar Abidesi (7 Gün)", null },
                    { new Guid("e838e55e-149a-41d3-a4c3-a36a2656919e"), "STREAK_30_DAYS", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bir alışkanlıkta 30 günlük seriye ulaştın.", "/badges/streak_30.png", "Usta Takipçi (30 Gün)", null },
                    { new Guid("ef70211c-3333-40a2-8233-a3a82f254593"), "FIRST_COMPLETION", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "İlk alışkanlığını başarıyla tamamladın.", "/badges/first_step.png", "İlk Adım", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserBadges_RelatedHabitId",
                table: "UserBadges",
                column: "RelatedHabitId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserBadges_Habits_RelatedHabitId",
                table: "UserBadges",
                column: "RelatedHabitId",
                principalTable: "Habits",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserBadges_Habits_RelatedHabitId",
                table: "UserBadges");

            migrationBuilder.DropIndex(
                name: "IX_UserBadges_RelatedHabitId",
                table: "UserBadges");

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: new Guid("4d4d4d4d-4444-4444-8444-444444444444"));

            migrationBuilder.DeleteData(
                table: "Badges",
                keyColumn: "Id",
                keyValue: new Guid("5e5e5e5e-5555-4555-8555-555555555555"));

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

            migrationBuilder.DropColumn(
                name: "RelatedHabitId",
                table: "UserBadges");
        }
    }
}
