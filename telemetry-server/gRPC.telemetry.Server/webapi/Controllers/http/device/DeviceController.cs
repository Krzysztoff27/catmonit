using gRPC.telemetry.Server.webapi;
using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using gRPC.telemetry.Server.webapi.Monitoring;
using Microsoft.AspNetCore.Mvc;
using webapi.webapi;

namespace webapi.Controllers.http.layout
{
    
    [ApiController]
    [Route("[controller]")]
    public class DeviceController : Controller
    {
        [HttpGet]
        [Route("getAllDevices")]
        public IActionResult GetDevices()
        {
            authResult authRes = Utils.Authenticate(Request);
            if (authRes.res != null) return authRes.res;
            try
            {
                List<deviceInfo> devices = DeviceHelper.GetDeviceInfos();
                return Json(devices);
            }catch (InternalServerError)
            {
                return Utils.returnVal(500);
            }
        }
    }
}
