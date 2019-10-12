using Microsoft.Extensions.Configuration;

namespace DoNotDisturb.Configurations
{
    public class GoogleConfiguration
    {
        public string ServiceAccountCredentials { get; }
        public int MaxCalendarEvents { get; }
        
        public GoogleConfiguration(IConfiguration configuration)
        {
            var section = configuration.GetSection("Google");

            ServiceAccountCredentials = section["ServiceAccountCredentials"];
            MaxCalendarEvents = int.Parse(section["MaxCalendarEvents"]);
        }
    }
}