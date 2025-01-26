using Microsoft.AspNetCore.SignalR;
using ChatApp.Models;
using ChatApp.Services;

namespace ChatApp.Hubs;

public class ChatHub : Hub
{
    private readonly DatabaseService _dbService;
    private static readonly Dictionary<string, (string RoomId, string UserId)> _userConnections = new();

    public ChatHub(DatabaseService dbService)
    {
        _dbService = dbService;
    }

    private bool IsUserInRoom(string userId, string roomId)
    {
        return _userConnections.Values
            .Any(x => x.UserId == userId && x.RoomId == roomId);
    }

    public async Task JoinRoom(string roomId, string userId)
    {
        // Leave current room if any
        if (_userConnections.TryGetValue(Context.ConnectionId, out var currentRoom))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, currentRoom.RoomId);
            _userConnections.Remove(Context.ConnectionId);
        }

        // Get user info
        var user = await _dbService.GetUserByIdAsync(userId);
        if (user == null) return;

        // Check if user is already in the room before joining
        bool wasInRoom = IsUserInRoom(userId, roomId);

        // Load recent messages first
        var recentMessages = await _dbService.GetRecentMessagesAsync(roomId);
        await Clients.Caller.SendAsync("LoadRecentMessages", recentMessages);

        // Join new room
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        _userConnections[Context.ConnectionId] = (roomId, userId);

        // Only send join message if user wasn't already in the room
        if (!wasInRoom)
        {
            var joinMessage = new Message
            {
                UserId = userId,
                RoomId = roomId,
                Username = "System",
                Content = $"{user.Username} se ha unido a la sala",
                IsSystem = true,
                Timestamp = DateTime.UtcNow
            };
            await _dbService.SaveMessageAsync(joinMessage);
            await Clients.Group(roomId).SendAsync("ReceiveMessage", joinMessage);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_userConnections.TryGetValue(Context.ConnectionId, out var connection))
        {
            // Remove this connection
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, connection.RoomId);
            _userConnections.Remove(Context.ConnectionId);

            // Check if this was the user's last connection to the room
            var hasOtherConnections = _userConnections.Values
                .Any(x => x.UserId == connection.UserId && x.RoomId == connection.RoomId);

            if (!hasOtherConnections)
            {
                var user = await _dbService.GetUserByIdAsync(connection.UserId);
                if (user != null)
                {
                    var message = new Message
                    {
                        UserId = connection.UserId,
                        RoomId = connection.RoomId,
                        Username = "System",
                        Content = $"{user.Username} ha salido de la sala",
                        IsSystem = true,
                        Timestamp = DateTime.UtcNow
                    };
                    await _dbService.SaveMessageAsync(message);
                    await Clients.Group(connection.RoomId).SendAsync("ReceiveMessage", message);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string userId, string roomId, string content)
    {
        var user = await _dbService.GetUserByIdAsync(userId);
        if (user == null) return;

        var message = new Message
        {
            UserId = userId,
            Username = user.Username,
            RoomId = roomId,
            Content = content,
            Timestamp = DateTime.UtcNow,
            IsSystem = false
        };

        await _dbService.SaveMessageAsync(message);
        await Clients.Group(roomId).SendAsync("ReceiveMessage", message);
    }
}
