using System;

namespace DoNotDisturb.Models
{
    public class Meeting
    {
        public string Title { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Owner { get; set; }
    }
}