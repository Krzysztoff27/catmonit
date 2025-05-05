using Grpc.Core;

namespace gRPC.telemetry.Server.Services
{
    public class HostNameServiceImpl : HostNameService.HostNameServiceBase
    {
        public override Task<HostNameReply> SendHostName(HostNameRequest request, ServerCallContext context)
        {
            var reply = new HostNameReply
            {
                Message = $"Received hostname: {request.Hostname}"
            };
            return Task.FromResult(reply);
        }
    }
}