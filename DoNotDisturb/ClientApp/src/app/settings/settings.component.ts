import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})
export class SettingsComponent {

  constructor(private router: Router){}

  private onRoomReset(){
    localStorage.clear();
    //this.router.navigate(['/']);
    location.href = '/';
  }

}
