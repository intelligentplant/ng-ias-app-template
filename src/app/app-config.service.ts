import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private _config: any;

  private _configSubject = new ReplaySubject<any>(1);
  config = this._configSubject.asObservable();

  constructor(private http: HttpClient) { }

  load(): Promise<any> {
    return this.http
      .get<any>(environment.appInfo.configEndpoint)
      .toPromise()
      .then(config => {
        this._config = config;
        this._configSubject.next(this._config);
      });
  }

}
