import {Injectable} from "@angular/core";
import {ModalService} from "./modal.service";
import {ToastService} from "./toast.service";
import {Message, MessageType} from "../models/message.model";

@Injectable()
export class MessageService{

  constructor(private modal: ModalService, private toast: ToastService){}

  info(message: string, title?: string, type?: NotificationType){
    this.emitMessage(this.constructMessage(message, MessageType.Info, title), type);
  }
  error(message: string, title?: string, type?: NotificationType){
    this.emitMessage(this.constructMessage(message, MessageType.Error, title), type);
  }
  success(message: string, title?: string, type?: NotificationType){
    this.emitMessage(this.constructMessage(message, MessageType.Success, title), type);
  }

  hideModal(){
    this.modal.hideModal();
  }

  private emitMessage(message: Message, notificationType?: NotificationType){
    if(!notificationType)
      notificationType = NotificationType.Modal;

    if(notificationType == NotificationType.Modal)
      this.modal.showModal(message);
    else
      this.toast.showToast(message);
  }

  private constructMessage(message: string, type: MessageType, title?: string): Message{
    const msg = new Message();

    if(!title || title == '')
      title = this.getDefaultTitle(type);

    msg.title = title;
    msg.message = message;
    msg.type = type;

    return msg;
  }

  private getDefaultTitle(type: MessageType): string{
    switch (type) {
      case MessageType.Error:
        return 'Uh-oh';
      case MessageType.Info:
        return 'FIY';
      case MessageType.Success:
        return 'Success';
    }
  }

}
export enum NotificationType{
  Modal, Toast
}
