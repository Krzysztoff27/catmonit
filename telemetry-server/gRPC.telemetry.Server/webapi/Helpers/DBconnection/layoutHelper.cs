using gRPC.telemetry.Server.webapi;
using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;
using webapi.webapi;

namespace webapi.Helpers.DBconnection
{
    public class LayoutHelper
    {
        public static bool addOrUpdateLayout(Guid userID, string layoutName, string layoutData)
        {
            int count = ConHelper.execCountQuery(
                    $"SELECT count(layout_id) FROM dashboard_layouts WHERE user_id = @userID AND layout_name = @layoutName;",
                    new Dictionary<string, object> { { "@userID", userID }, { "@layoutName", layoutName } });
            if (count == 0)
            {
                ConHelper.execNonQuery(
                    $"INSERT INTO dashboard_layouts (user_id, layout_name, layout_body) VALUES (@userID, @layoutName, @layoutData::json);",
                    new Dictionary<string, object> { { "@userID", userID }, { "@layoutName", layoutName }, { "@layoutData", (layoutData) } });
                return true;
            }
            else
            {
                ConHelper.execNonQuery(
                    $"UPDATE dashboard_layouts SET layout_body = @newLayout::json WHERE user_id = @userID AND layout_name = @layoutName;",
                    new Dictionary<string, object> { { "@userID", userID }, { "@layoutName", layoutName }, { "@newLayout", layoutData } });
                return false;
            }
        }
        public static List<string> getLayoutNames(Guid userID)
        {
            using (var reader = ConHelper.ExecuteReader("SELECT layout_name FROM dashboard_layouts WHERE user_id = @userID;", new Dictionary<string, object> { { "@userID", userID } }))
            {
                List<string> layoutNames = new List<string>();
                while (reader.Read())
                {
                    layoutNames.Add(reader.GetString("layout_name"));
                }
                return layoutNames;
            }
        }
        public static JsonElement? getLayout(Guid userID, string name)
        {
            using (var reader = ConHelper.ExecuteReader(
                "SELECT layout_body FROM dashboard_layouts WHERE user_id = @userID and layout_name = @layoutName;", 
                new Dictionary<string, object>{{ "@userID", userID }, {"@layoutName", name} })) { 

                return (reader.Read() ? JsonSerializer.Deserialize<JsonElement>(reader.GetString("layout_body")) : null);
            }
        }
        public static IActionResult renameLayout(Guid userID, string layoutname, string newLayoutName)
        {
            try
            {
                if (ConHelper.execCountQuery("SELECT count(layout_id) from dashboard_layouts where user_id = @userID AND layout_name = @newName;", new Dictionary<string, object> { { "@userID", userID }, { "@newName", newLayoutName } }) > 0)
                    return Utils.returnVal(409, "layout with that name already exists");
                bool updateResult = (ConHelper.execNonQuery("UPDATE dashboard_layouts set layout_name = @newName where user_id = @userID AND layout_name = @lName;", new Dictionary<string, object> { { "@userID", userID }, { "@lName", layoutname }, { "@newName", newLayoutName } }));
                if (updateResult) return Utils.returnVal(200, "updated successfuly");
                else return Utils.returnVal(400, "initial layout doesnt exist");
            }
            catch (InternalServerError)
            {
                return Utils.returnVal(500);
            }
        }
        public static bool deleteLayout(Guid userID, string layoutname)
        {
            return ConHelper.execNonQuery("DELETE FROM dashboard_layouts where user_id = @userID AND layout_name = @lName;", new Dictionary<string, object> { { "@userID", userID }, { "@lName", layoutname } });
        }
    }
}
