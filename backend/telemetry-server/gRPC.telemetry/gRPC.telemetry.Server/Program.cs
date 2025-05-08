var builder = WebApplication.CreateBuilder(args);

builder.Services.AddGrpc();
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5172, listenOptions =>
    {
        listenOptions.UseHttps("../../../ssl/server.pfx", "");
    });
});

var app = builder.Build();

app.MapGrpcService<TelemetryService>();

app.Run();
