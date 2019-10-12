import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-time-alert',
  templateUrl: './time-alert.component.html',
  styleUrls: ['./time-alert.component.less']
})
export class TimeAlertComponent {
  @Input()time: number;

}
