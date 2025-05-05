using Microsoft.AspNetCore.Mvc.ApplicationParts;
using System.Text;
using webapi.Controllers.http.user;
using webapi.Monitoring;
using webapi.Websocket;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddControllers();
builder.Services.AddSingleton<StorageMonit>();
builder.Services.AddTransient<MonitHandler>();

string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=webapi-mysql-1;Database=catmonit;User=root;Password=mysecretpassword;";
builder.Services.AddSingleton(new userValidator(connectionString));



var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}


app.UseWebSockets();

app.Use(async (context, next) =>
{
    var handler = context.RequestServices.GetRequiredService<MonitHandler>();
    await handler.HandleRequestAsync(context);

    if (!context.Response.HasStarted)
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

