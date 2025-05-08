using MySql.Data.MySqlClient;
using System.Text.Json;

namespace webapi.Helpers.DBconnection
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
                catch (MySqlException)
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
        public static (int errorCode, JsonElement? json) getLayout(uint userID, string name)
        {
            using (var conn = new MySqlConnection(Config.CM_CONNECTION_STRING))
            {
                try
                {
                    conn.Open();
                }
                catch (MySqlException)
                {
                    return (500, null);
                }

                string query = $"SELECT layout_body FROM dashboard_layouts WHERE user_id = @userID and layout_name = @layoutName;";
                using (var cmd = new MySqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@userID", userID);
                    cmd.Parameters.AddWithValue("@layoutName", name);

                    using (var reader = cmd.ExecuteReader())
                    {
                        return reader.Read() ? (200, JsonSerializer.Deserialize<JsonElement>(reader.GetString("layout_body"))) : (400, null);
                    }
                }
            }
        }
        public static bool? renameLayout(uint userID, string layoutname, string newLayoutName)
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
                string query = $"UPDATE dashboard_layouts set layout_name = @newName where user_id = @userID AND layout_name = @lName;";
                var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@userID", userID);
                cmd.Parameters.AddWithValue("@lName", layoutname);
                cmd.Parameters.AddWithValue("@newName", newLayoutName);
                cmd.ExecuteNonQuery();
                return true;
            }
        }
        public static bool? deleteLayout(uint userID, string layoutname)
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
                string query = $"DELETE FROM dashboard_layouts where user_id = @userID AND layout_name = @lName;";
                var cmd = new MySqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@userID", userID);
                cmd.Parameters.AddWithValue("@lName", layoutname);
                int rowsAffected = cmd.ExecuteNonQuery();
                return rowsAffected != 0;
            }
        }
    }
}
