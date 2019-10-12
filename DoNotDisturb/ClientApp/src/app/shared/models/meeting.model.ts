export class Meeting{
  title: string;
  startTime: Date;
  endTime: Date;
  owner: string;

  constructor(json?: Meeting){
    if(!json)
      return;
    this.title = json.title;
    this.startTime = new Date(json.startTime);
    this.endTime = new Date(json.endTime);
    this.owner = json.owner;
  }

  equal(meeting: Meeting): boolean{
    if(!meeting)
      return false;

    return this.title == meeting.title
    && this.owner == meeting.owner;
  }

}
