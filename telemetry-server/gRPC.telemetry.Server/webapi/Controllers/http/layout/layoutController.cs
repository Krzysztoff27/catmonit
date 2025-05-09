using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.RegularExpressions;
using webapi.Helpers;
using webapi.Helpers.DBconnection;
using webapi.webapi;

namespace webapi.Controllers.http.layout
{
    [ApiController]
    [Route("[controller]")]
    public class LayoutController : Controller
    {
        public static bool isCorrect(string name)
        {
            if (string.IsNullOrEmpty(name))
                return false;

            return Regex.IsMatch(name, @"^[A-Za-z0-9 ]+$");
        }

        [HttpGet]
        [Route("layouts")]
        public IActionResult GetLayouts()
        {
            if (Request.Headers.TryGetValue("Authentication", out var authHeader))
            {
                var token = authHeader.ToString();
                TokenStatusAndPayload statNpayload = TokenValidator.validate(token);
                if (statNpayload.status == TokenStatus.valid)
                {
                    List<string>? layoutNames = LayoutHelper.getLayoutNames(statNpayload.payload.id);
                    return (layoutNames == null ? Utils.returnVal(500) : Json(layoutNames));
                }
                else
                {
                    var response = TokenValidator.getReturnValue(statNpayload.status);

                    var data = new { Message = response.message };
                    return Utils.returnVal(response.statusCode, response.message);
                }
            }
            else
            {
                return Utils.returnVal(401, "token not found");
            }
        }
        [HttpGet]
        [Route("layout/{name}")]
        public IActionResult GetLayout(string name)
        {
            if (Request.Headers.TryGetValue("Authentication", out var authHeader))
            {
                var token = authHeader.ToString();
                TokenStatusAndPayload statNpayload = TokenValidator.validate(token);
                if (statNpayload.status == TokenStatus.valid)
                {
                    (int errCode, JsonElement? json) layout = LayoutHelper.getLayout(statNpayload.payload.id, name);
                    return (layout.json == null ? Utils.returnVal(layout.errCode, ((layout.errCode == 400) ? "layout doesn't exist" : "")):Json(layout.json));
                }
                else
                {
                    var response = TokenValidator.getReturnValue(statNpayload.status);
                    return Utils.returnVal(response.statusCode, response.message);
                }
            }
            else
            {
                var data = new { Message = "token not found" };
                return Utils.returnVal(401, "token not found");
            }
        }
        [HttpPut]
        [Route("update/{layoutName}")]
        public async Task<IActionResult> UpdateOrCreate(string layoutName)
        {
            if (!isCorrect(layoutName)) return Utils.returnVal(400, "incorrect layout name");
            if (Request.Headers.TryGetValue("Authentication", out var authHeader))
            {
                var token = authHeader.ToString();
                TokenStatusAndPayload statNpayload = TokenValidator.validate(token);
                if (statNpayload.status == TokenStatus.valid)
                {

                    using (var reader = new StreamReader(Request.Body))
                    {
                        var layoutJson = await reader.ReadToEndAsync();
                        bool? res = LayoutHelper.addOrUpdateLayout(statNpayload.payload.id, layoutName, layoutJson);
                        if (res == true)
                        {
                            var data = new { Message = "layout created" };
                            return Json(data);
                        }
                        else if (res == false)
                        {
                            var data = new { Message = "layout updated" };
                            return Json(data);
                        }
                        else
                        {
                            return Utils.returnVal(500, "error updating layout");
                        };

                    }
                }
                else
                {
                    var response = TokenValidator.getReturnValue(statNpayload.status);
                    return Utils.returnVal(response.statusCode, response.message);
                }
            }
            else
            {
                return Utils.returnVal(401, "token not found");
            }
        }
        [HttpPut]
        [Route("rename/{layoutName}")]
        public IActionResult RenameLayout(string layoutName)
        {
            string newName = Request.Query["new_name"].ToString();
            if (!isCorrect(layoutName) || (!isCorrect(newName))) return Utils.returnVal(400, "incorrect layout name");

            if (Request.Headers.TryGetValue("Authentication", out var authHeader))
            {
                var token = authHeader.ToString();
                TokenStatusAndPayload statNpayload = TokenValidator.validate(token);
                if (statNpayload.status == TokenStatus.valid)
                {
                    return (LayoutHelper.renameLayout(statNpayload.payload.id, layoutName, newName) == null ? Utils.returnVal(500) : Json(new { message = "updated successfuly" }));
                }
                else
                {
                    var response = TokenValidator.getReturnValue(statNpayload.status);
                    return Utils.returnVal(response.statusCode, response.message);
                }
            }
            else
            {
                return Utils.returnVal(401, "token not found");
            }
        }
        [HttpDelete]
        [Route("delete/{layoutName}")]
        public IActionResult DeleteLayout(string layoutName)
        {
            if (!isCorrect(layoutName)) return Utils.returnVal(400, "incorrect layout name");

            if (Request.Headers.TryGetValue("Authentication", out var authHeader))
            {
                var token = authHeader.ToString();
                TokenStatusAndPayload statNpayload = TokenValidator.validate(token);
                if (statNpayload.status == TokenStatus.valid)
                {
                    bool? res = LayoutHelper.deleteLayout(statNpayload.payload.id, layoutName);
                    return (res == null ? Utils.returnVal(500) : ((res.Value)?Json( new { message = "removed successfuly" }): Utils.returnVal(400, "layout doesn't exist")));
                }
                else
                {
                    var response = TokenValidator.getReturnValue(statNpayload.status);
                    return Utils.returnVal(response.statusCode, response.message);
                }
            }
            else
            {
                return Utils.returnVal(401, "token not found");
            }
        }
    }
}
