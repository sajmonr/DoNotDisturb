namespace DoNotDisturb.Notifications
{
    public abstract class Notification
    {
        public NotificationType NotificationType { get; }

        protected Notification(NotificationType type)
        {
            NotificationType = type;
        }
        
    }
}