export class RoomDevice{
  type: RoomDeviceType;
  name: string;
}
export enum RoomDeviceType{
  OutsideKiosk,
  InsideKiosk,
  Accessory
}
