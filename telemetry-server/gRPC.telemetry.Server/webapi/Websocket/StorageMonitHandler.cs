using JWT.Algorithms;
using JWT.Exceptions;
using JWT.Serializers;
using JWT;
using System.Net.WebSockets;
using System.Text;
using webapi.Monitoring;
using webapi.Models;
using webapi.Helpers;
using System.Text.Json;

namespace webapi.Websocket
{
    public class StorageMonitHandler
    {
        private readonly StorageMonit _storageMonitoring;

        public StorageMonitHandler(StorageMonit storageMonitoring)
        {
            _storageMonitoring = storageMonitoring;
            _storageMonitoring.StartMonitoring();
        }

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

                    await webSocket.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(sub.monitoredDevicesIndexes.ToArray()))), WebSocketMessageType.Text, true, CancellationToken.None);



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

        private async Task AddWebSocket(Subscriber potentialSubscriber)
        {
            var buffer = new byte[1024 * 4];
            var result = await potentialSubscriber.WebSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);


            while (!result.CloseStatus.HasValue)
            {
                string message = Encoding.UTF8.GetString(buffer, 0, result.Count);

                if (message == "start")
                {
                    _storageMonitoring.Subscribe(potentialSubscriber);
                }
                else if (message == "stop")
                {
                    _storageMonitoring.Unsubscribe(potentialSubscriber);
                }

                result = await potentialSubscriber.WebSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            _storageMonitoring.Unsubscribe(potentialSubscriber);
            await potentialSubscriber.WebSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }
    }
}
