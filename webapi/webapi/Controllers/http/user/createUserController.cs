using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using webapi.Helpers;
using webapi.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace webapi.Controllers.http.user
{
    [ApiController]
    [Route("api/[controller]")]
    public class createUserController : Controller
    {
        [HttpPost]
        public IActionResult Post([FromBody] UserModel user)
        {
            switch (userHelper.createUser(user.username, user.password))
            {
                case userCreateStatus.Success:
                    var data0 = new { message = "User created successfully" };
                    return Json(data0);
                case userCreateStatus.UserAlreadyExists:
                    var data1 = new { message = "User already exists" };
                    return StatusCode(409, data1);
                case userCreateStatus.InternalServerError:
                    var data2 = new { message = "Internal server error" };
                    return StatusCode(500, data2);
                default:
                    var data3 = new { message = "Unknown error" };
                    return StatusCode(501, data3);
            }
           
        }
}
}
