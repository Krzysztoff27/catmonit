using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using Org.BouncyCastle.Crypto.Generators;


namespace webapi.Helpers
{
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
                string query = $"SELECT id FROM users where username = \"{username}\";";
                var cmd = new MySqlCommand(query, conn);

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        public uint userAuth(string username, string password) // returns user id (starting from 1)
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
                    return 0;
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
                                return (uint)((int)reader["id"]);
                            }
                            else
                            {
                                return 0;
                            };
                        }
                        else
                        {
                            return 0;
                        }
                    }
                }
            }
            return 0;
        }

        public string createUser(string username, string password)
        {

            using (var conn = new MySqlConnection(connectionString))
            {
                try
                {
                    conn.Open();
                }
                catch (Exception ex)
                {
                    return "cannot add user";
                }
                    string query = "insert into users (username, password_hash, salt) values (@username, @hash, @salt);";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    byte[] salt = passwordHelper.GenerateSalt();
                    cmd.Parameters.AddWithValue("@username", username);
                    cmd.Parameters.AddWithValue("@hash", passwordHelper.HashPassword(password, salt));
                    cmd.Parameters.AddWithValue("@salt", salt);

                    cmd.ExecuteNonQuery();
                }
            }
            return "success";
        }
    }
}