import {EventEmitter, Output} from "@angular/core";
import {Message, MessageType} from "../models/message.model";

export class ModalService{
  @Output()messageReceived = new EventEmitter<Message>();
  @Output()hide = new EventEmitter();

  showModal(message: Message){
    this.messageReceived.emit(message);
  }

  hideModal(){
    this.hide.emit();
  }
}
