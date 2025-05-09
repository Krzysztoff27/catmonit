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
    public class TokenStatusAndPayload
    {
        public TokenStatus status { get; set; }
        public TokenPayload payload { get; set; }
    }
    public class TokenStatusAndMessage
    {
        public int statusCode { get; set; }
        public string message { get; set; }
    }
    public enum TokenStatus
    {
        undefined = 0,
        valid = 1,
        expired = 2,
        invalid = 3
    }
    public class TokenValidator
    {
        public static TokenStatusAndPayload validate(string token)
        {
            TokenStatusAndPayload returnVal = new TokenStatusAndPayload { };
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

                        returnVal.status = TokenStatus.valid;
                        returnVal.payload = payload;
                        return returnVal;
                    }
                    catch (TokenExpiredException)
                    {
                        returnVal.status = TokenStatus.expired;
                        return returnVal;
                    }
                    catch (SignatureVerificationException)
                    {
                        returnVal.status = TokenStatus.invalid;
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
        public static TokenStatusAndMessage getReturnValue(TokenStatus status)
        {
            switch (status)
            {
                case TokenStatus.valid:
                    return new TokenStatusAndMessage { statusCode = 200, message = "valid token" };
                case TokenStatus.expired:
                    return new TokenStatusAndMessage { statusCode = 401, message = "token expired" };
                case TokenStatus.invalid:
                    return new TokenStatusAndMessage { statusCode = 401, message = "token invalid" };
                default:
                    return new TokenStatusAndMessage { statusCode = 400, message = "token undefined" };
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
