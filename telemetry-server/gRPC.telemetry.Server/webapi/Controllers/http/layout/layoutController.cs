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
                List<LayoutIDandName> layoutNames = LayoutHelper.getLayoutNamesAndIDs(authRes.payload.id);
                return Json(layoutNames);
            }
            catch (InternalServerError)
            {
                return Utils.returnVal(500);
            }
        }
        [HttpGet]
        [Route("layout/{layoutID}")]
        public IActionResult GetLayout(Guid layoutID)
        {
            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;

            try
            {
                LayoutInfo layoutInfo = LayoutHelper.getLayout(layoutID);

                return (layoutInfo.data == null ? Utils.returnVal(400, "layout doesn't exist") : Json(layoutInfo));
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
                    LayoutIDandName res = LayoutHelper.addOrUpdateLayout(authRes.payload.id, layoutName, layoutJson);
                    return Json(res);
                }catch (InternalServerError) 
                {  
                    return Utils.returnVal(500); 
                }
            }
        }
        [HttpPut]
        [Route("rename/{LayoutID}")]
        public IActionResult RenameLayout(Guid LayoutID)
        {
            string newName = Request.Query["new_name"].ToString();
            if (!isCorrect(newName)) return Utils.returnVal(400, "incorrect layout name");

            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;
            return LayoutHelper.renameLayout(authRes.payload.id, LayoutID, newName);
        }
        [HttpDelete]
        [Route("delete/{layoutID}")]
        public IActionResult DeleteLayout(Guid layoutID)
        {

            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;

            try
            {
                bool res = LayoutHelper.deleteLayout(layoutID);
                return res ? Utils.returnVal(200, "removed successfuly") : Utils.returnVal(400, "layout doesn't exist");
            }catch (InternalServerError)
            {
                return Utils.returnVal(500);
            }
        }
    }
}
