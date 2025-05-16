using System.Net.WebSockets;
using System.Text;
using webapi.Monitoring;
using webapi.Helpers;
using System.Text.Json;

namespace webapi.Websocket
{
    public class NetworkMonitHandler // handler just for websockets. Delegates websockets to NetworkMonit
    {
        public static NetworkMonitHandler instance { get; } = new NetworkMonitHandler();

        public async Task HandleRequestAsync(HttpContext context)
        {
            var token = context.Request.Query["Authentication"].ToString();
            if (context.WebSockets.IsWebSocketRequest)
            {
                TokenStatusAndPayload statNpayload = TokenValidator.validate(token);
                if (statNpayload.status == TokenStatus.valid)
                {
                    using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                    Subscriber sub = SubscriberHelper.createSubscriber(statNpayload.payload.id, webSocket);

                    await AddWebSocket(sub);
                }
                else
                {
                    var response = TokenValidator.getReturnValue(statNpayload.status);
                    context.Response.StatusCode = response.statusCode;
                    await context.Response.WriteAsJsonAsync(response.message);
                }
            }
        }
        private void onWebsocketClose(Subscriber subber)
        {

            NetworkMonit.Instance.Unsubscribe(subber);
        }

        private async Task AddWebSocket(Subscriber potentialSubscriber)
        {
            var buffer = new byte[1024 * 4];

            while (potentialSubscriber.WebSocket.State == WebSocketState.Open)
            {
                try
                {
                    var result = await potentialSubscriber.WebSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await potentialSubscriber.WebSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                        onWebsocketClose(potentialSubscriber);
                        return; 
                    }
                    var messageJson = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    using var doc = JsonDocument.Parse(messageJson);
                    var root = doc.RootElement;

                    if (root.TryGetProperty("message", out var messageProp))
                    {
                        var messageType = messageProp.GetString();

                        switch (messageType)
                        {
                            case "start":
                                NetworkMonit.Instance.Unsubscribe(potentialSubscriber); 
                                List<Guid>? devices = new List<Guid>();

                                int auto = 0;

                                if (root.TryGetProperty("devices", out var devicesProp) && devicesProp.ValueKind == JsonValueKind.Array)
                                {
                                    devices = devicesProp.EnumerateArray()
                                        .Where(d => d.ValueKind == JsonValueKind.String && Guid.TryParse(d.GetString(), out _))
                                        .Select(d => Guid.Parse(d.GetString()!))
                                        .ToList();
                                    potentialSubscriber.userPossibleMonitoredDevices = devices;
                                }

                                if (root.TryGetProperty("auto", out var autoProp) && autoProp.ValueKind == JsonValueKind.Number)
                                {
                                    auto = autoProp.GetInt32();
                                    potentialSubscriber.autoDevicesCount = auto;
                                }
                                NetworkMonit.Instance.Subscribe(potentialSubscriber);
                                break;

                            case "stop":
                                NetworkMonit.Instance.Unsubscribe(potentialSubscriber);
                                break;

                            default:
                                break;
                        }
                    }
                }
                catch (WebSocketException)
                {
                    if (potentialSubscriber.WebSocket.State != WebSocketState.Closed)
                    {
                        try
                        {
                            await potentialSubscriber.WebSocket.CloseAsync(
                                WebSocketCloseStatus.InternalServerError,
                                "Remote closed without handshake",
                                CancellationToken.None
                            );
                        }
                        catch (Exception)
                        {
                        }
                    }
                    onWebsocketClose(potentialSubscriber);
                    return;
                }
            }
            onWebsocketClose(potentialSubscriber);
            await potentialSubscriber.WebSocket.CloseAsync(WebSocketCloseStatus.Empty, "", CancellationToken.None);
        }
    }
}
