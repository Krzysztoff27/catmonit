using gRPC.telemetry;
using gRPC.telemetry.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add gRPC
builder.Services.AddGrpc();

var app = builder.Build();

// Map gRPC service
app.MapGrpcService<HostNameServiceImpl>();

app.Run();
