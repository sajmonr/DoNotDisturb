export class Message{
  title: string;
  message: string;
  type: MessageType;
}
export enum MessageType{
  Info,
  Success,
  Error
}
