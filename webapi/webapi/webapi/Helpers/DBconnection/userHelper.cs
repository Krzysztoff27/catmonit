using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Org.BouncyCastle.Crypto.Generators;
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

    public class userHelper
    {

        public static bool userExists(string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return false;
            }
            using (var conn = new MySqlConnection(Config.CM_CONNECTION_STRING))
            {
                try
                {
                    conn.Open();
                }
                catch (MySqlException ex)
                {
                    Console.WriteLine($"Error connecting to database: {ex.Message}");
                    return false;
                }
                string query = $"SELECT count(id) FROM users where username = @username;";
                var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@username", username);

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        int count = reader.GetInt32(0);
                        if (count != 0)
                        {
                            return true;
                        }
                    }
                }
            }
            return false;
        }


        // returns user id (starting from 1)
        // 0 is reserved for user not found / incorrect password
        public static (userAuthStatus status, uint userID) userAuth(string username, string password)
        {

            using (var conn = new MySqlConnection(Config.CM_CONNECTION_STRING))
            {
                try
                {
                    conn.Open();
                }
                catch (MySqlException ex)
                {
                    Console.WriteLine($"Error connecting to database: {ex.Message}");
                    return (userAuthStatus.InternalServerError, 0);
                }
                string query = "SELECT id, password_hash, salt FROM users WHERE username = @username";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@username", username);

                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            byte[] storedHash = (byte[])reader["password_hash"];
                            byte[] salt = (byte[])reader["salt"];

                            if (passwordHelper.VerifyPassword(password, salt, storedHash))
                            {
                                return (userAuthStatus.Success, (uint)(int)reader["id"]);
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
            }
        }

        public static userCreateStatus createUser(string username, string password)
        {

            using (var conn = new MySqlConnection(Config.CM_CONNECTION_STRING))
            {
                try
                {
                    conn.Open();
                }
                catch (Exception)
                {
                    return userCreateStatus.InternalServerError;
                }

                // check if user exists
                string query0 = $"SELECT count(id) FROM users where username = @username;";
                var cmd0 = new MySqlCommand(query0, conn);
                cmd0.Parameters.AddWithValue("@username", username);

                using (var reader = cmd0.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        int count = reader.GetInt32(0);
                        if (count != 0)
                        {
                            return userCreateStatus.UserAlreadyExists;
                        }
                    }
                }

                // add user
                string query = "insert into users (username, password_hash, salt) values (@username, @hash, @salt);";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    byte[] salt = passwordHelper.GenerateSalt();
                    cmd.Parameters.AddWithValue("@username", username);
                    cmd.Parameters.AddWithValue("@hash", passwordHelper.HashPassword(password, salt));
                    cmd.Parameters.AddWithValue("@salt", salt);

                    Utils.assert(cmd.ExecuteNonQuery() != 0);
                }
            }
            return userCreateStatus.Success;
        }

        public static List<deviceIdentifier> getDevices(uint userID)
        {
            List<deviceIdentifier> devices = new List<deviceIdentifier>();
            using (var conn = new MySqlConnection(Config.CM_CONNECTION_STRING))
            {
                try
                {
                    conn.Open();
                }
                catch (MySqlException ex)
                {
                    return devices;
                }
                string query = $"SELECT device_id FROM users_devices where user_id = @userID;";
                var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@userID", userID);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        devices.Add(
                            new deviceIdentifier { ID = (uint)(int)reader["device_id"] }
                        );
                    }
                }
            }
            return devices;
        }
        public static string? getUsername(uint userID)
        {
            using (var conn = new MySqlConnection(Config.CM_CONNECTION_STRING))
            {
                try
                {
                    conn.Open();
                }
                catch (MySqlException)
                {
                    return null;
                }
                string query = $"SELECT username FROM users where id = @userID;";
                var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@userID", userID);
                using (var reader = cmd.ExecuteReader())
                {
                    return reader.Read() ? reader["username"].ToString() : null;
                }
            }
        }
    }
}