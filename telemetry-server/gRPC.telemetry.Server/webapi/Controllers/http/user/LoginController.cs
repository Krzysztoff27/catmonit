
using gRPC.telemetry.Server.webapi;
using JWT.Algorithms;
using JWT.Builder;
using Microsoft.AspNetCore.Mvc;
using webapi.Helpers;
using webapi.Helpers.DBconnection;
using webapi.Models;
using webapi.webapi;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace webapi.Controllers.http.user
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : Controller
    {
        [HttpGet]
        [Route("userCheck")]
        public IActionResult Get()
        {
            authResult auth = Utils.Authenticate(Request);
            if (auth.res != null)
            {
                return auth.res;
            }
            try
            {
                string? un = userHelper.getUsername(auth.payload.id);
                return (un == null ? Utils.returnVal(400, "user doesn't exist") : Json(new { uuid = auth.payload.id.ToString(), username = un }));
            }
            catch (InternalServerError)
            {
                return Utils.returnVal(500);
            }
        }
        [HttpPost]
        public IActionResult Post([FromBody] UserModel user)
        {
            var loginInfo = userHelper.userAuth(user.username, user.password);
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
                    return Utils.returnVal(500);

                }
                return Utils.returnVal(401, "user doesn't exist or password is incorrect");
            }
        }
    }
}
