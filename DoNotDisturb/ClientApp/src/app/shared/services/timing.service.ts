import {Subject} from "rxjs";

export class TimingService{
  tick = new Subject();

  private clockTimer;

  constructor(){
    this.clockTimer = setInterval(() => this.refreshDateTime(), 1000);
  }

  private refreshDateTime(){
    this.tick.next();
  }

}
