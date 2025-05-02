using MySql.Data.MySqlClient;
using System.Net.WebSockets;
using System.Text;
using webapi.Controllers.websocket;
using webapi.Monitoring;


static async Task Echo(WebSocket webSocket)
{
    var buffer = new byte[1024 * 4];
    WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
    while (!result.CloseStatus.HasValue)
    {
        string receivedMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
        string responseMessage = $"Echo: {receivedMessage}";
        var responseBytes = Encoding.UTF8.GetBytes(responseMessage);

        await webSocket.SendAsync(new ArraySegment<byte>(responseBytes, 0, responseBytes.Length),
                                  result.MessageType,
                                  result.EndOfMessage,
                                  CancellationToken.None);

        result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
    }
    await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddControllers();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}



app.UseWebSockets();




app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapControllerRoute(
    name: "json",
    pattern: "{controller=Test}/{action=Get}/{id?}");


app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.UseEndpoints(
    endpoints => { 
        endpoints.MapControllers(); 
    }
);

MonitorController.storageMonitoring.StartMonitoring();
/*
string connectionString = "Server=webapi-mysql-1;Database=catmonit;User=root;Password=mysecretpassword;";

using (MySqlConnection conn = new MySqlConnection(connectionString))
{
    conn.Open();

    string query = "SELECT * FROM users";
    MySqlCommand cmd = new MySqlCommand(query, conn);

    using (MySqlDataReader reader = cmd.ExecuteReader())
    {
        while (reader.Read())
        {
            string msg = reader["username"].ToString();
        }
    }
}
*/

app.Run();

