using gRPC.telemetry.Server.webapi;
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
            try
            {
                List<string> layoutNames = LayoutHelper.getLayoutNames(authRes.payload.id);
                return Json(layoutNames);
            }
            catch (InternalServerError)
            {
                return Utils.returnVal(500);
            }
        }
        [HttpGet]
        [Route("layout/{name}")]
        public IActionResult GetLayout(string name)
        {
            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;

            try
            {
                JsonElement? json = LayoutHelper.getLayout(authRes.payload.id, name);
                return (json == null ? Utils.returnVal(400, "layout doesn't exist") : Json(json));
            }
            catch (InternalServerError)
            {
                return Utils.returnVal(500);
            }
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
                try
                {
                    var layoutJson = await reader.ReadToEndAsync();
                    if (string.IsNullOrEmpty(layoutName) || string.IsNullOrEmpty(layoutJson))
                    {
                        return Utils.returnVal(400, "layout name or data is empty");
                    }
                    bool res = LayoutHelper.addOrUpdateLayout(authRes.payload.id, layoutName, layoutJson);
                    if (res)
                    {
                        return Utils.returnVal(200, "layout created");
                    }
                    else
                    {
                        return Utils.returnVal(200, "layout updated");
                    }
                    ;
                }catch (InternalServerError) 
                {  
                    return Utils.returnVal(500); 
                }
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

            try
            {
                bool res = LayoutHelper.deleteLayout(authRes.payload.id, layoutName);
                return res ? Utils.returnVal(200, "removed successfuly") : Utils.returnVal(400, "layout doesn;t exist");
            }catch (InternalServerError)
            {
                return Utils.returnVal(500);
            }
        }
    }
}
