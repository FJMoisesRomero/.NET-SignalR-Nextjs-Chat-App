using System.Security.Cryptography;
using ChatApp.Models;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace ChatApp.Services;

public class AuthService
{
    private readonly DatabaseService _dbService;

    public AuthService(DatabaseService dbService)
    {
        _dbService = dbService;
    }

    public async Task<User?> RegisterAsync(string username, string email, string password)
    {
        // Check if user already exists
        var existingUser = await _dbService.GetUserByUsernameAsync(username);
        if (existingUser != null)
        {
            return null;
        }

        // Create new user
        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = HashPassword(password)
        };

        return await _dbService.CreateUserAsync(user);
    }

    public async Task<User?> LoginAsync(string username, string password)
    {
        var user = await _dbService.GetUserByUsernameAsync(username);
        if (user == null)
        {
            return null;
        }

        if (!VerifyPassword(password, user.PasswordHash))
        {
            return null;
        }

        await _dbService.UpdateUserLastLoginAsync(user.Id!);
        return user;
    }

    private string HashPassword(string password)
    {
        // Generate a random salt
        byte[] salt = new byte[128 / 8];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        // Hash the password with the salt
        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 256 / 8));

        // Combine the salt and hash
        return $"{Convert.ToBase64String(salt)}.{hashed}";
    }

    private bool VerifyPassword(string password, string storedHash)
    {
        // Extract the salt and hash
        var parts = storedHash.Split('.');
        if (parts.Length != 2)
        {
            return false;
        }

        var salt = Convert.FromBase64String(parts[0]);
        var hash = parts[1];

        // Hash the password with the extracted salt
        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 256 / 8));

        return hash == hashed;
    }
}
