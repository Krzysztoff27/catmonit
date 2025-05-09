using Npgsql;
using System.Data;
namespace gRPC.telemetry.Server.webapi.Helpers.DBconnection
{
    public class ConHelper
    {
        public static int? execCountQuery(string query, Dictionary<string, object> parameters)
        {
            using (var conn = new NpgsqlConnection(Config.CM_POSTGRES_CONNECTION_STRING))
            {
                try
                {
                    conn.Open();
                }
                catch (NpgsqlException)
                {
                    return null;
                }

                int count = 0;
                using (var cmd = new NpgsqlCommand(query, conn))
                {
                    foreach (var param in parameters)
                    {
                        cmd.Parameters.AddWithValue(param.Key, param.Value);
                    }

                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            count = reader.GetInt32(0);
                            return count;
                        }
                        else
                        {
                            return 0; // no rows returned
                        }
                    }
                }
            }
        }

        public static bool? execNonQuery(string query, Dictionary<string, object> parameters)
        {
            using (var conn = new NpgsqlConnection(Config.CM_POSTGRES_CONNECTION_STRING))
            {
                try
                {
                    conn.Open();
                }
                catch (NpgsqlException)
                {
                    return null;
                }

                using (var cmd = new NpgsqlCommand(query, conn))
                {
                    foreach (var param in parameters)
                    {
                        cmd.Parameters.AddWithValue(param.Key, param.Value);
                    }

                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
        }
        public static NpgsqlDataReader? ExecuteReader(string query, Dictionary<string, object> parameters)
        {
            var conn = new NpgsqlConnection(Config.CM_POSTGRES_CONNECTION_STRING);

            try
            {
                conn.Open();
            }
            catch (NpgsqlException)
            {
                return null;
            }
            var cmd = new NpgsqlCommand(query, conn);

            foreach (var param in parameters)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);
            }
            
            return cmd.ExecuteReader(CommandBehavior.CloseConnection);
        }
    }
}
