namespace gRPC.telemetry.Server.webapi
{
    public class InternalServerError :Exception
    {
        public InternalServerError(string message = "Internal Server Error")
        : base(message)
        {
        }
    }
}
