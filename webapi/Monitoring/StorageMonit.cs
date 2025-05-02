using System.Net.WebSockets;
using System.Security.Cryptography.X509Certificates;
using webapi.Models;

namespace webapi.Monitoring
{
    public class StorageMonit : Monit
    {
        StorageInfoModel lastStorageInfo;
        public StorageMonit()
        {
            lastStorageInfo = new StorageInfoModel();
        }


        public override void FetchData(){
            string message = $"hello, {subscribers.Count} users";
            byte[] messageBytes = System.Text.Encoding.UTF8.GetBytes(message);
            var buffer = new ArraySegment<byte>(messageBytes);
            foreach (var sub in subscribers.Values)
            {
                sub.WebSocket.SendAsync(buffer, WebSocketMessageType.Text, endOfMessage: true, CancellationToken.None);
            }
        }
    }
}
