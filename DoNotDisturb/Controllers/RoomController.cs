using System;
using System.Collections.Generic;
using System.Linq;
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

        public RoomController(GoogleService googleService)
        {
            _googleService = googleService;
        }

        [HttpGet]
        public IEnumerable<MeetingRoom> GetMeetingRooms()
        {
            if (!_googleService.IsAuthorized)
                return Array.Empty<MeetingRoom>();

            return GetResources().Select(resource => new MeetingRoom
            {
                Name = resource.ResourceName,
                Building = resource.BuildingId,
                Description = resource.ResourceDescription,
                Email = resource.ResourceEmail
            }).ToArray();
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