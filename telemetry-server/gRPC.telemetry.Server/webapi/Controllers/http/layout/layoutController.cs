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
            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;
            List<string>? layoutNames = LayoutHelper.getLayoutNames(authRes.payload.id);
            return (layoutNames == null ? Utils.returnVal(500) : Json(layoutNames));
        }
        [HttpGet]
        [Route("layout/{name}")]
        public IActionResult GetLayout(string name)
        {
            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;

            (int errCode, JsonElement? json) layout = LayoutHelper.getLayout(authRes.payload.id, name);
            return (layout.json == null ? Utils.returnVal(layout.errCode, ((layout.errCode == 400) ? "layout doesn't exist" : "")):Json(layout.json));
        }
        [HttpPut]
        [Route("update/{layoutName}")]
        public async Task<IActionResult> UpdateOrCreate(string layoutName)
        {
            if (!isCorrect(layoutName)) return Utils.returnVal(400, "incorrect layout name");

            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;

            using (var reader = new StreamReader(Request.Body))
            {
                var layoutJson = await reader.ReadToEndAsync();
                bool? res = LayoutHelper.addOrUpdateLayout(authRes.payload.id, layoutName, layoutJson);
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
        [HttpPut]
        [Route("rename/{layoutName}")]
        public IActionResult RenameLayout(string layoutName)
        {
            string newName = Request.Query["new_name"].ToString();
            if (!isCorrect(layoutName) || (!isCorrect(newName))) return Utils.returnVal(400, "incorrect layout name");

            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;
            return LayoutHelper.renameLayout(authRes.payload.id, layoutName, newName);
        }
        [HttpDelete]
        [Route("delete/{layoutName}")]
        public IActionResult DeleteLayout(string layoutName)
        {
            if (!isCorrect(layoutName)) return Utils.returnVal(400, "incorrect layout name");

            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;

            bool? res = LayoutHelper.deleteLayout(authRes.payload.id, layoutName);
            return (res == null ? Utils.returnVal(500) : ((res.Value)?Json( new { message = "removed successfuly" }): Utils.returnVal(400, "layout doesn't exist")));
        }
    }
}
