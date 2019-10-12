import {Component, Input, OnInit} from '@angular/core';
import {Meeting} from '../../shared/models/meeting.model';

@Component({
  selector: 'app-inside-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.less']
})
export class WelcomeComponent implements OnInit {
  @Input()nextMeeting: Meeting;

  constructor() {}

  ngOnInit() {

  }

}
