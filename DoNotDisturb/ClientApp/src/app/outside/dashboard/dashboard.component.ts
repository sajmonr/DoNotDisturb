import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Meeting} from '../../shared/models/meeting.model';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService} from '../../shared/services/message.service';
import {RoomService} from '../../shared/services/room.service';
import {RoomDevice, RoomDeviceType} from '../../shared/models/room-device.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  @ViewChild('scheduleModal')scheduleModal: ElementRef;
  private maxVisibleMeetings = 4;
  private room: string;
  private showTomorrow = true;
  private clockTimer;
  private date: Date;
  private isLoaded = false;
  private howToScheduleDisplayed = false;
  private roomDevice: RoomDevice;
  private connected = false;
  private subscribed = false;
  private firstTimeLoad = false;

  private currentMeeting: Meeting;
  private currentMeetingStarted = false;

  private currentMeetingEndsIn: number;
  private meetings: Meeting[] = [];

  constructor(private activatedRoute: ActivatedRoute, private message: MessageService, private roomService: RoomService, private router: Router){
    this.loadRouteParams();

    this.roomDevice = new RoomDevice();
    this.roomDevice.type = RoomDeviceType.OutsideKiosk;
    this.roomDevice.name = this.room + ' Outside Kiosk';
  }

  ngOnInit() {
    console.log('init outside')
    if(!this.room){
      this.message.error('You have not selected any room. You will not see any results. :(');
    }

    if(this.roomService.isConnected)
      this.onConnected();

    this.roomService.connected.subscribe(this.onConnected.bind(this));
    this.roomService.disconnected.subscribe(this.onDisconnected.bind(this));

    this.refreshDateTime();
    this.clockTimer = setInterval(() => this.refreshDateTime(), 1000);
  }

  private onConnected(){
    this.connected = true;
    this.roomService.getMeetings(this.room, this.maxVisibleMeetings).then(meetings => this.refreshMeetings(meetings));
    this.roomService.subscribe(this.room, this.roomDevice).then(result => {
      if(!this.subscribed) {
        this.subscribed = true;
        this.roomService.meetingsUpdated.subscribe(meetings => {
          this.refreshMeetings(meetings);
        });
      }
    });
  }

  private onDisconnected(){
    this.connected = false;
  }

  private refreshMeetings(meetings: Meeting[]){
    if(!this.firstTimeLoad)
      this.firstTimeLoad = true;
    console.log('INFO: Meetings refreshed on ' + new Date());
    console.log(meetings);
    this.isLoaded = true;
    this.currentMeeting = null;
    this.meetings = meetings;

    this.refreshDateTime();
  }

  private refreshDateTime(){
    this.date = new Date();
    if(this.currentMeeting){
      this.currentMeetingEndsIn = this.currentMeeting.endTime.getTime() - new Date().getTime();
    }
  }

  private loadRouteParams(){
    const room = localStorage.getItem('room');
    if(!room)
      this.router.navigate(['/setup']);

    this.room = room;
    if(this.activatedRoute.snapshot.params['tomorrow']){
      this.showTomorrow =this.activatedRoute.snapshot.params['tomorrow'] == 1;
    }
  }

  private onDummyMeetingToggle(){
    if(!this.currentMeeting){
      this.createDummyCurrentMeeting();
    }else{
      //this.refreshMeetings();
    }
  }

  private createDummyCurrentMeeting(){
    const today = new Date();
    const meeting = new Meeting();

    meeting.startTime = new Date(today.getTime() - 1000 * 60 * 60);
    meeting.endTime = new Date(today.getTime() + 1000 * 60 * 58);
    meeting.title = "Dummy meeting. Nothing here. :)";

    this.currentMeeting = meeting;
    this.meetings.splice(0, 0, meeting);
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
}
