using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using webapi.Helpers;
using webapi.Helpers.DBconnection;
using webapi.Models;

namespace webapi.webapi
{

    public class authResult
    {
        // will return either
        //      - payload not null and res null - atuhenticated
        //      - payload null and res not null - failure authenticating (recommended to return).
        public IActionResult? res { get; set; }
        public TokenPayload? payload { get; set; }
    }
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

        public static authResult Authenticate(HttpRequest Request)
        {
            if (Request.Headers.TryGetValue("Authentication", out var authHeader))
            {
                var token = authHeader.ToString();
                TokenStatusAndPayload statNpayload = TokenValidator.validate(token);
                if (statNpayload.status == TokenStatus.valid)
                {
                    return new authResult { payload = statNpayload.payload, res = null };
                }
                else
                {
                    var response = TokenValidator.getReturnValue(statNpayload.status);
                    return new authResult { res = Utils.returnVal(response.statusCode, response.message), payload = null};
                }
            }
            else
            {
                return new authResult { res = Utils.returnVal(401, "token not found"), payload = null };
            }
        }
    }
}
