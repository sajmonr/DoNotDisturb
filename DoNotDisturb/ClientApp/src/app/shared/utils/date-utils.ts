export enum DatePrecision{
  Exact,
  Day
}

export class DateUtils{

  static equal(left: Date, right: Date, precision?: DatePrecision): boolean{
    if(!left || !right)
      return false;

    if(!precision)
      precision = DatePrecision.Exact;

    if(precision == DatePrecision.Day){
      return left.getFullYear() == right.getFullYear() && left.getMonth() == right.getMonth() && left.getDate() == right.getDate();
    }else if(precision == DatePrecision.Exact){
      return DateUtils.equal(left, right, DatePrecision.Day) && left.getTime() == right.getTime();
    }
  }

  static addDays(date: Date, days: number): Date{
    date.setDate(date.getDate() + days);

    return date;
  }

  static isToday(date: Date): boolean{
    return date && this.equal(new Date(), date, DatePrecision.Day);
  }

}
