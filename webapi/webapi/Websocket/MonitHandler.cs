using JWT.Algorithms;
using JWT.Exceptions;
using JWT.Serializers;
using JWT;
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
            var token = context.Request.Query["token"].ToString();
            if (context.WebSockets.IsWebSocketRequest)
            {
                if (!string.IsNullOrEmpty(token))
                {

                    try
                    {
                        // Create instances of necessary classes
                        var jsonSerializer = new JsonNetSerializer();
                        var urlEncoder = new JwtBase64UrlEncoder();
                        var dateTimeProvider = new UtcDateTimeProvider(); // Create a date-time provider
                        var validator = new JwtValidator(jsonSerializer, dateTimeProvider); // Use the correct constructor
                        var algorithm = new HMACSHA256Algorithm();
                        var decoder = new JwtDecoder(jsonSerializer, validator, urlEncoder, algorithm);

                        // Decode and validate the token
                        var payload = decoder.DecodeToObject(token, Config.CM_JWT_SECRET, verify: true);

                        // If it reaches here, the token is valid
                        Console.WriteLine("Decoded JWT Payload:");
                        Console.WriteLine(payload);
                        
                        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                        await webSocket.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes((String)payload["sub"])), WebSocketMessageType.Text, true, CancellationToken.None);
                        await AddWebSocket(token, webSocket);
                    }
                    catch (TokenExpiredException)
                    {
                        Console.WriteLine("Token is expired.");
                    }
                    catch (SignatureVerificationException)
                    {
                        Console.WriteLine("Invalid signature.");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Error: " + ex.Message);
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
                context.Response.StatusCode = 40;
                await context.Response.WriteAsync("Expected WebSocket request.");
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
