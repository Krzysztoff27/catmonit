
using JWT.Algorithms;
using JWT.Builder;
using Microsoft.AspNetCore.Mvc;
using webapi.Helpers;
using webapi.Models;
namespace webapi.Controllers.http.user
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : Controller
    {
        private readonly userValidator userService;

        public LoginController(userValidator userVal)
        {
            userService = userVal;
        }
        [HttpGet]
        [Route("meowmeow")]
        public JsonResult Get()
        {
            var data = new { Message = "login sigma" };
            return Json(data);
        }
        [HttpPost]
        public JsonResult Post([FromBody] UserModel user)
        {
            var userId = userService.userAuth(user.username, user.password);
            if (userId != 0)
            {
                // user exists and password is correct
                var payload = new
                {
                    sub = $"{userId}",// user id
                    iat = DateTimeOffset.UtcNow.ToUnixTimeSeconds(), // Issued at time
                    exp = DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds() // Expiration time
                };

                // Create the JWT token
                string token = JwtBuilder.Create()
                    .WithAlgorithm(new HMACSHA256Algorithm())
                    .WithSecret(Config.CM_JWT_SECRET)
                    .AddClaim("exp", payload.exp) 
                    .AddClaim("iat", payload.iat) 
                    .AddClaim("sub", payload.sub) 
                    .Encode();

                var data = new { token = $"{token}" };
                return Json(data);
            }
            else
            {
                // user does not exist or password is incorrect
                // handle the error accordingly
                var data = new { message = "user doesn't exist or password is incorrect" };
                return Json(data);
            }
        }
    }
}
