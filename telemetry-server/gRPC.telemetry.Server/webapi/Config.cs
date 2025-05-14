public static class Config
{
    public const string CM_JWT_SECRET = "0b13822dac0211d86f4ca04d435025d73e3c1754e9234d63725ea7d71b53f576";

    public const string CM_POSTGRES_SERVER = "catmonit-db";
    public const string CM_POSTGRES_USER = "user";
    public const string CM_POSTGRES_PASSWORD = "password";
    public const string CM_POSTGRES_DBNAME = "catmonit_base";
    public const string CM_POSTGRES_CONNECTION_STRING = $"Host={Config.CM_POSTGRES_SERVER};Database={Config.CM_POSTGRES_DBNAME};Username={Config.CM_POSTGRES_USER};Password={Config.CM_POSTGRES_PASSWORD};";
}
