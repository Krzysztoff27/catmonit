using Microsoft.AspNetCore.Mvc;
using webapi.Helpers;
using webapi.Models;

namespace webapi.Controllers.http.user
{
    namespace webapi.Controllers.http.user
    {
        
        [ApiController]
        [Route("admin/[controller]")]
        public class addAccessController : Controller
        {
            [HttpPost]
            public IActionResult Post([FromBody] addAccessRequestModel user)
            {
                return Ok(user);
            }
        }
    }
}
