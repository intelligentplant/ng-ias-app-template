import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  get appName(): string {
    return environment.appInfo.name;
  }

  private _redirectUrl: string;

  constructor(private _authService: AuthService, private _router: Router, private _route: ActivatedRoute) { }

  ngOnInit() {
    if (this._authService.isLoggedIn()) {
      this._router.navigate(['/']);
      return;
    }

    this._route.queryParams.subscribe(params => {
      const redirect = params['redirectUrl'];
      this._redirectUrl = redirect 
        ? '' + params['redirectUrl'] 
        : null;
    });
  }

  login(): void {
    this._authService.login(this._redirectUrl ? btoa(this._redirectUrl) : '');
  }

}
