namespace DoNotDisturb.Models
{
    public enum RoomDeviceType {OutsideKiosk, InsideKiosk, Accessory}
    
#pragma warning disable 660,661
    public class RoomDevice
#pragma warning restore 660,661
    {
        public string ConnectionId { get; set; }
        public string Name { get; set; }
        public RoomDeviceType DeviceType { get; set; }

        public static bool operator ==(RoomDevice left, RoomDevice right) =>
            left != null && right != null && left.ConnectionId == right.ConnectionId && left.DeviceType == right.DeviceType;

        public static bool operator !=(RoomDevice left, RoomDevice right) => !(left == right);

    }
}