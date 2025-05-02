using MySql.Data.MySqlClient;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection(); 
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapControllerRoute(
    name: "json",
    pattern: "{controller=Test}/{action=Get}/{id?}");

app.UseEndpoints(endpoints => { endpoints.MapControllers(); });

string connectionString = "Server=webapi-mysql-1;Database=catmonit;User=root;Password=mysecretpassword;";

using (MySqlConnection conn = new MySqlConnection(connectionString))
{
    conn.Open();

    string query = "SELECT * FROM users";
    MySqlCommand cmd = new MySqlCommand(query, conn);

    using (MySqlDataReader reader = cmd.ExecuteReader())
    {
        while (reader.Read())
        {
            string msg = reader["username"].ToString();
            Console.WriteLine(msg);
        }
    }
}

app.Run();
