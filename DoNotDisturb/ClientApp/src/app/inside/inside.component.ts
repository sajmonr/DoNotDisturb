import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {RoomDevice, RoomDeviceType} from '../shared/models/room-device.model';
import {Meeting} from '../shared/models/meeting.model';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService} from '../shared/services/message.service';
import {RoomService} from '../shared/services/room.service';
import {TimingService} from '../shared/services/timing.service';

@Component({
  selector: 'app-inside',
  templateUrl: './inside.component.html',
  styleUrls: ['./inside.component.less']
})
export class InsideComponent implements OnInit{
  @ViewChild('scheduleModal')scheduleModal: ElementRef;
  private roomDevice: RoomDevice;
  private room: string;
  private loaded = false;
  private maxVisibleMeetings = 4;

  private currentMeeting: Meeting;
  private nextMeeting: Meeting;

  private howToScheduleDisplayed = false;
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

    let currentMeeting;
    let nextMeeting;

    if(this.isCurrentMeeting(meetings[0])){
      currentMeeting = meetings[0];
      nextMeeting = meetings[1];
    }else{
      currentMeeting = null;
      nextMeeting = meetings[0];
    }

    if(!this.currentMeeting || !this.currentMeeting.equal(currentMeeting))
      this.currentMeeting = currentMeeting;
    if(!this.nextMeeting || !this.nextMeeting.equal(nextMeeting))
      this.nextMeeting = nextMeeting;
  }

  private showSchedule(){
    //@ts-ignore
    $(this.scheduleModal.nativeElement).modal('show');
  }
  private hideSchedule(){
    this.howToScheduleDisplayed = false;
    //@ts-ignore
    $(this.scheduleModal.nativeElement).modal('hide');
  }
  private loadRouteParams(){
    const room = localStorage.getItem('room');
    if(!room)
      this.router.navigate(['/setup']);
    this.room = room;
  }

  private isCurrentMeeting(meeting: Meeting): boolean{
    const today = new Date();

    return this.isDateTheSame(today, meeting.startTime) && meeting.startTime.getTime() < today.getTime() && meeting.endTime.getTime() > today.getTime();
  }
  private isDateTheSame(left: Date, right: Date): boolean{
    return left.getDate() == right.getDate() && left.getMonth() == right.getMonth() && left.getFullYear() == right.getFullYear();
  }

}
