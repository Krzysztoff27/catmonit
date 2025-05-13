#define CM_RUN_ALL
#define CM_GENERATE_SWAGGER

using Microsoft.AspNetCore.Server.Kestrel.Core;
using webapi.Monitoring;
using webapi.Websocket;
#if CM_GENERATE_SWAGGER
using Microsoft.OpenApi.Models;
#endif

var builder = WebApplication.CreateBuilder(args);

// Register services

#if CM_RUN_ALL
builder.Services.AddControllersWithViews();
builder.Services.AddControllers();
#endif
#if CM_GENERATE_SWAGGER
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "catmonit",
        Version = "v1",
        Description = "Auto-generated OpenAPI docs by Swagger"
    });
});
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
    var path = context.Request.Path.ToString();

    // Skip WebSocket middleware for Swagger and other non-WebSocket routes
    if (path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/favicon.ico", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/css", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/js", StringComparison.OrdinalIgnoreCase))
    {
        await next();
        return;
    }

    if (context.WebSockets.IsWebSocketRequest &&
        (path.StartsWith("/network", StringComparison.OrdinalIgnoreCase) ||
         path.StartsWith("/storage", StringComparison.OrdinalIgnoreCase)))
    {
        await NetworkMonitHandler.instance.HandleRequestAsync(context);
    }
    else
    {
        await next();
    }
});

//app.Use(async (context, next) =>
//{
//    var path = context.Request.Path.ToString();

//    if (context.WebSockets.IsWebSocketRequest &&
//        (path.StartsWith("/network", StringComparison.OrdinalIgnoreCase) ||
//         path.StartsWith("/storage", StringComparison.OrdinalIgnoreCase)))
//    {
//        await NetworkMonitHandler.instance.HandleRequestAsync(context);
//    }
//    else
//    {
//        await next();
//    }
//});
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

#if CM_GENERATE_SWAGGER
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "cm");
    });
}
#endif


app.Run();
