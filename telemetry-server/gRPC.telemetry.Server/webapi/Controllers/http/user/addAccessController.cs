using gRPC.telemetry.Server.webapi;
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
                // Permissions are stored in db as a bitmask in users table in a column 'permissions'.
                // if the permission is 0 (default) the user needs to have access to specific resources to view them. then they are stored in table users_devices.
                // IF THE PERMISSION GIVEN IS THE 'seeAll' PERMISSION, THE PERMISSION TO SEE SPECIFIC MACHINES THE USER HAD BEFORE WILL BE REMOVED.

                var authRes = Utils.Authenticate(Request);
                if (authRes.res != null) return authRes.res;
                try {
                    int? granterPermission = PermissionHelper.UserPermission(authRes.payload.id); // user doesn't exist
                    if (granterPermission == null) return Utils.returnVal(400, "user doesn't exist");

                    // get the permission in a more friendly format.
                    Permissions RequestedActionPermission = PermissionHelper.getPermissionBit(addAccessRequest.access);
                    if (RequestedActionPermission == Permissions.defaultPermission) return Utils.returnVal(400, "unknown action");
                    if (RequestedActionPermission == Permissions.seeSelectedPermission)
                    {
                        if (((granterPermission & (int)Permissions.seeAllPermission) == 0))
                            return Utils.returnVal(403, "you cannot add access to devices if you don't have access to see all devices. (how did you even send this request???) (this is probably a bug, please report it)");
                        bool? checkIfUserAlreadyCanSeeAllRes = (PermissionHelper.checkIfUserHasPermissions(addAccessRequest.userID, (int)Permissions.seeAllPermission));
                        Utils.assert(checkIfUserAlreadyCanSeeAllRes != null); // at this point we should be sure the user exists
                        if (checkIfUserAlreadyCanSeeAllRes == true) return Utils.returnVal(400, "the user you are attempting to give access already can see all machines");
                    } else if ((granterPermission & (int)RequestedActionPermission) == 0) 
                        return Utils.returnVal(403, "you cannot give others permissions you don't have yourself");


                    // actually give the permission
                    if (RequestedActionPermission != Permissions.seeSelectedPermission)
                    {
                        bool? addPermRes = PermissionHelper.addPermissionToUser(addAccessRequest.userID, RequestedActionPermission);
                        Utils.assert(addPermRes != null); // at this point we should be sure the user exists
                        if (addPermRes == false) return Utils.returnVal(400, "user not found");
                        if (RequestedActionPermission == Permissions.seeAllPermission)
                        {
                            PermissionHelper.removeSpecificMachinesAccess(addAccessRequest.userID);
                        }
                        return Utils.returnVal(200, "permission added succesfully");
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
                                bool res = DeviceHelper.DeviceExistsInDB(deviceID);
                                if (!res) {
                                    madeUpDevices.Add(deviceID);
                                }
                            }
                        }

                        var existingDevices = addAccessRequest.devicesIDs.Except(madeUpDevices).ToList();

                        PermissionHelper.addAccessToMachines(addAccessRequest.userID, existingDevices);

                        if (madeUpDevices.Count != 0)
                        {
                            var data = new { Message = "The requested machines do not exist (the access to the existing devices has been added)", Machines = madeUpDevices };
                            return new ObjectResult(data) { StatusCode = 400 };
                        }
                        return Utils.returnVal(200, "access to devices granted");
                    }
                }catch (InternalServerError)
                {
                    return Utils.returnVal(500);
                }
            }
        }
    }
}
