import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {Message, MessageType} from "../../models/message.model";
import {MessageService} from "../../services/message.service";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.less']
})
export class MessageComponent implements OnInit{
  private messageType = MessageType;
  private currentMessage: Message;
  @ViewChild('messageModal')messageModal: ElementRef;

  constructor(private messageService: MessageService){}

  ngOnInit(): void {
    this.clearMessage();
    this.messageService.messageReceived.subscribe(message => this.onMessageReceived(message));
    this.messageService.hide.subscribe(this.hide.bind(this));
  }

  private onMessageReceived(message: Message){
    this.currentMessage = message;
    this.show();
  }

  private show(){
    //@ts-ignore
    $(this.messageModal.nativeElement).modal('show');
  }

  private hide(){
    //@ts-ignore
    $(this.messageModal.nametiveElement).modal('hide');
  }

  private clearMessage(){
    this.currentMessage = new Message();
  }

}
