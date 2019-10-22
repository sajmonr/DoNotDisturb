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
  private nextMeeting: Meeting;
  private currentMeetingEndsIn = 0;
  private nextMeetingStartsIn = 0;

  private meetings: Meeting[] = [];

  constructor(private activatedRoute: ActivatedRoute, private message: MessageService, private roomService: RoomService, private router: Router){
    this.loadRouteParams();

    this.roomDevice = new RoomDevice();
    this.roomDevice.type = RoomDeviceType.OutsideKiosk;
    this.roomDevice.name = this.room + ' Outside Kiosk';
  }

  ngOnInit() {
    if(!this.room){
      this.message.error('You have not selected any room. You will not see any results. :(');
    }

    if(this.roomService.isConnected)
      this.onConnected();

    this.roomService.connected.subscribe(this.onConnected.bind(this));
    this.roomService.disconnected.subscribe(this.onDisconnected.bind(this));

    this.clockTick();
    this.clockTimer = setInterval(() => this.clockTick(), 1000);
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

    this.isLoaded = true;
    this.meetings = meetings;
  }

  private clockTick(){
    this.date = new Date();

    this.checkForCurrentMeeting();
    this.refreshTimes();
  }

  private refreshTimes(){
      this.currentMeetingEndsIn = this.currentMeeting ? this.currentMeeting.endTime.getTime() - this.date.getTime() : 0;
      this.nextMeetingStartsIn = this.nextMeeting ? this.nextMeeting.startTime.getTime() - this.date.getTime() : 0;
  }

  private checkForCurrentMeeting(){
    if(!this.meetings || this.meetings.length == 0)
      return;

    const current = this.getCurrentMeeting();
    const next = this.getNextMeeting(current);

    if(!(this.currentMeeting && this.currentMeeting.equal(current))){
      this.currentMeeting = current;
      this.nextMeeting = next;
    }
  }

  private getCurrentMeeting(): Meeting{
    const current = this.meetings.filter(m => m.startTime <= this.date && m.endTime >= this.date);

    return current.length > 0 ? current[0] : null;
  }
  private getNextMeeting(relativeMeeting: Meeting): Meeting{
    const next = relativeMeeting
      ? this.meetings.filter(m => !m.equal(relativeMeeting) && m.startTime >= relativeMeeting.endTime)
      : this.meetings.filter(m => m.startTime > this.date);

    return next.length > 0 ? next[0] : null;
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
