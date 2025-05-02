
using Microsoft.AspNetCore.Mvc;
namespace webapi.Controllers
{
    public class TextController : Controller
    {
        public JsonResult Get()
        {
            var data = new { Message = "Hello, JSON!", Time = DateTime.UtcNow };
            return Json(data);  // Automatically returns JSON
        }
    }
}
