using MySql.Data.MySqlClient;

namespace webapi.Helpers
{
    public class layoutHelper
    {
        public static bool? addOrUpdateLayout(uint userID, string layoutName, string layoutData)
        {
            if (string.IsNullOrEmpty(layoutName) || string.IsNullOrEmpty(layoutData))
            {
                return null;
            }

            using (var conn = new MySqlConnection(Config.CM_CONNECTION_STRING))
            {
                try
                {
                    conn.Open();
                }
                catch (MySqlException ex)
                {
                    return null;
                }

                int count = 0;
                // Check if the layout exists
                string query0 = $"SELECT count(layout_id) FROM dashboard_layouts WHERE user_id = @userID AND layout_name = @layoutName;";
                using (var cmd0 = new MySqlCommand(query0, conn))
                {
                    cmd0.Parameters.AddWithValue("@userID", userID);
                    cmd0.Parameters.AddWithValue("@layoutName", layoutName);

                    using (var reader = cmd0.ExecuteReader())
                    {
                        reader.Read();
                        count = reader.GetInt32(0);

                    }
                }

                if (count == 0)
                {
                    string query = $"INSERT INTO dashboard_layouts (user_id, layout_name, layout_body) VALUES (@userID, @layoutName, @layoutData);";
                    using (var cmd = new MySqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@userID", userID);
                        cmd.Parameters.AddWithValue("@layoutName", layoutName);
                        cmd.Parameters.AddWithValue("@layoutData", layoutData);
                        cmd.ExecuteNonQuery();
                    }
                    return true;
                }
                else
                {
                    string query = $"UPDATE dashboard_layouts SET layout_body = @newLayout WHERE user_id = @userID AND layout_name = @layoutName;";
                    using (var cmd = new MySqlCommand(query, conn))
                    {
                        cmd.Parameters.AddWithValue("@userID", userID);
                        cmd.Parameters.AddWithValue("@layoutName", layoutName);
                        cmd.Parameters.AddWithValue("@newLayout", layoutData);
                        cmd.ExecuteNonQuery();
                    }
                    return false;
                }
            }
        }
        public static List<string>? getLayoutNames(uint userID)
        {

            List<string> layoutNames = new List<string>();

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

                string query = $"SELECT layout_name FROM dashboard_layouts WHERE user_id = @userID;";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@userID", userID);

                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            layoutNames.Add(reader.GetString("layout_name"));
                        }
                    }
                }
            }

            return layoutNames;
        }
        public static string? getLayout(uint userID, string name)
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

                string query = $"SELECT layout_body FROM dashboard_layouts WHERE user_id = @userID and layout_name = @layoutName;";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@userID", userID);
                    cmd.Parameters.AddWithValue("@layoutName", name);

                    using (var reader = cmd.ExecuteReader())
                    {
                        reader.Read();
                        return reader.GetString("layout_body");
                    }
                }
            }
        }
    }
}
