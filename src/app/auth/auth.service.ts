import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,  Subject, ReplaySubject } from 'rxjs';

import { OAuthService } from 'angular-oauth2-oidc';

import { AppConfigService } from '../app-config.service';
import { authConfig } from './auth.config';
import { environment } from '../../environments/environment';
import { UserInfo } from './user-info';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _userInfo: UserInfo = null;
  private _userInfoSubject = new ReplaySubject<UserInfo>(1);
  userInfo = this._userInfoSubject.asObservable();

  private _userInfoEndpoint: string;

  constructor(private _appConfigSvc: AppConfigService, private _httpClient: HttpClient, private _oauthService: OAuthService) {
    this.init();
  }


  public init(): void {
    this._appConfigSvc.config.subscribe(appConfig => {
      const cfg = Object.assign({}, authConfig, {
        loginUrl: appConfig.authEndpoint,
        clientId: environment.appInfo.id,
        scope: environment.appInfo.scope
      });
      this._oauthService.configure(cfg);
      this._oauthService.setStorage(localStorage);
      this._userInfoEndpoint = appConfig.userInfoEndpoint;
      this.getUserInfoFromLocalStorage();
    });
  }


  public login(): void {
    this._oauthService.initImplicitFlow();
  }


  public handleLoginCallback(): Observable<any> {
    const sub = new Subject<any>();
    this._oauthService.tryLogin().then(() => {
      this.clearUserInfo();
      this.getUserInfoFromServer();
      sub.next(null);
    }, error => sub.error(error));
    return sub.asObservable();
  }


  public logout(): void {
    console.log('Logout requested.');
    this.clearUserInfo();
    this._oauthService.logOut();
  }


  public isLoggedIn(): boolean {
    return this._oauthService && this._oauthService.hasValidAccessToken();
  }


  private getUserInfoFromServer(): void {
    this._httpClient.get<UserInfo>(this._userInfoEndpoint).subscribe(val => {
      this._userInfo = val;
      if (this._userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(this._userInfo));
      }
      this._userInfoSubject.next(this._userInfo);
    });
  }


  private getUserInfoFromLocalStorage(): void {
    if (!this._oauthService.hasValidAccessToken()) {
      this._userInfo = null;
      this._userInfoSubject.next(this._userInfo);
    } else {
      const cachedUserInfo = localStorage.getItem('userInfo');
      if (cachedUserInfo) {
        this._userInfo = JSON.parse(cachedUserInfo);
        this._userInfoSubject.next(this._userInfo);
      } else {
        this.getUserInfoFromServer();
      }
    }
  }


  private clearUserInfo(): void {
    this._userInfo = null;
    localStorage.removeItem('userInfo');
  }


  public getAccessToken(): String {
    return this.isLoggedIn()
      ? this._oauthService.getAccessToken()
      : null;
  }


  public getSessionExpiryTime(): Date {
    return this.isLoggedIn()
      ? new Date(this._oauthService.getAccessTokenExpiration())
      : new Date(0);
  }
}
