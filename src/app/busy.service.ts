import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  private _activeRequestCount = 0;

  private _busy = new BehaviorSubject<boolean>(false);
  busy = this._busy.asObservable();

  onRequestStart(): void {
      if (this._activeRequestCount === 0) {
          this._busy.next(true);
      }
      ++this._activeRequestCount;
  }

  onRequestEnd(): void {
      --this._activeRequestCount;
      if (this._activeRequestCount === 0) {
          this._busy.next(false);
      }
  }
}


@Injectable()
export class BusyInterceptor implements HttpInterceptor {

    constructor(private _svc: BusyService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this._svc.onRequestStart();
        return next.handle(request).pipe(
            finalize(() => {
                this._svc.onRequestEnd();
            })
        );
    }

}
