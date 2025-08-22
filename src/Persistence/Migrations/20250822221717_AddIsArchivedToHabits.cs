using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SosyalAliskanlikApp.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIsArchivedToHabits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Habits",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Habits");
        }
    }
}
