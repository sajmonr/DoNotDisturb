import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Meeting} from '../../../shared/models/meeting.model';
import {DatePrecision, DateUtils} from "../../../shared/utils/date-utils";
import {TimingService} from "../../../shared/services/timing.service";

@Component({
  selector: 'app-dashboard-schedule',
  templateUrl: './dashboard.schedule.component.html',
  styleUrls: ['./dashboard.schedule.component.less', '../dashboard.component.less']
})
export class ScheduleComponent implements OnChanges, OnInit{
  @Input('meetings')meetings: Meeting[] = [];
  @Input('maxMeetings')maxVisibleMeetings = 4;

  private meetingsToday: Meeting[] = [];
  private meetingsTomorrow: Meeting[] = [];

  constructor(private timeService: TimingService){}

  ngOnChanges(changes: SimpleChanges): void {
    this.organizeMeetings();
  }

  ngOnInit(): void {
    this.timeService.tick.subscribe(this.organizeMeetings.bind(this));
  }

  private organizeMeetings() {
    const today = new Date();
    const tomorrow = DateUtils.addDays(new Date(), 1);
    const newToday: Meeting[] = [];
    const newTomorrow: Meeting[] = [];

    let meetingIndex = 0;

    while(meetingIndex < this.meetings.length && newToday.length + newTomorrow.length < this.maxVisibleMeetings){
      if(DateUtils.equal(this.meetings[meetingIndex].startTime, today, DatePrecision.Day)){
        if(this.meetings[meetingIndex].startTime > today){
          newToday.push(this.meetings[meetingIndex]);
        }
      }else if(DateUtils.equal(this.meetings[meetingIndex].startTime, tomorrow, DatePrecision.Day)){
        newTomorrow.push(this.meetings[meetingIndex]);
      }
      meetingIndex++;
    }

    this.meetingsToday = newToday;
    this.meetingsTomorrow = newTomorrow;
  }

}
