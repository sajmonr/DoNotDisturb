using System;
using System.Threading;
using DoNotDisturb.Configurations;

namespace DoNotDisturb.Services
{
    public class HeartbeatService : IDisposable
    {
        private readonly HeartbeatConfiguration _configuration;
        private readonly Timer _timer;

        public delegate void HeartbeatHandler();

        public HeartbeatHandler Beat;
        
        public HeartbeatService(HeartbeatConfiguration configuration)
        {
            _configuration = configuration;
            
            _timer = new Timer(Heartbeat, null, TimeSpan.Zero, TimeSpan.FromMilliseconds(_configuration.Interval));
        }

        private void Heartbeat(object state)
        {
            Beat?.Invoke();
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
        
    }
}