public static class Config
{
    public const string CM_HTTPS_SERVER_ADDRESS = "https://localhost:5001";
    public const string CM_WS_SERVER_ADDRESS = "wss://localhost:5001";
    public const string CM_SQL_PASSWORD = "mysecretpassword";
    public const string CM_SQLSERVER = "webapi-mysql-1";
    public const string CM_JWT_SECRET = "0b13822dac0211d86f4ca04d435025d73e3c1754e9234d63725ea7d71b53f576";
    public const string CM_CONNECTION_STRING = $"Server={Config.CM_SQLSERVER};Database=catmonit;User=root;Password={Config.CM_SQL_PASSWORD};";
}
