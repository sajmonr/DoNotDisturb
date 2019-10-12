using Microsoft.Extensions.Configuration;

namespace DoNotDisturb.Configurations
{
    public class HeartbeatConfiguration
    {
        public int Interval { get; }
        
        public HeartbeatConfiguration(IConfiguration configuration)
        {
            var section = configuration.GetSection("Heartbeat");

            Interval = int.Parse(section["Interval"]);
        }
    }
}