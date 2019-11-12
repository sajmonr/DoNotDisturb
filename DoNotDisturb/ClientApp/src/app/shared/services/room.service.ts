import {EventEmitter, Injectable, OnInit, Output} from '@angular/core';
import * as signalR from '@aspnet/signalr';
import {SettingsService} from './settings.service';
import {Meeting} from '../models/meeting.model';
import {RoomDevice, RoomDeviceType} from '../models/room-device.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService{
  @Output()connected = new EventEmitter();
  @Output()disconnected = new EventEmitter();
  @Output()meetingsUpdated = new EventEmitter<Meeting[]>();
  private hubConnection: signalR.HubConnection;

  isConnected = false;

  constructor(private settings: SettingsService){
    if(this.settings.isInitialized()){
      this.initComponent();
    }else{
      this.settings.initialized.subscribe(result => {
        this.initComponent();
      });
    }
  }

  private initComponent(){
    this.initSignalR();
    this.startConnection();
  }

  private initSignalR(){
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.settings.signalRUrl)
      .build();

    this.subscribeMethods();

    this.hubConnection.onclose(error => {
      console.log('The connection was lost: ' + error);
      console.log('Reconnecting in 30 seconds.');
      this.isConnected = false;
      this.disconnected.emit();
      this.reconnectIn(30);
    });
  }

  private startConnection() {
    this.hubConnection
      .start()
      .then(() => {
        console.log('Successfully connected to server.');
        this.isConnected = true;
        this.connected.emit(true);
      })
      .catch(err => {
        console.log('Failed to connect to server. Reconnecting in 30 seconds.');
        this.reconnectIn(30)
      })
  }

  private reconnectIn(seconds: number){
    setTimeout(this.startConnection.bind(this), seconds * 1000);
  }

  private subscribeMethods(){
    this.hubConnection.on('meetingsUpdated', this.meetingsDidUpdate.bind(this));
  }

  private meetingsDidUpdate(meetings: Meeting[]){
    if(meetings){
      const output: Meeting[] = [];
      meetings.forEach(m => output.push(new Meeting(m)));
      this.meetingsUpdated.emit(output);
    }
  }

  getMeetings(room: string, maxResults: number): Promise<Meeting[]>{
    return new Promise<Meeting[]>(resolve => {
      this.hubConnection.invoke('getMeetings', room, maxResults).then(result => {
        const meetings: Meeting[] = [];

        result.forEach(m => {
          meetings.push(new Meeting(m));
        });

        resolve(meetings);
      });
    });
  }

  subscribe(room: string, device: RoomDevice){
    return new Promise(resolve => {
      this.hubConnection.invoke('subscribe', room, device.name, device.type).then(result => {
        resolve();
      });
    });
  }

}
