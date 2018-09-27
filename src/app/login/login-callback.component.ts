import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login-callback',
  templateUrl: './login-callback.component.html',
  styleUrls: ['./login-callback.component.scss']
})
export class LoginCallbackComponent implements OnInit {

  constructor(private _authService: AuthService, private _router: Router) { }

  ngOnInit() {
    this._authService.handleLoginCallback().subscribe(state => {
      let redirectUrl = '/';
      if (state) {
        redirectUrl = atob(state);
      }
      this._router.navigateByUrl(redirectUrl);
    }, error => {
      console.error('Error while handling login callback:', error);
    });
  }

}
