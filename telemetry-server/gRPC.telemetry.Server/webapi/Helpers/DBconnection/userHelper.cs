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
        public static (userAuthStatus status, int userID) userAuth(string username, string password)
        {

            using (var reader = ConHelper.ExecuteReader("SELECT id, password_hash, salt FROM users WHERE username = @username", new Dictionary<string, object> { { "@username", username } }))
            {
                if (reader == null)
                {
                    return (userAuthStatus.InternalServerError, 0);
                }
                if (reader.Read())
                {
                    byte[] storedHash = (byte[])reader["password_hash"];
                    byte[] salt = (byte[])reader["salt"];
                    if (PasswordHelper.VerifyPassword(password, salt, storedHash))
                    {
                        return (userAuthStatus.Success, (int)reader["id"]);
                    }
                    else
                    {
                        return (userAuthStatus.IncorrectPassword, 0);
                    };
                }
                else
                {
                    return (userAuthStatus.UserDoesntExist, 0);
                }
            }
        }

        public static userCreateStatus createUser(string username, string password)
        {
            int? count = ConHelper.execCountQuery(
                $"SELECT count(id) FROM users where username = @username;",
                new Dictionary<string, object> { { "@username", username } }
            );
            if (count == null) return userCreateStatus.InternalServerError;
            if (count != 0) return userCreateStatus.UserAlreadyExists;

            byte[] salt = PasswordHelper.GenerateSalt();
            bool? res = ConHelper.execNonQuery(
                "insert into users (username, password_hash, salt) values (@username, @hash, @salt);", 
                new Dictionary<string, object> { { "@username", username }, { "@hash", PasswordHelper.HashPassword(password, salt) }, { "@salt", salt } }
                );
            if (res == null) return userCreateStatus.InternalServerError;
            return userCreateStatus.Success;
        }

        public static List<DeviceIdentifier> getDevices(int userID)
        {
            List<DeviceIdentifier> devices = new List<DeviceIdentifier>();
            using (var reader = ConHelper.ExecuteReader("SELECT device_id FROM users_devices where user_id = @userID;", new Dictionary<string, object> { { "@userID", userID} }))
            {
                if (reader == null) return devices;

                while (reader.Read())
                {
                    devices.Add(
                        new DeviceIdentifier { ID = (int)reader["device_id"] }
                    );
                }
            }
            return devices;
        }
        public static string? getUsername(int userID)
        {
            using (var reader = ConHelper.ExecuteReader("SELECT username FROM users where id = @userID;", new Dictionary<string, object> { { "@userID", userID } }))
            {
                if (reader == null) return null;

                return reader.Read() ? reader["username"].ToString() : null;
            }
        }
    }
}