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
                        reader.Read();
                        count = reader.GetInt32(0);
                        return count;
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
        public static bool? execTransactionWithNoArgs(string query0, string query1)
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
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        using (var cmd1 = new NpgsqlCommand(query0, conn, transaction))
                        {
                            cmd1.ExecuteNonQuery();
                        }

                        using (var cmd2 = new NpgsqlCommand(query1, conn, transaction))
                        {
                            cmd2.ExecuteNonQuery();
                        }

                        transaction.Commit();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return false;
                    }
                }
            }
        }
        public static bool? execTransactionWithArgs(string query0, Dictionary<string, object> query0Args, string query1, Dictionary<string, object> query1Args)
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
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        using (var cmd1 = new NpgsqlCommand(query0, conn, transaction))
                        {
                            foreach (var param0 in query0Args)
                            {
                                cmd1.Parameters.AddWithValue(param0.Key, param0.Value);
                            }

                            cmd1.ExecuteNonQuery();
                        }

                        using (var cmd2 = new NpgsqlCommand(query1, conn, transaction))
                        {
                            foreach (var param1 in query1Args)
                            {
                                cmd2.Parameters.AddWithValue(param1.Key, param1.Value);
                            }

                            cmd2.ExecuteNonQuery();
                        }

                        transaction.Commit();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return false;
                    }
                }
            }
        }
    }
}
