using JWT.Algorithms;
using JWT.Exceptions;
using JWT.Serializers;
using JWT;
using System.Net.WebSockets;
using System.Text;
using webapi.Models;
using webapi.Monitoring;

namespace webapi.Helpers
{
    public class tokenStatusAndPayload
    {
        public tokenStatus status { get; set; }
        public TokenPayload payload { get; set; }
    }
    public class tokenStatusAndMessage
    {
        public int statusCode { get; set; }
        public string message { get; set; }
    }
    public enum tokenStatus
    {
        undefined = 0,
        valid = 1,
        expired = 2,
        invalid = 3
    }
    public class tokenValidator
    {
        public static tokenStatusAndPayload validate(string token)
        {
            tokenStatusAndPayload returnVal = new tokenStatusAndPayload { };
            if (!string.IsNullOrEmpty(token))
                {

                    try
                    {
                        var jsonSerializer = new JsonNetSerializer();
                        var urlEncoder = new JwtBase64UrlEncoder();
                        var dateTimeProvider = new UtcDateTimeProvider();
                        var validator = new JwtValidator(jsonSerializer, dateTimeProvider);
                        var algorithm = new HMACSHA256Algorithm();
                        var decoder = new JwtDecoder(jsonSerializer, validator, urlEncoder, algorithm);

                        var payload = decoder.DecodeToObject<TokenPayload>(token, Config.CM_JWT_SECRET, verify: true);

                        returnVal.status = tokenStatus.valid;
                        returnVal.payload = payload;
                        return returnVal;
                    }
                    catch (TokenExpiredException)
                    {
                        returnVal.status = tokenStatus.expired;
                        return returnVal;
                    }
                    catch (SignatureVerificationException)
                    {
                        returnVal.status = tokenStatus.invalid;
                        return returnVal;
                    }
                    catch (Exception)
                    {
                        return returnVal;
                    }
                }
                else
                {
                    return returnVal;
                }
        }
        public static tokenStatusAndMessage getReturnValue(tokenStatus status)
        {
            switch (status)
            {
                case tokenStatus.valid:
                    return new tokenStatusAndMessage { statusCode = 200, message = "valid token" };
                case tokenStatus.expired:
                    return new tokenStatusAndMessage { statusCode = 401, message = "token expired" };
                case tokenStatus.invalid:
                    return new tokenStatusAndMessage { statusCode = 401, message = "token invalid" };
                default:
                    return new tokenStatusAndMessage { statusCode = 400, message = "token undefined" };
            }
        }

        /*
            if (Request.Headers.TryGetValue("Authentication", out var authHeader))
            {
                var token = authHeader.ToString();
                tokenStatusAndPayload statNpayload = tokenValidator.validate(token);
                if (statNpayload.status == tokenStatus.valid)
                {

                }
                else
                {
                    var response = tokenValidator.getReturnValue(statNpayload.status);
                    return Utils.returnVal(response.statusCode, response.message);
                }
            }
            else
            {
                return Utils.returnVal(401, "token not found");
            }
         */
    }
}
