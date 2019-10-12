import {AfterContentChecked, Component, DoCheck, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Meeting} from '../../../shared/models/meeting.model';

@Component({
  selector: 'app-dashboard-schedule',
  templateUrl: './dashboard.schedule.component.html',
  styleUrls: ['./dashboard.schedule.component.less', '../dashboard.component.less']
})
export class ScheduleComponent implements OnChanges{
  @Input('meetings')meetings: Meeting[] = [];
  @Input('maxMeetings')maxVisibleMeetings = 4;

  private meetingsToday: Meeting[] = [];
  private meetingsTomorrow: Meeting[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.organizeMeetings(this.meetings);
  }

  private organizeMeetings(meetings: Meeting[]) {
    const today = new Date();
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
    const newToday: Meeting[] = [];
    const newTomorrow: Meeting[] = [];

    let meetingIndex = 0;

    while(meetingIndex < meetings.length && newToday.length + newTomorrow.length < this.maxVisibleMeetings){
      if(meetings[meetingIndex].startTime.getDate() == today.getDate()){
        if(!(meetings[meetingIndex].startTime.getTime() < today.getTime() && meetings[meetingIndex].endTime.getTime() > today.getTime())){
          newToday.push(meetings[meetingIndex]);
        }
      }else if(meetings[meetingIndex].startTime.getDate() == tomorrow.getDate()){
        newTomorrow.push(meetings[meetingIndex]);
      }
      meetingIndex++;
    }

    this.meetingsToday = newToday;
    this.meetingsTomorrow = newTomorrow;
  }

}
