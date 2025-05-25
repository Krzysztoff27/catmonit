using gRPC.telemetry.Server.webapi;
using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Runtime.InteropServices;
using System.Text.Json;
using webapi.webapi;

namespace webapi.Helpers.DBconnection
{
    public class LayoutInfo
    {
        public LayoutIDandName info { get; set; }
        public JsonElement? data { get; set; }
    }
    public class LayoutIDandName
    {
        public string name { get; set; }
        public Guid id { get; set; }
    }

    public class LayoutHelper
    {
        public static LayoutIDandName addLayout(Guid userID, string layoutName, string layoutData)
        {
            int count = ConHelper.execCountQuery(
                    $"SELECT count(layout_id) FROM dashboard_layouts WHERE user_id = @userID AND layout_name = @layoutName;",
                    new Dictionary<string, object> { { "@userID", userID }, { "@layoutName", layoutName } });
            if (count == 0)
            {
                using (var reader = ConHelper.ExecuteReader(
                    $"INSERT INTO dashboard_layouts (user_id, layout_name, layout_body) VALUES (@userID, @layoutName, @layoutData::json) RETURNING layout_id;",
                    new Dictionary<string, object> { { "@userID", userID }, { "@layoutName", layoutName }, { "@layoutData", (layoutData) } }))
                {
                    if (reader.Read())
                    {
                        return new LayoutIDandName { name = layoutName, id = (Guid)reader["layout_id"] };
                    }
                    else
                    {
                        throw new InternalServerError();
                    }
                }
            }
            else
            {
                return new LayoutIDandName { name = "", id = Guid.Empty };
            }
        }
        public static LayoutIDandName UpdateLayout(Guid layoutID, string layoutData)
        {
            int count = ConHelper.execCountQuery(
                    $"SELECT count(layout_id) FROM dashboard_layouts WHERE layout_id = @layoutID;",
                    new Dictionary<string, object> { { "@layoutID", layoutID } });
            if (count == 0)
            {
                return new LayoutIDandName { name = "", id = Guid.Empty };
            }
            else
            {
                using (var reader = ConHelper.ExecuteReader(
                    $"UPDATE dashboard_layouts SET layout_body = @newLayout::json WHERE layout_id = @layoutID RETURNING layout_name;",
                    new Dictionary<string, object> { { "@layoutID", layoutID }, { "@newLayout", layoutData } }))
                {
                    if (reader.Read())
                    {
                        return new LayoutIDandName { name = reader.GetString("layout_name"), id = layoutID };
                    }
                    else
                    {
                        throw new InternalServerError();
                    }

                }
            }
        }
        public static List<LayoutIDandName> getLayoutNamesAndIDs(Guid userID)
        {
            using (var reader = ConHelper.ExecuteReader("SELECT layout_id, layout_name FROM dashboard_layouts WHERE user_id = @userID;", new Dictionary<string, object> { { "@userID", userID } }))
            {
                List<LayoutIDandName> layoutNames = new List<LayoutIDandName>();
                while (reader.Read())
                {
                    layoutNames.Add(new LayoutIDandName { name = reader.GetString("layout_name"), id = (Guid)reader["layout_id"] });
                }
                return layoutNames;
            }
        }
        public static LayoutInfo getLayout(Guid LayoutID)
        {
            using (var reader = ConHelper.ExecuteReader(
                "SELECT layout_name, layout_body FROM dashboard_layouts WHERE layout_id = @layoutID;",
                new Dictionary<string, object> { { "@layoutID", LayoutID } })) { 
                if (reader.Read())
                {
                    return new LayoutInfo { info = new LayoutIDandName { name = reader.GetString("layout_name"), id = LayoutID }, data = JsonSerializer.Deserialize<JsonElement>(reader.GetString("layout_body")) };
                }
                else
                {
                    return new LayoutInfo { info = new LayoutIDandName { name = "", id = Guid.Empty }, data = null };
                }
            }
        }
        public static IActionResult renameLayout(Guid userID, Guid oldLayout, string newLayoutName)
        {
            try
            {
                if (ConHelper.execCountQuery("SELECT count(layout_id) from dashboard_layouts where user_id = @userID AND layout_name = @newName;", new Dictionary<string, object> { { "@userID", userID }, { "@newName", newLayoutName } }) > 0)
                    return Utils.returnVal(409, "layout with that name already exists");
                bool updateResult = (ConHelper.execNonQuery("UPDATE dashboard_layouts set layout_name = @newName where layout_id = @layoutID;", new Dictionary<string, object> { { "@layoutID", oldLayout }, { "@newName", newLayoutName } }));
                if (updateResult) return Utils.returnVal(200, "updated successfuly");
                else return Utils.returnVal(400, "initial layout doesnt exist");
            }
            catch (InternalServerError)
            {
                return Utils.returnVal(500);
            }
        }
        public static bool deleteLayout(Guid layoutID)
        {
            return ConHelper.execNonQuery("DELETE FROM dashboard_layouts where layout_id = @layoutID;", new Dictionary<string, object> { { "@layoutID", layoutID }});
        }
    }
}
