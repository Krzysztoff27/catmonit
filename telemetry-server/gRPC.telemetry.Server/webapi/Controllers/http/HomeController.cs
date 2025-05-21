using System.Diagnostics;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using webapi.Models;
using webapi.webapi;

namespace webapi.Controllers.http
{
    [ApiController]
    [Route("")]
    public class HomeController : Controller
    {
        [HttpGet]
        public IActionResult Get()
        {
            var data = new { Message = "Hello, JSON!", Time = DateTime.UtcNow };
            return Utils.returnVal(200, JsonSerializer.Serialize(data, Utils.JsonOption));
        }
    }
}
