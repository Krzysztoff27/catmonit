namespace webapi.Models
{
    // HERE THE REQUEST MODELS ARE TO BE SENT IN BODY VIA POST REQUEST
    public class addAccessRequestModel
    {
        public string Token { get; set; }
        public int userID { get; set; }
        public List<int> Resources { get; set; }
    }
    public class addNotificationDeviceRequestModel
    {
        public string Token { get; set; }

    }

    // login request model is userModel
    // addUser request model is userModel
}
