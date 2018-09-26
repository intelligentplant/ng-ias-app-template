import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private _authService: AuthService, private _router: Router) { }

  ngOnInit() {
    if (this._authService.isLoggedIn()) {
      this._router.navigate(['/']);
    }
  }

  login(): void {
    this._authService.login();
  }

}
