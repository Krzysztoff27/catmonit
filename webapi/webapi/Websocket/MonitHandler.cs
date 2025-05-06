using JWT.Algorithms;
using JWT.Exceptions;
using JWT.Serializers;
using JWT;
using System.Net.WebSockets;
using System.Text;
using webapi.Monitoring;
using webapi.Models;

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
            var token = context.Request.Query["token"].ToString();
            if (context.WebSockets.IsWebSocketRequest)
            {
                if (!string.IsNullOrEmpty(token))
                {

                    try
                    {
                        var jsonSerializer = new JsonNetSerializer();
                        var urlEncoder = new JwtBase64UrlEncoder();
                        var dateTimeProvider = new UtcDateTimeProvider();
                        var validator = new JwtValidator(jsonSerializer, dateTimeProvider);
                        var algorithm = new HMACSHA256Algorithm();
                        var decoder = new JwtDecoder(jsonSerializer, validator, urlEncoder, algorithm);

                        var payload = decoder.DecodeToObject<TokenPayload>(token, Config.CM_JWT_SECRET, verify: true);

                        
                        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                        await webSocket.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes((String)$"user id: {payload.id}")), WebSocketMessageType.Text, true, CancellationToken.None);
                        await AddWebSocket(new Subscriber(payload.id, webSocket));
                    }
                    catch (TokenExpiredException)
                    {
                        context.Response.StatusCode = 401;
                        await context.Response.WriteAsync("Unauthorized.");
                    }
                    catch (SignatureVerificationException)
                    {
                        context.Response.StatusCode = 401;
                        await context.Response.WriteAsync("Unauthorized.");
                    }
                    catch (Exception ex)
                    {
                        context.Response.StatusCode = 500;
                        await context.Response.WriteAsync("Internal server error.");
                    }
                }
                else
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsync("Unauthorized.");
                }
            }
            else
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsync("Expected WebSocket request.");
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
