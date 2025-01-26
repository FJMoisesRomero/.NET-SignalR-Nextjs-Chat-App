using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ChatApp.Models;

public class Message
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("UserId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("Username")]
    public string Username { get; set; } = null!;

    [BsonElement("RoomId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string RoomId { get; set; } = null!;

    [BsonElement("Content")]
    public string Content { get; set; } = null!;

    [BsonElement("Timestamp")]
    public DateTime Timestamp { get; set; }

    [BsonElement("IsSystem")]
    public bool IsSystem { get; set; }
}
