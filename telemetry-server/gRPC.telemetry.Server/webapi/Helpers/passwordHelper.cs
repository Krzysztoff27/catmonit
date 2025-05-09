using Konscious.Security.Cryptography;
using System.Security.Cryptography;
using System.Text;

namespace webapi.Helpers
{
    public class PasswordHelper
    {
    public static byte[] GenerateSalt()
        {
            byte[] salt = new byte[16];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
            return salt;
        }

        public static byte[] HashPassword(string password, byte[] salt)
        {
            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = 8,
                MemorySize = 65536, // 64 MB
                Iterations = 4
            };

            return argon2.GetBytes(32);
        }

        public static bool VerifyPassword(string password, byte[] salt, byte[] storedHash)
        {
            var newHash = HashPassword(password, salt);
            return CryptographicOperations.FixedTimeEquals(newHash, storedHash);
        }
    }
}