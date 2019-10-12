using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using DoNotDisturb.Configurations;
using DoNotDisturb.Models;
using DoNotDisturb.Notifications;
using DoNotDisturb.Services;
using Google.Apis.Admin.Directory.directory_v1.Data;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

namespace DoNotDisturb.Preloaders
{
    internal class MeetingPreloader : IPreload
    {
        private readonly GoogleService _google;
        private readonly RoomSubscriptionService _roomSubscription;
        private readonly INotify _notifications;
        private readonly int _maxEvents;

        private readonly object _meetingsLock = new object();
        
        private Dictionary<string, List<Meeting>> _meetings = new Dictionary<string, List<Meeting>>();

        public MeetingPreloader(GoogleConfiguration configuration, INotify notifications,
            GoogleService googleService, RoomSubscriptionService roomSubscriptionService)
        {
            _google = googleService;
            _roomSubscription = roomSubscriptionService;
            _notifications = notifications;

            _maxEvents = configuration.MaxCalendarEvents;
        }

        public IEnumerable<Meeting> Get(string room, int maxResults)
        {
            return null;
        }

        public IEnumerable<Meeting> GetCurrent(string room, int maxResults)
        {
            return null;
        }
        
        public void Preload()
        {
            if (!CanRun()) return;
            
            if(_meetings.Count == 0)
                _meetings.Add("CX-ThePub", new List<Meeting>());
            
            /*
            LoadSubscribers();
            foreach (var key in _meetings.Keys)
                PreloadForRoom(key);
            */
            
            var m = PreloadForRoom("CX-ThePub");
            _notifications.Push(new MeetingsUpdatedNotification{Room = "CX-ThePub", Meetings = m});
        }
        
        private void LoadSubscribers()
        {
            var keysToDelete = new List<string>();
            var keysToAdd = new List<string>();
            
            foreach (var (key, value) in _roomSubscription.GetSubscribers())
            {
                if (_meetings.ContainsKey(key))
                {
                    if (value.Length == 0)
                        keysToDelete.Add(key);
                }
                else
                {
                    keysToAdd.Add(key);
                }
            }

            lock (_meetingsLock)
            {
                keysToDelete.ForEach(key => _meetings.Remove(key));
                keysToAdd.ForEach(key => _meetings.Add(key, new List<Meeting>()));   
            }
        }
        private Meeting[] PreloadForRoom(string room)
        {
            if (!_meetings.ContainsKey(room))
                return Array.Empty<Meeting>();
            
            var meetings = MeetingsForRoom(room);

            lock (_meetingsLock)
            {
                _meetings[room].Clear();
                _meetings[room].AddRange(meetings);   
            }

            return meetings.ToArray();
        }
        private List<Meeting> MeetingsForRoom(string room)
        {
            var meetings = new List<Meeting>();
            
            if (string.IsNullOrEmpty(room))
                return meetings;

            var resource = GetResources().FirstOrDefault(r => r.ResourceName == room);

            if (!string.IsNullOrWhiteSpace(room) && resource != null)
                meetings.AddRange(
                    GetEvents(resource.ResourceEmail, _maxEvents).
                        Select(evt => new Meeting
                        {
                            Title = evt.Summary,
                            StartTime = GetDateTime(evt.Start.DateTime),
                            EndTime = GetDateTime(evt.End.DateTime),
                            Owner = evt.Creator.DisplayName
                        }));
            
            return meetings;
        }
        private DateTime GetDateTime(DateTime? dateTime) => dateTime ?? DateTime.MinValue;
        private CalendarResource[] GetResources(IEnumerable<CalendarResource> start = null, string pageToken = "")
        {
            if (!_google.IsAuthorized)
                return Array.Empty<CalendarResource>();
            
            var resources = new List<CalendarResource>();

            if (start != null)
                resources.AddRange(start);

            var request = _google.DirectoryService.Resources.Calendars.List("my_customer");

            if (!string.IsNullOrEmpty(pageToken))
                request.PageToken = pageToken;

            var response = request.Execute();

            resources.AddRange(response.Items);

            return string.IsNullOrEmpty(response.NextPageToken) ? resources.ToArray() : GetResources(resources, response.NextPageToken);
        }
        private Event[] GetEvents(string calendarId, int maxEvents)
        {
            var events = new List<Event>();
            var request = _google.CalendarService.Events.List(calendarId);
            string pageToken = string.Empty;

            //Setup common properties for request
            request.TimeMin = DateTime.Now;
            request.SingleEvents = true;
            request.OrderBy = EventsResource.ListRequest.OrderByEnum.StartTime;

            do
            {
                request.MaxResults = maxEvents;
                if (!string.IsNullOrEmpty(pageToken))
                    request.PageToken = pageToken;

                var response = request.Execute();

                maxEvents -= response.Items.Count;

                events.AddRange(response.Items);

            } while (!string.IsNullOrEmpty(pageToken) || maxEvents > 0);

            return events.ToArray();
        }
        private bool CanRun() => _google.IsAuthorized;

    }
}