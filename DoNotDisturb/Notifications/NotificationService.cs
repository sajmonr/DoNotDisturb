using System;
using DoNotDisturb.SignalR.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace DoNotDisturb.Notifications
{
    public class NotificationService : INotify
    {
        private readonly IHubContext<RoomHub> _roomContext;
        
        public NotificationService(IHubContext<RoomHub> roomContext)
        {
            _roomContext = roomContext;
        }
        
        public void Push(Notification notification)
        {
            switch (notification.NotificationType)
            {
                case NotificationType.MeetingsUpdated:
                    MeetingsUpdatedNotify(notification);
                    break;
                default:
                    throw new Exception("Notification type no implemented.");
            }
        }

        private void MeetingsUpdatedNotify(Notification notification)
        {
            if (!(notification is MeetingsUpdatedNotification meetingsNotification)) 
                return;
            
            _roomContext.Clients.Group(meetingsNotification.Room)
                .SendCoreAsync("meetingsUpdated", new object[]{ meetingsNotification.Meetings });
        }
        
    }
}