
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
            var loginInfo = userService.userAuth(user.username, user.password);
            if (loginInfo.status == userAuthStatus.Success)
            {
                // Create the JWT token
                var payload = new TokenPayload
                {
                    id = loginInfo.userID,
                    iat = DateTimeOffset.UtcNow.ToUnixTimeSeconds(), // Issued at time
                    exp = DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds() // Expiration time
                };

                string token = JwtBuilder.Create()
                    .WithAlgorithm(new HMACSHA256Algorithm())
                    .WithSecret(Config.CM_JWT_SECRET)
                    .AddClaim("exp", payload.exp) 
                    .AddClaim("iat", payload.iat) 
                    .AddClaim("id", payload.id) 
                    .Encode();

                var data = new { token = $"{token}" };
                return Json(data);
            }
            else
            {
                if (loginInfo.status == userAuthStatus.InternalServerError)
                {
                    var data0 = new { message = "internal server error" };
                    return Json(data0);

                }
                var data = new { message = "user doesn't exist or password is incorrect" };
                return Json(data);
            }
        }
    }
}
