import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {RoomDevice, RoomDeviceType} from '../shared/models/room-device.model';
import {Meeting} from '../shared/models/meeting.model';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService} from '../shared/services/message.service';
import {RoomService} from '../shared/services/room.service';
import {TimingService} from '../shared/services/timing.service';
import {DatePrecision, DateUtils} from "../shared/utils/date-utils";

@Component({
  selector: 'app-inside',
  templateUrl: './inside.component.html',
  styleUrls: ['./inside.component.less']
})
export class InsideComponent implements OnInit{
  private roomDevice: RoomDevice;
  private room: string;
  private loaded = false;
  private maxVisibleMeetings = 4;

  private currentMeeting: Meeting;
  private nextMeeting: Meeting;

  private meetings: Meeting[] = [];

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private message: MessageService,
              private roomService: RoomService,
              private timing: TimingService){
    this.loadRouteParams();

    this.roomDevice = new RoomDevice();
    this.roomDevice.type = RoomDeviceType.InsideKiosk;
    this.roomDevice.name = this.room + ' Inside Kiosk';
  }

  ngOnInit(): void {
    if(!this.room){
      this.message.error('You have not selected any room. You will not see any results. :(');
    }
    if(this.roomService.isConnected)
      this.onConnected();

    this.roomService.connected.subscribe(this.onConnected.bind(this));
    this.timing.tick.subscribe(this.tick.bind(this));
  }

  private onConnected(){
    this.roomService.getMeetings(this.room, this.maxVisibleMeetings).then(meetings => this.refreshMeetings(meetings));
    this.roomService.subscribe(this.room, this.roomDevice).then(() => {
      this.roomService.meetingsUpdated.subscribe(meetings => this.refreshMeetings(meetings));
    });
  }

  private refreshMeetings(meetings: Meeting[]){
    if(!this.loaded)
      this.loaded = true;

    this.meetings = meetings;
    this.updateCurrentMeeting();
  }
  private tick(){
    this.updateCurrentMeeting();
  }
  private updateCurrentMeeting(){
    const currentMeeting = this.getCurrentMeeting();
    const nextMeeting = this.getNextMeeting();

    if(!this.currentMeeting || !this.currentMeeting.equal(currentMeeting))
      this.currentMeeting = currentMeeting;
    if(!this.nextMeeting || !this.nextMeeting.equal(nextMeeting))
      this.nextMeeting = nextMeeting;
  }
  private loadRouteParams(){
    const room = localStorage.getItem('room');
    if(!room)
      this.router.navigate(['/setup']);
    this.room = room;
  }

  private getCurrentMeeting(): Meeting{
    let currentMeeting: Meeting = null;

    this.meetings.forEach(meeting => {
      if(this.isCurrentMeeting(meeting)){
        currentMeeting = meeting;
        return;
      }
    });

    return currentMeeting;
  }
  private getNextMeeting(): Meeting{
    let nextMeeting: Meeting = null;

    this.meetings.forEach(meeting => {
      if(!this.isCurrentMeeting(meeting) && (!nextMeeting || nextMeeting.startTime > meeting.startTime))
        nextMeeting = meeting;
    });

    return nextMeeting;
  }
  private isCurrentMeeting(meeting: Meeting): boolean{
    if(!meeting)
      return false;

    const today = new Date();

    return DateUtils.equal(today, meeting.startTime, DatePrecision.Day) && today.getTime() >= meeting.startTime.getTime() && today.getTime() <= meeting.endTime.getTime();
  }

}
