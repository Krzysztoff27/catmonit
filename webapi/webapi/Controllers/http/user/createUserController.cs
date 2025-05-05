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
            var data = new { result = userService.createUser(user.username, user.password) };
            return Json(data);
           
        }
}
}
