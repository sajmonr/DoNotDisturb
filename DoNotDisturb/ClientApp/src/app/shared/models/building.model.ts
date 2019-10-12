import {MeetingRoom} from './meeting-room.model';

export class Building{
  name: string;
  rooms: MeetingRoom[];

  constructor(){
    this.rooms = [];
  }

}
