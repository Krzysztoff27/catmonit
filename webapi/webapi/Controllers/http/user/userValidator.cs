using MySql.Data.MySqlClient;

namespace webapi.Controllers.http.user
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

            using (var conn = new MySqlConnection(connectionString))
            {
                conn.Open();
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

        public bool userAuth(string username, string password)
        {

            using (var conn = new MySqlConnection(connectionString))
            {
                conn.Open();
                string query = $"SELECT id FROM users where username = \"{username}\" and password = \"{password}\";";
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

    }
}
