using Microsoft.AspNetCore.Mvc;
using System.Security;
using webapi.Helpers;
using webapi.Helpers.DBconnection;
using webapi.Models;
using webapi.webapi;

namespace webapi.Controllers.http.user
{
    namespace webapi.Controllers.http.user
    {
        
        [ApiController]
        [Route("admin/[controller]")]
        public class addAccessController : Controller
        {
            [HttpPost]
            public IActionResult Post([FromBody] addAccessRequestModel user)
            {
                var authRes = Utils.Authenticate(Request);
                if (authRes.res != null) return authRes.res;

                bool? permissionCheckRes = PermissionHelper.checkIfUserHasPermissions(authRes.payload.id, (int) Permissions.modifyAccessPermission);
                if (permissionCheckRes == null) return Utils.returnVal(500);
                if (permissionCheckRes == false) return Utils.returnVal(403, "you don't have permission to modify access to resources");
                return Utils.returnVal(501, "you can modify the permissions, but that action is not yet implemented"); // TODO: implement 
            }
        }
    }
}
