namespace webapi.Models
{
    // HERE THE REQUEST MODELS ARE TO BE SENT IN BODY VIA POST REQUEST
    public class addAccessRequestModel
    {
        public Guid userID { get; set; }
        public string access { get; set; } // to be the string representation of Permission enum 
        public List<Guid> devicesIDs { get; set; }
    }
    public class addNotificationDeviceRequestModel
    {
        public string Token { get; set; }

    }

    public class createUserRequest
    {
        public string username { get; set; }
        public string password { get; set; }
        // public List<string>? permissions { get; set; } // to be the string representation of Permission enum (eg. "seeAll")
    }

    // login request model is userModel

}
