import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SettingsService} from './settings.service';
import {Observable} from 'rxjs';
import {Meeting} from '../models/meeting.model';
import {MeetingRoom} from '../models/meeting-room.model';

@Injectable()
export class CalendarService{
  constructor(private http: HttpClient, private settings: SettingsService){}

  getRooms(): Promise<MeetingRoom[]>{
    return new Promise<MeetingRoom[]>(resolve => {
      this.http.get<MeetingRoom[]>(this.getBaseUrl() + 'Room/GetMeetingRooms').subscribe(rooms => {
        resolve(rooms);
      });
    });
  }

  initialized() {
    return this.settings.initialized;
  }

  private getMeetings(entities:any[]): Meeting[]{
    const meetings: Meeting[] = [];

    entities.forEach(entity => {
      let m = new Meeting();

      m.startTime = new Date(entity.start.dateTime);
      m.endTime = new Date(entity.end.dateTime);
      m.title = entity.summary;

      meetings.push(m);
    });

    return meetings;
  }

  private getBaseUrl(): string{
    return this.settings.serverUrl;
  }

}
