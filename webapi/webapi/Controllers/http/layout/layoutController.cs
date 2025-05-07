using Duende.IdentityServer.Extensions;
using Microsoft.AspNetCore.Mvc;
using System.Reflection.PortableExecutable;
using webapi.Helpers;

namespace webapi.Controllers.http.layout
{
    [ApiController]
    [Route("[controller]")]
    public class layoutController : Controller
    {

        [HttpGet]
        [Route("layouts")]
        public IActionResult GetLayouts()
        {
            if (Request.Headers.TryGetValue("Authentication", out var authHeader))
            {
                var token = authHeader.ToString();
                tokenStatusAndPayload statNpayload = tokenValidator.validate(token);
                if (statNpayload.status == tokenStatus.valid)
                {
                    List<string>? layoutNames = layoutHelper.getLayoutNames(statNpayload.payload.id);
                    return (layoutNames == null ? StatusCode(500, new { message = "Internal server error" }) : Json(layoutNames));
                }
                else
                {
                    var response = tokenValidator.getReturnValue(statNpayload.status);

                    var data = new { Message = response.message };
                    return StatusCode(response.statusCode, data);
                }
            }
            else
            {
                var data = new { Message = "token not found" };
                return StatusCode(401, data);
            }
        }
        [HttpGet]
        [Route("layout/{name}")]
        public IActionResult GetLayout(string name)
        {
            if (Request.Headers.TryGetValue("Authentication", out var authHeader))
            {
                var token = authHeader.ToString();
                tokenStatusAndPayload statNpayload = tokenValidator.validate(token);
                if (statNpayload.status == tokenStatus.valid)
                {
                    string? layout = layoutHelper.getLayout(statNpayload.payload.id, name);
                    return (layout == null?StatusCode(500, new { message = "Internal server error"}):Json(layout));
                }
                else
                {
                    var response = tokenValidator.getReturnValue(statNpayload.status);

                    var data = new { Message = response.message };
                    return StatusCode(response.statusCode, data);
                }
            }
            else
            {
                var data = new { Message = "token not found" };
                return StatusCode(401, data);
            }
        }
        [HttpPut]
        [Route("update/{layoutName}")]
        public async Task<IActionResult> UpdateOrCreate(string layoutName)
        {
            if (Request.Headers.TryGetValue("Authentication", out var authHeader))
            {
                var token = authHeader.ToString();
                tokenStatusAndPayload statNpayload = tokenValidator.validate(token);
                if (statNpayload.status == tokenStatus.valid)
                {

                    using (var reader = new StreamReader(Request.Body))
                    {
                        var layoutJson = await reader.ReadToEndAsync();
                        if (layoutHelper.addOrUpdateLayout(statNpayload.payload.id, layoutName, layoutJson) == true)
                        {
                            var data = new { Message = "layout created" };
                            return Json(data);
                        }
                        if (layoutHelper.addOrUpdateLayout(statNpayload.payload.id, layoutName, layoutJson) == false)
                        {
                            var data = new { Message = "layout updated" };
                            return Json(data);
                        }
                        else
                        {
                            var data = new { Message = "error updating layout" };
                            return StatusCode(500, data);
                        };
                        
                    }
                }
                else
                {
                    var response = tokenValidator.getReturnValue(statNpayload.status);

                    var data = new { Message = response.message };
                    return StatusCode(response.statusCode, data);
                }
            }
            else
            {
                var data = new { Message = "token not found" };
                return StatusCode(401, data);
            }
        }
    }
}
