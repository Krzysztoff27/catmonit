using gRPC.telemetry.Server.webapi;
using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
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
    public class DeviceController : Controller
    {
        [HttpGet]
        [Route("getAllDevicesUserHasAccessTo")]
        public IActionResult GetDevicesUserHasAccessTo()
        {
            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;
            try
            {
                List<Guid> devices = DeviceHelper.GetDevicesUserHasAccessTo(authRes.payload.id);
                return Json(devices);
            }catch (InternalServerError)
            {
                return Utils.returnVal(500);
            }
        }
    }
}
