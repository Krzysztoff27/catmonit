using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace webapi.webapi
{
    public class Utils
    {
        public static void assert(bool value)
        {
            Debug.Assert(value);
        }
        public static IActionResult returnVal(int statusCode, string message = "")
        {
            if (string.IsNullOrEmpty(message))
            {
                switch (statusCode)
                {
                    case 400:
                        message = "Bad Request";
                        break;
                    case 401:
                        message = "Unauthorized";
                        break;
                    case 403:
                        message = "Forbidden";
                        break;
                    case 404:
                        message = "Not Found";
                        break;
                    case 500:
                        message = "Internal Server Error";
                        break;
                    case 501:
                        message = "Unknown Error";
                        break;
                    default:
                        message = "Unknown Error";
                        break;
                }
            }

            var data = new { Message = message };
            return new ObjectResult(data) { StatusCode = statusCode };
        }
    }
}
