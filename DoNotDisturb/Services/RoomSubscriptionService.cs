using System.Collections.Concurrent;
using DoNotDisturb.Models;
using System.Collections.Generic;

namespace DoNotDisturb.Services
{
    public class RoomSubscriptionService
    {
        private readonly object _deviceListLock = new object();
        private readonly ConcurrentDictionary<string, List<RoomDevice>> _subscribers 
            = new ConcurrentDictionary<string, List<RoomDevice>>();

        public void Subscribe(string roomName, RoomDevice device)
        {
            if (!_subscribers.ContainsKey(roomName))
                _subscribers.TryAdd(roomName, new List<RoomDevice>());

            lock (_deviceListLock)
            {
                _subscribers[roomName].Add(device);                
            }
        }

        public void Unsubscribe(RoomDevice roomDevice)
        {
            foreach (var keyValue in _subscribers)
            {
                foreach (var device in keyValue.Value.ToArray())
                {
                    if (device.ConnectionId == roomDevice.ConnectionId)
                    {
                        lock (_deviceListLock)
                        {
                            keyValue.Value.Remove(device);
                        }
                    }
                }
            }
        }

        public Dictionary<string, RoomDevice[]> GetSubscribers()
        {
            var subscribers = new Dictionary<string, RoomDevice[]>();
            
            foreach(var (key, value) in _subscribers)
                subscribers.Add(key, value.ToArray());


            return subscribers;
        } 

    }
}