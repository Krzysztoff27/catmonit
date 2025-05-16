public class Config
{
    public const string CM_JWT_SECRET = "0b13822dac0211d86f4ca04d435025d73e3c1754e9234d63725ea7d71b53f576";
    
    private static string CM_POSTGRES_SERVER = Environment.GetEnvironmentVariable("POSTGRES_SERVER") ?? "catmonit-db";
    private static string CM_POSTGRES_USER = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "catmonit-worker";
    private static string CM_POSTGRES_PASSWORD  = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "password";
    private static string CM_POSTGRES_DBNAME = Environment.GetEnvironmentVariable("POSTGRES_DBNAME") ?? "catmonit_base";
    
    public static string GetConnectionString() =>  $"Host={CM_POSTGRES_SERVER};Database={CM_POSTGRES_USER};Username={CM_POSTGRES_PASSWORD};Password={CM_POSTGRES_DBNAME};";
}