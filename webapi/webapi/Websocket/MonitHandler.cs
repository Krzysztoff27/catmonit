using System.Net.WebSockets;
using System.Text;
using webapi.Monitoring;

namespace webapi.Websocket
{
    public class MonitHandler
    {
        private readonly StorageMonit _storageMonitoring;

        public MonitHandler(StorageMonit storageMonitoring)
        {
            _storageMonitoring = storageMonitoring;
            _storageMonitoring.StartMonitoring();
        }

        public async Task HandleRequestAsync(HttpContext context)
        {
            var tokenHeader = context.Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(tokenHeader))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Authorization header missing.");
                return;
            }
            if (context.Request.Path.StartsWithSegments("/ws"))
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                    await AddWebSocket(tokenHeader, webSocket);
                }
                else
                {
                    context.Response.StatusCode = 400;
                    await context.Response.WriteAsync("Expected WebSocket request.");
                }
            }
        }

        private async Task AddWebSocket(string token, WebSocket webSocket)
        {
            var buffer = new byte[1024 * 4];
            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            var subscriber = new Subscriber(token, webSocket);

            while (!result.CloseStatus.HasValue)
            {
                string message = Encoding.UTF8.GetString(buffer, 0, result.Count);

                if (message == "start")
                {
                    _storageMonitoring.Subscribe(subscriber);
                }
                else if (message == "stop")
                {
                    _storageMonitoring.Unsubscribe(subscriber);
                }

                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            _storageMonitoring.Unsubscribe(subscriber);
            await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }
    }
}
