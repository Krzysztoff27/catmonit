namespace webapi.Models
{
    // HERE THE REQUEST MODELS ARE TO BE SENT IN BODY VIA POST REQUEST
    public class addAccessRequestModel
    {
        public Guid userID { get; set; }
        public string access { get; set; } // to be the string representation of Permission enum (default, seeAll, modifyAccess)
        public List<int>? Resources { get; set; } // if access = modifyAccess this shouldn't be null
    }
    public class addNotificationDeviceRequestModel
    {
        public string Token { get; set; }

    }

    // login request model is userModel
    // addUser request model is userModel
}
