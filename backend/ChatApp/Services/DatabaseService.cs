using MongoDB.Driver;
using MongoDB.Bson;
using ChatApp.Models;
using Microsoft.Extensions.Configuration;

namespace ChatApp.Services;

public class DatabaseService
{
    private readonly IMongoDatabase _database;
    private readonly IMongoCollection<User> _users;
    private readonly IMongoCollection<ChatRoom> _chatRooms;
    private readonly IMongoCollection<Message> _messages;

    public DatabaseService(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoDB"));
        _database = client.GetDatabase("chatapp");
        _users = _database.GetCollection<User>("users");
        _chatRooms = _database.GetCollection<ChatRoom>("chatRooms");
        _messages = _database.GetCollection<Message>("messages");
        
        CreateIndexes();
    }

    private void CreateIndexes()
    {
        // User indexes
        var userIndexes = _users.Indexes.List().ToList();
        if (!userIndexes.Any(i => i["name"] == "Username_1"))
        {
            var indexKeysDefinition = Builders<User>.IndexKeys.Ascending(u => u.Username);
            _users.Indexes.CreateOne(new CreateIndexModel<User>(indexKeysDefinition, new CreateIndexOptions { Unique = true }));
        }

        if (!userIndexes.Any(i => i["name"] == "Email_1"))
        {
            var indexKeysDefinition = Builders<User>.IndexKeys.Ascending(u => u.Email);
            _users.Indexes.CreateOne(new CreateIndexModel<User>(indexKeysDefinition, new CreateIndexOptions { Unique = true }));
        }

        // Room indexes
        var roomIndexes = _chatRooms.Indexes.List().ToList();
        if (!roomIndexes.Any(i => i["name"] == "Name_1"))
        {
            var indexKeysDefinition = Builders<ChatRoom>.IndexKeys.Ascending(r => r.Name);
            _chatRooms.Indexes.CreateOne(new CreateIndexModel<ChatRoom>(indexKeysDefinition, new CreateIndexOptions { Unique = true }));
        }

        // Message indexes
        var messageIndexes = _messages.Indexes.List().ToList();
        if (!messageIndexes.Any(i => i["name"] == "RoomId_1_Timestamp_-1"))
        {
            var indexKeysDefinition = Builders<Message>.IndexKeys
                .Ascending(m => m.RoomId)
                .Descending(m => m.Timestamp);
            _messages.Indexes.CreateOne(new CreateIndexModel<Message>(indexKeysDefinition));
        }
    }

    // User methods
    public async Task<User?> GetUserByIdAsync(string id)
        => await _users.Find(u => u.Id == id).FirstOrDefaultAsync();

    public async Task<User?> GetUserByUsernameAsync(string username)
        => await _users.Find(u => u.Username == username).FirstOrDefaultAsync();

    public async Task<User> CreateUserAsync(User user)
    {
        await _users.InsertOneAsync(user);
        return user;
    }

    public async Task UpdateUserLastLoginAsync(string userId)
    {
        var update = Builders<User>.Update.Set(u => u.LastLogin, DateTime.UtcNow);
        await _users.UpdateOneAsync(u => u.Id == userId, update);
    }

    // Room methods
    public async Task<List<ChatRoom>> GetRecentRoomsAsync(int limit = 10)
        => await _chatRooms.Find(_ => true)
            .SortByDescending(r => r.LastActivity)
            .Limit(limit)
            .ToListAsync();

    public async Task<ChatRoom?> GetRoomByIdAsync(string id)
        => await _chatRooms.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task<ChatRoom> CreateRoomAsync(ChatRoom room)
    {
        await _chatRooms.InsertOneAsync(room);
        return room;
    }

    public async Task UpdateRoomLastActivityAsync(string roomId)
    {
        var update = Builders<ChatRoom>.Update.Set(r => r.LastActivity, DateTime.UtcNow);
        await _chatRooms.UpdateOneAsync(r => r.Id == roomId, update);
    }

    // Message methods
    public async Task<List<Message>> GetRecentMessagesAsync(string roomId, int limit = 50)
        => await _messages.Find(m => m.RoomId == roomId)
            .SortByDescending(m => m.Timestamp)
            .Limit(limit)
            .ToListAsync();

    public async Task<Message> SaveMessageAsync(Message message)
    {
        await _messages.InsertOneAsync(message);
        await UpdateRoomLastActivityAsync(message.RoomId);
        return message;
    }
}
