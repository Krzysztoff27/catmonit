using Duende.IdentityServer.Models;
using System.Net.WebSockets;
using System.Security.Cryptography.X509Certificates;
using webapi.Models;

namespace webapi.Monitoring
{
    public class StorageMonit : Monit
    {
        StorageInfoModel lastStorageInfo = new StorageInfoModel();

        


        public override void FetchData()
        {
            lastStorageInfo.information = $"hello, {subscribers.Count} users";
        }

        public override void sendData()
        {
            byte[] messageBytes = System.Text.Encoding.UTF8.GetBytes(lastStorageInfo.toString());
            var buffer = new ArraySegment<byte>(messageBytes);
            foreach (var sub in subscribers.Values)
            {
                sub.WebSocket.SendAsync(buffer, WebSocketMessageType.Text, endOfMessage: true, CancellationToken.None);
            }
        }

    }
}
