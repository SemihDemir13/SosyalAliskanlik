public class UserDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? FriendshipStatus { get; set; } 
}