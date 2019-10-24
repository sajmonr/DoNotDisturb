import {EventEmitter, Output} from "@angular/core";
import {Message, MessageType} from "../models/message.model";

export class MessageService{
  @Output()messageReceived = new EventEmitter<Message>();
  @Output()hide = new EventEmitter();

  info(message: string, title?: string){
    if(!title) {
      title = 'FYI';
    }
    this.messageReceived.emit(this.constructMessage(title, message, MessageType.Info));
  }
  error(message: string, title?: string){
    if(!title) {
      title = 'Uh-oh';
    }
    this.messageReceived.emit(this.constructMessage(title, message, MessageType.Error));
  }
  success(message: string, title?: string){
    if(!title) {
      title = 'Success';
    }
    this.messageReceived.emit(this.constructMessage(title, message, MessageType.Success));
  }
  hideMessage(){
    this.hide.emit();
  }
  private constructMessage(title: string, message: string, type: MessageType): Message{
    const msg = new Message();

    msg.title = title;
    msg.message = message;
    msg.type = type;

    return msg;
  }
}
