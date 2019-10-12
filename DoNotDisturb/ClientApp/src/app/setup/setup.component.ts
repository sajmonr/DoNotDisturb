import {Component, OnInit} from '@angular/core';
import {MeetingRoom} from '../shared/models/meeting-room.model';
import {Building} from '../shared/models/building.model';
import {CalendarService} from '../shared/services/calendar.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.less']
})
export class SetupComponent implements OnInit{
  private phase = 0;
  private buildings: Building[] = [];
  private viewBuildings: Building[] = [];

  private searchFilter = '';

  constructor(private calendars: CalendarService, private router: Router){}

  ngOnInit(): void {
    this.calendars.initialized().subscribe(() => {
      this.loadRooms();
    })
  }

  private async loadRooms(){
    let rooms = await this.calendars.getRooms();

    this.buildings = this.organizeRoomsToBuildings(rooms).sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    this.viewBuildings = this.buildings.slice();
  }

  private organizeRoomsToBuildings(rooms: MeetingRoom[]): Building[]{
    let buildings: Building[] = [];

    rooms.forEach(room => {
      let index = buildings.map(e => e.name).indexOf(room.building);
      if(index < 0) {
        let newBuilding = new Building();

        newBuilding.name = room.building;
        buildings.push(newBuilding);
        index = buildings.length - 1;
      }
      buildings[index].rooms.push(room);
    });

    return buildings;
  }

  private onRoomSelect(roomName: string){
    localStorage.setItem('room', roomName);
    this.nextPhase();
  }

  private onDeviceSelect(device: number){
    //Device 0 = inside, 1 = outside
    localStorage.setItem('location',device == 0 ? 'inside' : 'outside');
    this.nextPhase();
  }

  private onFinishSetup(){
    this.router.navigate([localStorage.getItem('location')]);
  }

  private onSearch(){
    if(this.searchFilter == '') {
      this.viewBuildings = this.buildings.slice();
      return;
    }

    const searchTerm = this.searchFilter.toLowerCase();

    //Search for building name
    let searchResultsBuildings = this.buildings.filter(building =>{
      return building.name && (building.name.toLowerCase().includes(searchTerm)
      || building.rooms.some(room => room.name.toLowerCase().includes(searchTerm)));
    });

    this.viewBuildings = searchResultsBuildings;
  }

  private nextPhase(){
    this.phase++;
  }

}
