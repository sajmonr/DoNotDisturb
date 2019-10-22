import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Meeting} from '../../shared/models/meeting.model';
import {DateUtils} from "../../shared/utils/date-utils";

@Component({
  selector: 'app-inside-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.less']
})
export class WelcomeComponent implements OnChanges {
  private personalMeetingInMinutes = 30;
  private globalMeetingInMinutes = 120;

  @Input()nextMeeting: Meeting;
  @Input()room: string;
  private welcomeTypes = WelcomeType;
  private welcome = WelcomeType.Empty;

  ngOnChanges(changes: SimpleChanges): void {
    this.updateWelcome();
  }

  private updateWelcome(){
    if(!this.nextMeeting){
      this.welcome = WelcomeType.Empty;
      return;
    }

    const today = new Date();

    if(DateUtils.isToday(this.nextMeeting.startTime)){
      if(this.nextMeeting.startTime.getTime() - today.getTime() <= this.personalMeetingInMinutes * 60 * 1000)
        this.welcome = WelcomeType.Personal;
      else
        this.welcome = WelcomeType.Global;
    }else{
      this.welcome = WelcomeType.Empty;
    }
  }

}
export enum WelcomeType{
  Empty,
  Global,
  Personal
}
