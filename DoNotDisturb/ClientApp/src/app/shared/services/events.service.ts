import {ElementRef, EventEmitter, Output} from "@angular/core";

declare var $: any;

export class EventsService{
  private events: Event[] = [];

  add(event: Event){

  }

}

export interface Event{
  event: EventEmitter<Event>;

  register(element?: ElementRef);
}
export class LongPressEvent implements Event{
  @Output() event = new EventEmitter<Event>();

  private readonly longPressDuration = 1000 * 5;
  private longPressTimeout;

  register(element?: ElementRef){
    const el = element ? $(element) : $(document);

    el.mousedown(e => {
      this.longPressTimeout = setTimeout(e => this.event.emit(this), this.longPressDuration);
    });
    el.mouseup(e => clearInterval(this.longPressTimeout));
  }

}
