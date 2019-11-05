import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {OutsideComponent} from "../../outside/outside.component";

@Injectable({
  providedIn: 'root'
})
export class LocationGuard implements CanActivate{
  private readonly _insideComponentName = 'InsideComponent';
  private readonly _outsideComponentName = 'OutsideComponent';

  constructor(private router: Router){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const location = localStorage['location'];
    const room = localStorage['room'];

    if(!location || !room){
      this.router.navigate(['/setup']);
      return false;
    }

    //@ts-ignore
    if(this._insideComponentName == route.component.name && location != 'inside'){
      this.router.navigate(['/outside']);
      return false;
      //@ts-ignore
    }else if(this._outsideComponentName == route.component.name && location != 'outside'){
      this.router.navigate(['/inside']);
      return false;
    }

    return true;
  }

}
