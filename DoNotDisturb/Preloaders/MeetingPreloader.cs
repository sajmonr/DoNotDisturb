using System;
using System.Collections.Generic;
using System.Linq;
using DoNotDisturb.Configurations;
using DoNotDisturb.Models;
using DoNotDisturb.Notifications;
using DoNotDisturb.Services;
using Google.Apis.Admin.Directory.directory_v1.Data;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;

namespace DoNotDisturb.Preloaders
{
    internal class MeetingPreloader : IPreload
    {
        private readonly GoogleService _google;
        private readonly RoomSubscriptionService _roomSubscription;
        private readonly INotify _notifications;
        private readonly int _maxEvents;

        private readonly DemoConfiguration _demo;
        
        private readonly object _meetingsLock = new object();
        
        private Dictionary<string, List<Meeting>> _meetings = new Dictionary<string, List<Meeting>>();

        public MeetingPreloader(GoogleConfiguration configuration, 
            DemoConfiguration demoConfiguration, 
            INotify notifications,
            GoogleService googleService, 
            RoomSubscriptionService roomSubscriptionService)
        {
            _google = googleService;
            _roomSubscription = roomSubscriptionService;
            _notifications = notifications;
            _demo = demoConfiguration;

            _maxEvents = configuration.MaxCalendarEvents;
        }

        public IEnumerable<Meeting> Get(string room, int maxResults)
        {
            var meetings = Array.Empty<Meeting>();

            lock (_meetingsLock)
            {
                if (_meetings.ContainsKey(room))
                    meetings = _meetings[room].Take(maxResults).ToArray();
            }

            return meetings;
        }

        public IEnumerable<Meeting> GetCurrent(string room, int maxResults)
        {
            if (!_demo.Enabled || room != _demo.RoomName) 
                return MeetingsForRoom(room, maxResults).ToArray();
            
            if (!_meetings.ContainsKey(_demo.RoomName))
                PreloadForDemo();
            
            return Get(_demo.RoomName, maxResults);

        }
        public void Preload()
        {
            if (!CanRun()) return;

            LoadSubscribers();
            
            foreach (var key in _meetings.Keys)
            {
                var m = PreloadForRoom(key);
                _notifications.Push(new MeetingsUpdatedNotification{Room = key, Meetings = m});                
            }
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
            
            //Handle demo mode here and exit
            if (_demo.Enabled && room == _demo.RoomName)
                return PreloadForDemo();

            var meetings = MeetingsForRoom(room, _maxEvents);

            lock (_meetingsLock)
            {
                _meetings[room].Clear();
                _meetings[room].AddRange(meetings);   
            }

            return meetings.ToArray();
        }
        private List<Meeting> MeetingsForRoom(string room, int maxMeetings)
        {
            var meetings = new List<Meeting>();
            
            if (string.IsNullOrEmpty(room))
                return meetings;

            var resource = GetResources().FirstOrDefault(r => r.ResourceName == room);

            if (!string.IsNullOrWhiteSpace(room) && resource != null)
                meetings.AddRange(
                    GetEvents(resource.ResourceEmail, maxMeetings).
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

        private Meeting[] PreloadForDemo()
        {
            //Check if the first meeting is still in progress - if it is do nothing.
            //Wait for X minutes after the meeting has ended - to showcase back-to-back transition.
            var first = _meetings.ContainsKey(_demo.RoomName) ? _meetings[_demo.RoomName].FirstOrDefault() : null;
            if (first == null || first.StartTime > DateTime.Now.AddHours(1))
            {
                var meetings = CreateDemoMeetings();
                lock (_meetingsLock)
                {
                    if (_meetings.ContainsKey(_demo.RoomName))
                    {
                        _meetings[_demo.RoomName].Clear();
                        _meetings[_demo.RoomName].AddRange(meetings);
                    }
                    else
                    {
                        _meetings.Add(_demo.RoomName, meetings);
                    }

                }
            }else if (first.EndTime < DateTime.Now)
            {
                lock (_meetingsLock)
                {
                    _meetings[_demo.RoomName].Remove(first);
                }
            }

            return _meetings[_demo.RoomName].ToArray();
        }
        private List<Meeting> CreateDemoMeetings()
        {
            var meetings = new List<Meeting>();

            
            //Demo meetings
            /*
             * 1) Meeting starts in 2 minutes - duration 5 minutes
             * 2) Meeting starts in 2 hours - duration 2 hours
             * 3) Meeting starts tomorrow at 7AM - duration 1 hour
             */

            meetings.Add(new Meeting
            {
                Title = "Early demo meeting",
                StartTime = DateTime.Now.AddMinutes(0.5),
                EndTime = DateTime.Now.AddMinutes(1.5),
                Owner = "John Doe 1"
            });
            
            meetings.Add(new Meeting
            {
                Title = "Late demo meeting",
                StartTime = DateTime.Now.AddHours(2),
                EndTime = DateTime.Now.AddHours(4),
                Owner = "Jane Doe 2"
            });

            var startTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.AddDays(1).Day, 7, 0, 0);
            
            meetings.Add(new Meeting
            {
                Title = "Morning demo meeting",
                StartTime = startTime,
                EndTime = startTime.AddHours(1),
                Owner = "John Doe 3"
            });
            
            return meetings;
        }
        
    }
}