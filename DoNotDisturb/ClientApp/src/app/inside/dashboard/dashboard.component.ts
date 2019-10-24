import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService} from '../../shared/services/message.service';
import {RoomService} from '../../shared/services/room.service';
import {Meeting} from '../../shared/models/meeting.model';
import {TimingService} from '../../shared/services/timing.service';


@Component({
  selector: 'app-inside-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit{
  @ViewChild('alertSound')alert: ElementRef;
  private date: Date;
  private progressColor;

  private progressColorStart = '#78c000';
  private progressColorHalf = '#e6e618';
  private progressColorEnd = '#f85032';

  @Input()meeting: Meeting;
  @Input()room: string;
  private meetingEndsIn = 0;
  private meetingProgress = 0;
  private alertPlayCount = 0;
  private remainingTimeAlert = false;
  private limitedTimeAlert = false;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private message: MessageService,
              private roomService: RoomService,
              private timing: TimingService) {}

  ngOnInit() {
    this.startClock();
    this.progressColor = this.progressColorStart;
  }

  private startClock(){
    this.timing.tick.subscribe(this.refreshDateTime.bind(this));
  }
  private refreshDateTime(){
    this.date = new Date();
    this.refreshCurrentMeeting();
  }
  private refreshCurrentMeeting(){
    if(!this.meeting)
      return;

    const remainingTime = this.meeting.endTime.getTime() - new Date().getTime();

    if(remainingTime <= 0){
      this.endMeeting();
      return;
    }

    this.meetingEndsIn = remainingTime;

    this.calculateMeetingProgress();
    this.refreshProgressColor();

    if(this.alertPlayCount == 0 && this.meetingEndsIn <= 1000 * 60)
      this.playAlert();
    if(this.meetingEndsIn <= 1000 * 30)
      this.showFullsreenAlert();
    if(this.meetingEndsIn <= 1000 * 60 * 7 && !this.limitedTimeAlert)
      this.showModalAlert();
    if(this.meetingEndsIn <= 1000 * 60 * 2 && this.limitedTimeAlert)
      this.hideModalAlert();
  }
  private calculateMeetingProgress(){
    if(!this.meeting)
      this.meetingProgress = 0;

    const now = new Date().getTime();
    const start = this.meeting.startTime.getTime();
    const end = this.meeting.endTime.getTime();

    this.meetingProgress = (now - start) / (end - start);
  }

  private showModalAlert(){
    this.limitedTimeAlert = true;
    const minutes = Math.ceil(this.meetingEndsIn / 1000 / 60);
    this.message.error(minutes + ' minutes remaining', 'Meeting Ending Soon');
  }

  private hideModalAlert(){
    console.log('hide');
    //this.message.hideMessage();
    //this.limitedTimeAlert = false;
  }

  private showFullsreenAlert(){
    this.remainingTimeAlert = true;
  }

  private hideFullscreenAlert(){
    this.remainingTimeAlert = false;
  }

  private refreshProgressColor(){
    let start;
    let end;
    let progress = this.meetingProgress;

    if(this.meetingProgress < 0.5){
      start = this.hexToRgb(this.progressColorStart);
      end = this.hexToRgb(this.progressColorHalf);
      progress *= 2;
    }else{
      start = this.hexToRgb(this.progressColorHalf);
      end = this.hexToRgb(this.progressColorEnd);
      progress = 2 * (progress - 0.5);
    }
    const newR = this.calculateTransition(start[0], end[0], progress);
    const newG = this.calculateTransition(start[1], end[1], progress);
    const newB = this.calculateTransition(start[2], end[2], progress);

    this.progressColor =  this.rgbToHex(newR, newG, newB);
  }
  private playAlert(){
    this.alertPlayCount++;
    this.alert.nativeElement.play();
  }
  private endMeeting(){
    this.resetRoom();
  }
  private resetRoom(){
    this.meeting = null;
    this.meetingEndsIn = 0;
    this.meetingProgress = 0;
    this.alertPlayCount = 0;
    this.remainingTimeAlert = false;
    this.limitedTimeAlert = false;
  }

  //Returns color code from RGB prepended with #
  private rgbToHex(r: number, g: number, b: number): string{
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);

    if(r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255){
      return '#ffffff';
    }
    let channelR = r.toString(16);
    let channelG = g.toString(16);
    let channelB = b.toString(16);

    if(channelR.length == 1)
      channelR = '0' + channelR;
    if(channelG.length == 1)
      channelG = '0' + channelG;
    if(channelB.length == 1)
      channelB = '0' + channelB;

    return '#' + channelR + channelG + channelB;
  }
  private hexToRgb(hex: string): number[]{
    let r = 0;
    let g = 0;
    let b = 0;

    if(hex[0] == '#')
      hex = hex.slice(1);

    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);

    return isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255
      ? [0, 0, 0] : [r, g, b];
  }
  private calculateTransition(start: number, end: number, progress: number): number{
    return start + (end - start) * progress;
  }
}
