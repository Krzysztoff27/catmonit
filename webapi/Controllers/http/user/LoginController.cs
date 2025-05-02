
using Microsoft.AspNetCore.Mvc;
using webapi.Models;
namespace webapi.Controllers.http.user
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : Controller
    {
        [HttpGet]
        public JsonResult Get()
        {
            var data = new { Message = "Hello, JSON!", Time = DateTime.UtcNow };
            return Json(data);
        }
        [HttpPost]
        public JsonResult Post([FromBody] UserModel user)
        {
            var data = new { Message = "Hello, " + user.username };
            return Json(data);
        }
    }
}
