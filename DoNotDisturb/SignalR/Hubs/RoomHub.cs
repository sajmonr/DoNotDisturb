using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DoNotDisturb.Models;
using DoNotDisturb.Preloaders;
using DoNotDisturb.Services;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace DoNotDisturb.SignalR.Hubs
{
    public class RoomHub : Hub
    {
        private readonly GoogleService _google;
        private readonly RoomSubscriptionService _roomSubscription;
        private readonly IPreloader _preloader;

        public RoomHub(GoogleService googleService, IPreloader preloadService, RoomSubscriptionService roomSubscriptionService)
        {
            _google = googleService;
            _preloader = preloadService;
            _roomSubscription = roomSubscriptionService;
        }

        [HubMethodName("getMeetings")]
        public IEnumerable<Meeting> GetMeetings(string room, int maxResults)
        {
            var meetingPreloader = _preloader.Get<MeetingPreloader>();

            return meetingPreloader != null ? meetingPreloader.GetCurrent(room, maxResults) : Array.Empty<Meeting>();
        }
        
        [HubMethodName("subscribe")]
        public async void Subscribe(string roomName, string deviceName, int deviceType)
        {
            var device = new RoomDevice
            {
                ConnectionId = Context.ConnectionId,
                Name = deviceName,
                DeviceType = (RoomDeviceType) deviceType
            };

            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            
            _roomSubscription.Subscribe(roomName, device);
        }

        public static void MeetingsUpdated(IHubContext<RoomHub> roomContext, string room, IEnumerable<Meeting> meetings)
        {
            roomContext.Clients.Group(room)
                .SendCoreAsync("meetingsUpdated", new object[]{ meetings });
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            _roomSubscription.Unsubscribe(new RoomDevice{ ConnectionId = Context.ConnectionId});
            return base.OnDisconnectedAsync(exception);
        }
    }
}