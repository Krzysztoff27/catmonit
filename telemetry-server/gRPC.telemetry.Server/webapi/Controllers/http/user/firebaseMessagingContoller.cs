using Microsoft.AspNetCore.Mvc;
using webapi.Models;

namespace webapi.Controllers.http.user
{
    [ApiController]
    [Route("api/[controller]")]
    public class firebaseMessagingContoller : Controller
    {

        [HttpPost]
        [Route("addDevice")]
        public IActionResult Post([FromBody] addAccessRequestModel user)
        {
            return Ok(user);
        }
    }
}
