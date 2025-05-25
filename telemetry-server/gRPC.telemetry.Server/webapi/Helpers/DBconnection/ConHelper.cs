using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;
using System.Data;
using webapi.webapi;
namespace gRPC.telemetry.Server.webapi.Helpers.DBconnection
{
    public class ConHelper
    {
        private static void openConnection(NpgsqlConnection conn) {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(1));

            try
            {
                conn.OpenAsync(cts.Token).GetAwaiter().GetResult();
            }
            catch (OperationCanceledException)
            {
                Console.WriteLine("Connection attempt timed out.");
                throw new InternalServerError(); // or a timeout-specific exception
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw new InternalServerError();
            }
        }
        public static int execCountQuery(string query, Dictionary<string, object> parameters)
        {
            using (var conn = new NpgsqlConnection(Config.GetConnectionString()))
            {
                openConnection(conn);

                int count = 0;
                using (var cmd = new NpgsqlCommand(query, conn))
                {
                    foreach (var param in parameters)
                    {
                        cmd.Parameters.AddWithValue(param.Key, param.Value);
                    }
                    try
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            reader.Read();
                            count = reader.GetInt32(0);
                            return count;
                        }
                    }
                    catch (Exception)
                    {
                        Utils.assert(false);
                        throw new InternalServerError();
                    }
                }
            }
        }

        public static bool execNonQuery(string query, Dictionary<string, object> parameters)
        {
            using (var conn = new NpgsqlConnection(Config.GetConnectionString()))
            {
                openConnection(conn);

                using (var cmd = new NpgsqlCommand(query, conn))
                {
                    foreach (var param in parameters)
                    {
                        cmd.Parameters.AddWithValue(param.Key, param.Value);
                    }
                    try
                    {
                        int rowsAffected = cmd.ExecuteNonQuery();
                        return rowsAffected > 0;
                    } 
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                        throw new InternalServerError();
                    }
                }
            }
        }
        public static NpgsqlDataReader ExecuteReader(string query, Dictionary<string, object> parameters)
        {
            var conn = new NpgsqlConnection(Config.GetConnectionString());
            openConnection(conn);
            var cmd = new NpgsqlCommand(query, conn);

            foreach (var param in parameters)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);
            }
            try
            {
                return cmd.ExecuteReader(CommandBehavior.CloseConnection);
            }
            catch (Exception)
            {
                throw new InternalServerError();
            }
        }
        public static bool execTransactionWithNoArgs(string query0, string query1)
        {

            using (var conn = new NpgsqlConnection(Config.GetConnectionString()))
            {
                openConnection(conn);
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
                    catch (Exception)
                    {
                        transaction.Rollback();
                        return false;
                    }
                }
            }
        }
        public static bool execTransactionWithArgs(string query0, Dictionary<string, object> query0Args, string query1, Dictionary<string, object> query1Args)
        {

            using (var conn = new NpgsqlConnection(Config.GetConnectionString()))
            {
                openConnection(conn);

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
                    catch (Exception)
                    {
                        transaction.Rollback();
                        return false;
                    }
                }
            }
        }
    }
}
