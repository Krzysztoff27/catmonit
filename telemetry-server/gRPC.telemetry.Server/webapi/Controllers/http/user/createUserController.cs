using Microsoft.AspNetCore.Mvc;
using webapi.Helpers.DBconnection;
using webapi.Models;
using webapi.webapi;

namespace webapi.Controllers.http.user
{
    [ApiController]
    [Route("admin/[controller]")]
    public class createUserController : Controller
    {
        [HttpPost]
        public IActionResult Post([FromBody] createUserRequest user)
        {
            switch (userHelper.createUser(user.username, user.password, (user.permissions == null) ? (int)Permissions.defaultPermission: PermissionHelper.createPermissionBitmask(user.permissions)))
            {
                case userCreateStatus.Success:
                    var data0 = new { message = "User created successfully" };
                    return Json(data0);
                case userCreateStatus.UserAlreadyExists:
                    return Utils.returnVal(409, "User already exists");
                case userCreateStatus.InternalServerError:
                    return Utils.returnVal(500);
                default:
                    return Utils.returnVal(501);
            }
           
        }
}
}
