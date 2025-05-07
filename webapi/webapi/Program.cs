using Duende.IdentityServer.Models;
using Duende.IdentityServer.Test;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using System.Text;
using webapi.Controllers.http.user;
using webapi.Helpers;
using webapi.Monitoring;
using webapi.Websocket;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddControllers();
builder.Services.AddSingleton<StorageMonit>();
builder.Services.AddTransient<StorageMonitHandler>();



var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}


app.UseWebSockets();
app.Use(async (context, next) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var path = context.Request.Path.ToString();

        if (path.StartsWith("/network", StringComparison.OrdinalIgnoreCase))
        {
            var handler = context.RequestServices.GetRequiredService<StorageMonitHandler>();
            await handler.HandleRequestAsync(context);
        }
        else if (path.StartsWith("/storage", StringComparison.OrdinalIgnoreCase))
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



app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapControllerRoute(
    name: "json",
    pattern: "{controller=Test}/{action=Get}/{id?}");


app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.UseEndpoints(
    endpoints => { 
        endpoints.MapControllers(); 
    }
);


app.Run();

