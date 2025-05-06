using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Org.BouncyCastle.Crypto.Generators;


namespace webapi.Helpers
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
    public class userValidator
    {

        private readonly string connectionString;

        public userValidator(string connectionStringArg)
        {
            connectionString = connectionStringArg;
        }

        public bool userExists(string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                return false;
            }
            using (var conn = new MySqlConnection(connectionString))
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
        public (userAuthStatus status, uint userID) userAuth(string username, string password) 
        {

            using (var conn = new MySqlConnection(connectionString))
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
                                return (userAuthStatus.Success, (uint)((int)reader["id"]));
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

        public userCreateStatus createUser(string username, string password)
        {

            using (var conn = new MySqlConnection(connectionString))
            {
                try
                {
                    conn.Open();
                }
                catch (Exception ex)
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
    }
}