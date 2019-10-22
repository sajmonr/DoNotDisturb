import {Component, Input, OnChanges} from "@angular/core";
import {Meeting} from "../../../shared/models/meeting.model";

@Component({
  selector: 'app-welcome-global',
  templateUrl: './global-welcome.component.html',
  styleUrls: ['./global-welcome.component.less']
})
export class GlobalWelcomeComponent{
  @Input()meeting: Meeting;
  @Input() room: string;
}
