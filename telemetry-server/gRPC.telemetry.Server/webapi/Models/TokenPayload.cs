namespace webapi.Models
{
    public class TokenPayload
    {
        public long iat { get; set; } // issued at time
        public long exp { get; set; } // expiration time
        public uint id { get; set; } // user id
    }
}
