using Microsoft.AspNetCore.Mvc;
using webapi.Helpers;
using webapi.Models;

namespace webapi.Controllers.http.user
{
    namespace webapi.Controllers.http.user
    {
        public class RequestModel
        {
            public string Token { get; set; }
            public List<int> Resources { get; set; }
        }
        
        [ApiController]
        [Route("api/[controller]")]
        public class addAccessController : Controller
        {

            private readonly userHelper userService;

            public addAccessController(userHelper userVal)
            {
                userService = userVal;
            }
            [HttpPost]
            public IActionResult Post([FromBody] RequestModel user)
            {
                return Ok(user);
            }
        }
    }
}
