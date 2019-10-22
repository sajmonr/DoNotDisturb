import {Component} from "@angular/core";
import {SettingsService} from "../../../shared/services/settings.service";

@Component({
  selector: 'app-welcome-empty',
  templateUrl: './empty-welcome.component.html',
  styleUrls: ['./empty-welcome.component.less']
})
export class EmptyWelcomeComponent{
  private room: string;

  constructor(private settings: SettingsService){
    this.room = settings.getRoomName();
  }
}
