import {EventEmitter, Output} from '@angular/core';

export class TimingService{
  @Output()tick = new EventEmitter();

  private clockTimer;

  constructor(){
    this.clockTimer = setInterval(() => this.refreshDateTime(), 1000);
  }

  private refreshDateTime(){
    this.tick.emit();
  }

}
