import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { LoginStore } from '@event-manager-web-client/data-access';
import { Observable, tap } from 'rxjs';

@Injectable()
export class Authenticated implements CanActivate {
  constructor(private _loginStore: LoginStore, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this._loginStore.connected$.pipe(
      tap((connected) => {
        if (!connected) {
          this.router.navigateByUrl('/list-events');
        }
      })
    );
  }
}
