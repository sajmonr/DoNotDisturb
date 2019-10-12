using Microsoft.Extensions.Configuration;

namespace DoNotDisturb.Configurations
{
    public class DemoConfiguration
    {
        public bool Enabled { get; }
        public string RoomName { get; }
        public int WaitEndMinutes { get; }
        
        public DemoConfiguration(IConfiguration configuration)
        {
            var section = configuration.GetSection("Demo");

            Enabled = bool.Parse(section["Enabled"]);
            RoomName = section["RoomName"];
            WaitEndMinutes = int.Parse(section["WaitEndMinutes"]);
        }
    }
}