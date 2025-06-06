﻿using System.Net.WebSockets;
using System.Text.Json;
using System.Text;
using webapi.Helpers;
using webapi.Monitoring;
using Newtonsoft.Json;

namespace gRPC.telemetry.Server.webapi.Websocket
{
    public abstract class MonitHandler 
    {
        public Monit MonitRef { get; set; }
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

            MonitRef.Unsubscribe(subber);
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
                    JsonDocument doc;
                    var messageJson = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    try { 
                        doc = JsonDocument.Parse(messageJson);
                    }
                    catch (JsonReaderException e)
                    {
                        await potentialSubscriber.WebSocket.CloseAsync(WebSocketCloseStatus.InvalidPayloadData, "Invalid json format", CancellationToken.None);
                        return;
                    }
                    var root = doc.RootElement;

                    if (root.TryGetProperty("message", out var messageProp))
                    {
                        var messageType = messageProp.GetString();

                        switch (messageType)
                        {
                            case "start":
                                {
                                    MonitRef.Unsubscribe(potentialSubscriber);
                                    List<Guid>? devices = new List<Guid>();

                                    int auto = 0;
                                    int warn = 0;
                                    int err = 0;

                                    if (root.TryGetProperty("devices", out var devicesProp) && devicesProp.ValueKind == JsonValueKind.Array)
                                    {
                                        devices = devicesProp.EnumerateArray()
                                            .Where(d => d.ValueKind == JsonValueKind.String && Guid.TryParse(d.GetString(), out _))
                                            .Select(d => Guid.Parse(d.GetString()!))
                                            .ToList();
                                        potentialSubscriber.monitoredDevicesIndexes = devices;
                                    }

                                    if (root.TryGetProperty("auto", out var autoProp) && autoProp.ValueKind == JsonValueKind.Number)
                                    {
                                        auto = autoProp.GetInt32();
                                        if (auto > 0)
                                        {
                                            potentialSubscriber.autoDevicesCount = auto;
                                        }
                                    }
                                    if (root.TryGetProperty("warningsCount", out var warnProp) && warnProp.ValueKind == JsonValueKind.Number)
                                    {
                                        warn = warnProp.GetInt32();
                                        if (warn > 0)
                                        {
                                            potentialSubscriber.warningCount = warn;
                                        }
                                    }
                                    if (root.TryGetProperty("errorsCount", out var errProp) && errProp.ValueKind == JsonValueKind.Number)
                                    {
                                        err = errProp.GetInt32();
                                        if (err > 0)
                                        {
                                            potentialSubscriber.errorCount = err;
                                        }
                                    }
                                    MonitRef.Subscribe(potentialSubscriber);
                                    break;
                                }
                            case "stop":
                                {
                                    MonitRef.Unsubscribe(potentialSubscriber);
                                    break;
                                }

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
                            // ignore
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
