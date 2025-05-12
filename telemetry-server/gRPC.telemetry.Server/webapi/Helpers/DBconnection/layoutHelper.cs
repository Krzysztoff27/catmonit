using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;
using webapi.webapi;

namespace webapi.Helpers.DBconnection
{
    public class LayoutHelper
    {
        public static bool? addOrUpdateLayout(Guid userID, string layoutName, string layoutData)
        {
            if (string.IsNullOrEmpty(layoutName) || string.IsNullOrEmpty(layoutData))
            {
                return null;
            }
            int? count = ConHelper.execCountQuery(
                    $"SELECT count(layout_id) FROM dashboard_layouts WHERE user_id = @userID AND layout_name = @layoutName;",
                    new Dictionary<string, object> { { "@userID", userID }, { "@layoutName", layoutName } });
            if (count == null) return null;
            if (count == 0)
            {
                return ((ConHelper.execNonQuery(
                    $"INSERT INTO dashboard_layouts (user_id, layout_name, layout_body) VALUES (@userID, @layoutName, @layoutData::json);",
                    new Dictionary<string, object> { { "@userID", userID }, { "@layoutName", layoutName }, { "@layoutData", (layoutData) } }) == null) ? null : true);
            }
            else
            {
                return ((ConHelper.execNonQuery(
                    $"UPDATE dashboard_layouts SET layout_body = @newLayout::json WHERE user_id = @userID AND layout_name = @layoutName;",
                    new Dictionary<string, object> { { "@userID", userID }, { "@layoutName", layoutName }, { "@newLayout", layoutData } }) == null) ? null : false);
            }
        }
        public static List<string>? getLayoutNames(Guid userID)
        {
            List<string> layoutNames = new List<string>();
            using (var reader = ConHelper.ExecuteReader("SELECT layout_name FROM dashboard_layouts WHERE user_id = @userID;", new Dictionary<string, object> { { "@userID", userID } }))
            {
                if (reader == null) return layoutNames;
                while (reader.Read())
                {
                    layoutNames.Add(reader.GetString("layout_name"));
                }
                return layoutNames;
            }
        }
        public static (int errorCode, JsonElement? json) getLayout(Guid userID, string name)
        {
            using (var reader = ConHelper.ExecuteReader("SELECT layout_body FROM dashboard_layouts WHERE user_id = @userID and layout_name = @layoutName;", new Dictionary<string, object>{{ "@userID", userID }, {"@layoutName", name} })){
                if (reader == null) return (500, null);
                return reader.Read() ? (200, JsonSerializer.Deserialize<JsonElement>(reader.GetString("layout_body"))) : (400, null);
            }
        }
        public static IActionResult renameLayout(Guid userID, string layoutname, string newLayoutName)
        {
            if (ConHelper.execCountQuery("SELECT count(layout_id) from dashboard_layouts where user_id = @userID AND layout_name = @newName;", new Dictionary<string, object> { { "@userID", userID }, { "@newName", newLayoutName } }) > 0)
                return Utils.returnVal(409, "layout with that name already exists");
            bool? updateResult = (ConHelper.execNonQuery("UPDATE dashboard_layouts set layout_name = @newName where user_id = @userID AND layout_name = @lName;", new Dictionary<string, object> { { "@userID", userID }, { "@lName", layoutname }, { "@newName", newLayoutName } }));
            if (updateResult == null) return Utils.returnVal(500);
            if (updateResult == true) return Utils.returnVal(200, "updated successfuly"); 
            else return Utils.returnVal(400, "initial layout doesnt exist");
        }
        public static bool? deleteLayout(Guid userID, string layoutname)
        {
            return ConHelper.execNonQuery("DELETE FROM dashboard_layouts where user_id = @userID AND layout_name = @lName;", new Dictionary<string, object> { { "@userID", userID }, { "@lName", layoutname } });
        }
    }
}
