using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;
using webapi.Monitoring;

namespace webapi.Controllers.websocket
{
    [ApiController]
    [Route("ws")]
    public class MonitorController : ControllerBase
    {
        public static StorageMonit storageMonitoring = new StorageMonit();
        [HttpGet("{token}")]
        public async Task Get(string token)
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                await addWebsocket(token, webSocket);
            }
            else
            {
                HttpContext.Response.StatusCode = 400;
            }
        }

        private async Task addWebsocket(string token, WebSocket webSocket)
        {
            var buffer = new byte[1024 * 4];
            WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            Subscriber suber = new Subscriber(token, webSocket);

            while (!result.CloseStatus.HasValue)
            {
                string message = System.Text.Encoding.UTF8.GetString(buffer, 0, result.Count);

                if (message == "start")
                {
                    storageMonitoring.Subscribe(suber);
                }
                else if (message == "stop")
                {
                    storageMonitoring.Unsubscribe(suber);
                }

                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            storageMonitoring.Unsubscribe(suber);
            await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }
    }
}
