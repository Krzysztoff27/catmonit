using gRPC.telemetry;

var builder = WebApplication.CreateBuilder(args);

// Add gRPC
builder.Services.AddGrpc();

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5172, listenOptions =>
    {
        listenOptions.UseHttps("../../../ssl/server.pfx", "");
    });
});


var app = builder.Build();

// Map gRPC service
app.MapGrpcService<TelemetryService>();

app.Run();
