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

        private readonly userValidator userService;

        public createUserController(userValidator userVal)
        {
            userService = userVal;
        }
        [HttpPost]
        public JsonResult Post([FromBody] UserModel user)
        {
            string message;
            switch (userService.createUser(user.username, user.password))
            {
                case userCreateStatus.Success:
                    message = "User created successfully";
                    break;
                case userCreateStatus.UserAlreadyExists:
                    message = "User already exists";
                    break;
                case userCreateStatus.InternalServerError:
                    message = "Internal server error";
                    break;
                default:
                    message = "Unknown error";
                    break;
            }
            var data = new { result = message };
            return Json(data);
           
        }
}
}
