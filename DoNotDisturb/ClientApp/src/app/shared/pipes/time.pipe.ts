import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform{
  transform(value: number, showSeconds?: boolean): string {
    let minutes: number;
    let hours: number;
    let seconds: number;
    let output = '';

    value /= 1000;

    hours = Math.floor(value / 3600);

    value -= hours * 3600;

    minutes = Math.floor(value / 60);
    value -= minutes * 60;

    seconds = Math.round(value);

    if(hours > 0 && !showSeconds){
      output += hours;
      output += hours == 1 ? ' hour ' : ' hours ';
    }

    if(minutes > 0) {
      output += showSeconds ? minutes + (hours * 60) : minutes;
      output += minutes == 1 ? ' minute' : ' minutes';
    }

    if(showSeconds || minutes == 0){
      if(minutes > 0)
        output += ' ';
      output += seconds;
      output += seconds == 1 ? ' second' : ' seconds';
    }

    return output;
  }
}
