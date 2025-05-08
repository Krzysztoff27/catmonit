using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using webapi.Models;

namespace webapi.Controllers.http
{
    [ApiController]
    [Route("")]
    public class HomeController : Controller
    {
        public JsonResult Get()
        {
            var data = new { Message = "Hello, JSON!", Time = DateTime.UtcNow };
            return Json(data);
        }
    }
}
