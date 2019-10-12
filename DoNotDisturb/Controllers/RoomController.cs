using System;
using System.Collections.Generic;
using System.Linq;
using DoNotDisturb.Configurations;
using DoNotDisturb.Models;
using DoNotDisturb.Services;
using Google.Apis.Admin.Directory.directory_v1.Data;
using Microsoft.AspNetCore.Mvc;

namespace DoNotDisturb.Controllers
{
    [Route("api/[controller]/[action]")]
    public class RoomController
    {
        private readonly GoogleService _googleService;
        private readonly DemoConfiguration _demo;

        public RoomController(GoogleService googleService, DemoConfiguration demoConfiguration)
        {
            _googleService = googleService;
            _demo = demoConfiguration;
        }

        [HttpGet]
        public IEnumerable<MeetingRoom> GetMeetingRooms()
        {
            if (!_googleService.IsAuthorized)
                return Array.Empty<MeetingRoom>();

            var rooms = GetResources().Select(resource => new MeetingRoom
            {
                Name = resource.ResourceName,
                Building = resource.BuildingId,
                Description = resource.ResourceDescription,
                Email = resource.ResourceEmail
            }).ToList();

            if(_demo.Enabled)
                rooms.Insert(0, new MeetingRoom
                {
                    Name = _demo.RoomName,
                    Building = "DEMO BUILDING",
                    Description = "This meeting room is not a real world entity. This should not be used for production.",
                    Email = "demo@donotuse.com"
                });
            
            return rooms;
        } 
        
        private CalendarResource[] GetResources(IEnumerable<CalendarResource> start = null, string pageToken = "")
        {
            var resources = new List<CalendarResource>();

            if(start != null)
                resources.AddRange(start);
            
            var request = _googleService.DirectoryService.Resources.Calendars.List("my_customer");

            if (!string.IsNullOrEmpty(pageToken))
                request.PageToken = pageToken;

            var response = request.Execute();
            
            resources.AddRange(response.Items);
            
            return string.IsNullOrEmpty(response.NextPageToken) ? resources.ToArray() : GetResources(resources, response.NextPageToken);
        }
        
    }
}