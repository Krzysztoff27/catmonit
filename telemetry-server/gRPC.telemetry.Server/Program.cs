#define CM_RUN_ALL

using Microsoft.AspNetCore.Server.Kestrel.Core;
using webapi.Monitoring;
using webapi.Websocket;

var builder = WebApplication.CreateBuilder(args);

// Register services

#if CM_RUN_ALL
builder.Services.AddControllersWithViews();
builder.Services.AddControllers();
builder.Services.AddSingleton<StorageMonit>();
builder.Services.AddTransient<StorageMonitHandler>();
#endif
builder.Services.AddGrpc();

// Configure Kestrel to listen on two HTTPS ports
builder.WebHost.ConfigureKestrel(options =>
{
    // WebAPI on 5172 (HTTPS)
    options.ListenAnyIP(5172, listenOptions =>
    {   
        listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
        listenOptions.UseHttps("./SSL/server.pfx", "");
    });

    // gRPC on 5001 (HTTPS)
    options.ListenAnyIP(5001, listenOptions =>
    {
        listenOptions.Protocols = HttpProtocols.Http2;
        listenOptions.UseHttps("./SSL/server.pfx", "");
    });
});

var app = builder.Build();

#if CM_RUN_ALL
// Enable WebSockets
app.UseWebSockets();
app.Use(async (context, next) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var path = context.Request.Path.ToString();

        if (path.StartsWith("/network", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/storage", StringComparison.OrdinalIgnoreCase))
        {
            var handler = context.RequestServices.GetRequiredService<StorageMonitHandler>();
            await handler.HandleRequestAsync(context);
        }
        else
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("Unsupported WebSocket route.");
        }
    }
    else
    {
        await next();
    }
});

// MVC routes
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "json",
    pattern: "{controller=Test}/{action=Get}/{id?}");

// Middleware for HTTPS, static files, routing
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

// Map WebAPI endpoints
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

#endif
// Map gRPC only if the request comes via gRPC endpoint (port 5001)
app.MapGrpcService<TelemetryService>();

app.Run();
