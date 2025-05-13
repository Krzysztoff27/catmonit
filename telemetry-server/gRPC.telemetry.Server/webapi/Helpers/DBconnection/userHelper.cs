using gRPC.telemetry.Server.webapi.Helpers.DBconnection;


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
        seeAllPermission = 1<<0,
        modifyAccessPermission = 1<<1,
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


        // returns user id (starting from 1)
        // 0 is reserved for user not found / incorrect password
        public static (userAuthStatus status, Guid userID) userAuth(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password)) return (userAuthStatus.IncorrectPassword, Guid.Empty);
            using (var reader = ConHelper.ExecuteReader("SELECT id, password_hash, salt FROM users WHERE username = @username", new Dictionary<string, object> { { "@username", username } }))
            {
                if (reader == null)
                {
                    return (userAuthStatus.InternalServerError, Guid.Empty);
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
                    };
                }
                else
                {
                    return (userAuthStatus.UserDoesntExist, Guid.Empty);
                }
            }
        }

        public static userCreateStatus createUser(string username, string password, int permBitmask = (int) Permissions.defaultPermission)
        {
            int? count = ConHelper.execCountQuery(
                $"SELECT count(id) FROM users where username = @username;",
                new Dictionary<string, object> { { "@username", username } }
            );
            if (count == null) return userCreateStatus.InternalServerError;
            if (count != 0) return userCreateStatus.UserAlreadyExists;

            byte[] salt = PasswordHelper.GenerateSalt();
            bool? res = ConHelper.execNonQuery(
                "insert into users (username, password_hash, salt, permissions) values (@username, @hash, @salt, @permission);", 
                new Dictionary<string, object> { { "@username", username }, { "@hash", PasswordHelper.HashPassword(password, salt) }, { "@salt", salt }, { "@permission", permBitmask } }
                );
            if (res == null) return userCreateStatus.InternalServerError;
            return userCreateStatus.Success;
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

    public class PermissionHelper
    {
        public static Permissions getPermissionBit(string permission)
        {
            switch (permission)
            {
                case "default": return Permissions.defaultPermission;
                case "seeAll": return Permissions.seeAllPermission;
                case "modifyAccess": return Permissions.modifyAccessPermission;
                default: return Permissions.defaultPermission;
            }
        }
        public static int createPermissionBitmask(List<string> permissions)
        {
            int res = 0;
            foreach (string perm in permissions)
            {
                res |= (int)getPermissionBit(perm);
            }
            return res;
        }
        public static int? UserPermission(Guid userID)
        {
            using (var reader = ConHelper.ExecuteReader("SELECT permissions FROM users where id = @userID;", new Dictionary<string, object> { { "@userID", userID } }))
            {
                if (reader == null) return null;
                if (!reader.Read()) return null;
                return (int)reader["permissions"];
            }
        }
        public static bool? checkIfUserHasPermissions(Guid userID, int permissions)
        {

            using (var reader = ConHelper.ExecuteReader("SELECT permissions FROM users where id = @userID;", new Dictionary<string, object> { { "@userID", userID } }))
            {
                if (reader == null) return null;
                if (!reader.Read()) return null;
                return (((int)reader["permissions"]) & permissions) == permissions;
            }
        }
    }
}