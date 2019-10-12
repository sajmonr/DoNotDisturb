using System.Collections.Generic;
using DoNotDisturb.Models;

namespace DoNotDisturb.Notifications
{
    public class MeetingsUpdatedNotification : Notification
    {
        public string Room { get; set; }
        public IEnumerable<Meeting> Meetings { get; set; }

        public MeetingsUpdatedNotification() : base(NotificationType.MeetingsUpdated)
        {
        }

    }
}