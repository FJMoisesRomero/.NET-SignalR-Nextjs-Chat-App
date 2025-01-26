using ChatApp.Models;
using ChatApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatRoomController : ControllerBase
{
    private readonly DatabaseService _dbService;

    public ChatRoomController(DatabaseService dbService)
    {
        _dbService = dbService;
    }

    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentRooms()
    {
        var rooms = await _dbService.GetRecentRoomsAsync();
        return Ok(rooms);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoom(string id)
    {
        var room = await _dbService.GetRoomByIdAsync(id);
        if (room == null)
        {
            return NotFound();
        }
        return Ok(room);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomRequest request)
    {
        var room = new ChatRoom
        {
            Name = request.Name,
            Description = request.Description,
            CreatedBy = request.UserId,
            Members = new List<string> { request.UserId }
        };

        room = await _dbService.CreateRoomAsync(room);
        return Ok(room);
    }

    [HttpGet("{roomId}/messages")]
    public async Task<IActionResult> GetRoomMessages(string roomId)
    {
        var messages = await _dbService.GetRecentMessagesAsync(roomId);
        return Ok(messages);
    }
}

public record CreateRoomRequest(string Name, string Description, string UserId);
