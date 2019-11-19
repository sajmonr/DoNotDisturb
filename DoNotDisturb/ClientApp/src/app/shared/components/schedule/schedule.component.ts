import {Component, ElementRef, Input, ViewChild} from "@angular/core";
import {Meeting} from "../../models/meeting.model";
import {Router} from "@angular/router";

declare var $: any;

@Component({
  selector: 'app-schedule',
  templateUrl: 'schedule.component.html',
  styleUrls: ['schedule.component.less']
})
export class ScheduleComponent{
  @Input()meetings: Meeting[];

  @ViewChild('scheduleModal')scheduleModal: ElementRef;

  private howToScheduleDisplayed = false;

  constructor(private router: Router){}

  show(){
    $(this.scheduleModal.nativeElement).modal('show');
  }
  hide(){
    $(this.scheduleModal.nativeElement).modal('hide');
  }
  private goToSettings(){
    this.hide();
    this.router.navigate(['/settings']);
  }
}
