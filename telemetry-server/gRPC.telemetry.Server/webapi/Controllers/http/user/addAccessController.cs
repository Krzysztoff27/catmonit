using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using Grpc.Core;
using Microsoft.AspNetCore.Mvc;
using System.Security;
using webapi.Helpers;
using webapi.Helpers.DBconnection;
using webapi.Models;
using webapi.Monitoring;
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
            public IActionResult Post([FromBody] addAccessRequestModel addAccessRequest)
            {
                var authRes = Utils.Authenticate(Request);
                if (authRes.res != null) return authRes.res;

                string? username = userHelper.getUsername(addAccessRequest.userID);
                if (string.IsNullOrEmpty(username)) return Utils.returnVal(400, "user doesn't exist");

                int? granterPermission = PermissionHelper.UserPermission(authRes.payload.id);
                if (granterPermission == null) return Utils.returnVal(500);

                Permissions RequestedActionPermission = PermissionHelper.getPermissionBit(addAccessRequest.access);
                if (RequestedActionPermission == Permissions.defaultPermission) return Utils.returnVal(400, "unknown action");
                if (RequestedActionPermission == Permissions.seeSelectedPermission)
                {
                    if (((granterPermission & (int)Permissions.seeAllPermission) == 0))
                        return Utils.returnVal(403, "you cannot add access to devices if you don't have access to see all devices. (how did you even send this request???) (this is probably a bug, please report it)");
                    bool? checkIfUserAlreadyCanSeeAllRes = (PermissionHelper.checkIfUserHasPermissions(addAccessRequest.userID, (int)Permissions.seeAllPermission));
                    if (checkIfUserAlreadyCanSeeAllRes == null) return Utils.returnVal(500);
                    else if (checkIfUserAlreadyCanSeeAllRes == true) return Utils.returnVal(400, "the user you are attempting to give access already can see all machines");
                }else if ((granterPermission & (int)RequestedActionPermission) == 0) return Utils.returnVal(403, "you cannot give others permissions you don't have yourself");


                // actually give the permission
                if (RequestedActionPermission != Permissions.seeSelectedPermission)
                {
                    bool? addPermRes = PermissionHelper.addPermissionToUser(addAccessRequest.userID, RequestedActionPermission);
                    if (addPermRes == null) return Utils.returnVal(500);
                    else if (addPermRes == false) return Utils.returnVal(400, "user not found");
                    else return Utils.returnVal(200, "permission added succesfully");
                }
                else
                {
                    if (addAccessRequest.devicesIDs == null || addAccessRequest.devicesIDs.Count == 0) return Utils.returnVal(400, "you have to specify the devices you'd like to add access to.");
                    List<Guid> madeUpDevices = new List<Guid>();
                    foreach (var deviceID in addAccessRequest.devicesIDs)
                    {
                        if (!NetworkMonit.networkDeviceInfos.MonitoredDevices.ContainsKey(deviceID))
                        {
                            madeUpDevices.Add(deviceID);
                        }
                        else
                        {
                            bool? res = DeviceHelper.DeviceExistsInDB(deviceID);
                            if (res == null) return Utils.returnVal(500);
                            if (!res.Value) {
                                madeUpDevices.Add(deviceID);
                            }
                        }
                    }

                    var existingDevices = addAccessRequest.devicesIDs.Except(madeUpDevices).ToList();

                    if (PermissionHelper.addAccessToMachines(addAccessRequest.userID, existingDevices) == null) return Utils.returnVal(500);

                    if (madeUpDevices.Count != 0)
                    {
                        var data = new { Message = "The requested machines do not exist (the access to the existing devices has been added)", Machines = madeUpDevices };
                        return new ObjectResult(data) { StatusCode = 400 };
                    }
                    return Utils.returnVal(200, "access to devices granted");
                }
            }
        }
    }
}
