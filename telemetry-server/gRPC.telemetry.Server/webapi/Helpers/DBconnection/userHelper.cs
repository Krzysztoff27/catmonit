using gRPC.telemetry.Server.webapi;
using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using System;
using webapi.webapi;


namespace webapi.Helpers.DBconnection
{
    public enum userAuthStatus
    {
        Success,
        IncorrectPassword,
        UserDoesntExist,
        InternalServerError
    }
    public enum userCreateStatus
    {
        Success,
        UserAlreadyExists,
        InternalServerError
    }

    public enum Permissions
    {
        defaultPermission = 0,
        seeSelectedPermission = 1<<0, // user should never have this permission, it's just here to simplify addAccess.
        seeAllPermission = 1<<1,
        modifyAccessPermission = 1<<2,
    }

    public class userHelper
    {

        public static bool userExists(string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return false;
            }
            return (ConHelper.execCountQuery("SELECT count(id) FROM users where username = @username;", new Dictionary<string, object> { { "@username", username } }) == 1? true: false);
        }


        public static (userAuthStatus status, Guid userID) userAuth(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password)) return (userAuthStatus.IncorrectPassword, Guid.Empty);
            try
            {
                using (var reader = ConHelper.ExecuteReader("SELECT id, password_hash, salt FROM users WHERE username = @username", new Dictionary<string, object> { { "@username", username } }))
                {
                    if (reader == null)
                    {
                        return (userAuthStatus.UserDoesntExist, Guid.Empty);
                    }
                    if (reader.Read())
                    {
                        byte[] storedHash = (byte[])reader["password_hash"];
                        byte[] salt = (byte[])reader["salt"];
                        if (PasswordHelper.VerifyPassword(password, salt, storedHash))
                        {
                            return (userAuthStatus.Success, (Guid)reader["id"]);
                        }
                        else
                        {
                            return (userAuthStatus.IncorrectPassword, Guid.Empty);
                        }
                        ;
                    }
                    else
                    {
                        return (userAuthStatus.UserDoesntExist, Guid.Empty);
                    }
                }
            }catch (InternalServerError)
            {
                return (userAuthStatus.InternalServerError, Guid.Empty);
            }
        }

        public static userCreateStatus createUser(string username, string password /*, int permBitmask = (int) Permissions.defaultPermission*/)
        {
            try
            {
                int count = ConHelper.execCountQuery(
                    $"SELECT count(id) FROM users where username = @username;",
                    new Dictionary<string, object> { { "@username", username } }
                );
                if (count != 0) return userCreateStatus.UserAlreadyExists;

                byte[] salt = PasswordHelper.GenerateSalt();
                bool res = ConHelper.execNonQuery(
                    /*$"insert into users (username, password_hash, salt, permissions) values (@username, @hash, @salt, @permission);",*/
                    $"insert into users (username, password_hash, salt) values (@username, @hash, @salt);",
                    new Dictionary<string, object> { { "@username", username }, { "@hash", PasswordHelper.HashPassword(password, salt) }, { "@salt", salt }/*, { "@permission", permBitmask } */}
                    );
                return userCreateStatus.Success;
            }
            catch (InternalServerError)
            {
                return userCreateStatus.InternalServerError;
            }
        }

        public static string? getUsername(Guid userID)
        {
            
            using (var reader = ConHelper.ExecuteReader("SELECT username FROM users where id = @userID;", new Dictionary<string, object> { { "@userID", userID } }))
            {
                if (reader == null) return null;

                return reader.Read() ? reader["username"].ToString() : null;
            }
        }

    }
    
    //public class PermissionHelper
    //{
    //    public static Permissions getPermissionBit(string permission)
    //    {
    //        switch (permission)
    //        {
    //            case "default": return Permissions.defaultPermission;
    //            case "seeAll": return Permissions.seeAllPermission;
    //            case "seeSelected": return Permissions.seeSelectedPermission;
    //            case "modifyAccess": return Permissions.modifyAccessPermission;
    //            default: return Permissions.defaultPermission;
    //        }
    //    }
    //    public static int createPermissionBitmask(List<string> permissions)
    //    {
    //        int res = 0;
    //        foreach (string perm in permissions)
    //        {
    //            res |= (int)getPermissionBit(perm);
    //        }
    //        return res;
    //    }
    //    public static int? UserPermission(Guid userID)
    //    {
    //        /*using (var reader = ConHelper.ExecuteReader("SELECT permissions FROM users where id = @userID;", new Dictionary<string, object> { { "@userID", userID } }))
    //        {
    //            if (!reader.Read()) return null;
    //            return (int)reader["permissions"];
    //        }*/
    //        Utils.assert(false);
    //        return 0;
    //    }
    //    public static bool? checkIfUserHasPermissions(Guid userID, int permissions)
    //    {
    //        /*
    //        using (var reader = ConHelper.ExecuteReader("SELECT permissions FROM users where id = @userID;", new Dictionary<string, object> { { "@userID", userID } }))
    //        {
    //            if (!reader.Read()) return null;
    //            return (((int)reader["permissions"]) & permissions) == permissions;
    //        }*/
    //        Utils.assert(false);
    //        return false;
    //    }
    //    public static bool? addPermissionToUser(Guid guid, Permissions permissions)
    //    {/*
    //        int? currentPermission = UserPermission(guid);
    //        if (currentPermission == null) return null; // user doesn't exist
    //        int addedPermission = currentPermission.Value | (int)permissions;
    //        return ConHelper.execNonQuery("UPDATE users SET permissions = @perms WHERE id = @userID", new Dictionary<string, object> { { "@perms", addedPermission }, { "@userID", guid } });*/
    //        Utils.assert(false);
    //        return false;
    //    }
    //    public static void addAccessToMachines(Guid userID, List<Guid> machines)
    //    {
    //        /*
    //        foreach (var machine in machines)
    //        {
    //            ConHelper.execNonQuery(
    //                    "INSERT INTO users_devices (user_id, device_id) SELECT @userID, @machineID WHERE NOT EXISTS (SELECT 1 FROM users_devices WHERE user_id = @userID AND device_id = @machineID)",
    //                new Dictionary<string, object> { { "@userID", userID }, { "@machineID", machine } });
    //        }*/
    //        Utils.assert(false);

    //    }
    //    public static void removeSpecificMachinesAccess(Guid userID)
    //    {
    //        //ConHelper.execNonQuery("REMOVE FROM users_devices where user_id = @userID", new Dictionary<string, object> { { "@userID", userID } });
    //        Utils.assert(false);
    //    }
    //}
}