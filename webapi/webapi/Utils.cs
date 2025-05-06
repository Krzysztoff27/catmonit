using System.Diagnostics;

namespace webapi
{
    public class Utils
    {
        public static void assert(bool value)
        {
            Debug.Assert(value);
        }
    }
}
