import {Component, Input} from "@angular/core";
import {Meeting} from "../../../shared/models/meeting.model";
import {TimingService} from "../../../shared/services/timing.service";

@Component({
  selector: 'app-welcome-personal',
  templateUrl: './personal-welcome.component.html',
  styleUrls: ['./personal-welcome.component.less']
})
export class PersonalWelcomeComponent{
  @Input()meeting: Meeting;
  @Input()room: string;

  private today = new Date();

  constructor(private timer: TimingService){
    timer.tick.subscribe(this.tick.bind(this));
  }

  private tick(){
    this.today = new Date();
  }

}
