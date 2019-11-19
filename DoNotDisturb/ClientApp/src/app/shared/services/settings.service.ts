import {HttpClient} from '@angular/common/http';
import {EventEmitter, Injectable, OnInit, Output} from '@angular/core';

@Injectable()
export class SettingsService{
  private isInit = false;
  @Output()initialized = new EventEmitter<boolean>();
  serverUrl: string;
  signalRUrl: string;
  cookieName: string;
  cookieRoom: string;

  constructor(private http: HttpClient){
    http.get('assets/appsettings.json').subscribe(settings => {
      this.serverUrl = settings['serverUrl'];
      this.signalRUrl = settings['signalRUrl'];
      this.cookieName = settings['cookieName'];
      this.cookieRoom = settings['cookieRoom'];
      this.isInit = true;
      this.initialized.emit(true);
    });
  }

  isInitialized(): boolean{
    return this.isInit;
  }

  getRoomName(): string{
    return localStorage['room'];
  }

}
