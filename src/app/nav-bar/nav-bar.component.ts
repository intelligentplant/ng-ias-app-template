import { Component, OnInit, ElementRef, ViewChild, Renderer2, HostListener } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { UserInfo } from '../auth/user-info';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  get appName(): string {
    return environment.appInfo.name;
  }

  @ViewChild('navBurger')
  navMenu: ElementRef;
  isNavMenuVisible = false; // nav menu visibility on mobile devices only

  @ViewChild('userMenu')
  userMenu: ElementRef;
  private _isUserMenuDropdownVisible = false;

  userInfo: UserInfo;

  constructor(private _authService: AuthService, private _renderer: Renderer2, private _router: Router) { }

  ngOnInit() {
    this._authService.userInfo.subscribe(x => this.userInfo = x);
  }


  toggleNavMenuVisibility(): void {
    if (this.isNavMenuVisible) {
      this.hideNavMenu();
    } else {
      this.showNavMenu();
    }
  }


  showNavMenu(): void {
    this.isNavMenuVisible = true;
    this._renderer.addClass(this.navMenu.nativeElement, 'is-active');
  }


  hideNavMenu(): void {
    this.isNavMenuVisible = false;
    this._renderer.removeClass(this.navMenu.nativeElement, 'is-active');
  }


  toggleUserMenuDropdown(): void {
    if (this._isUserMenuDropdownVisible) {
      this.hideUserMenuDropdown();
    } else {
      this.showUserMenuDropdown();
    }
  }

  showUserMenuDropdown(): void {
    this._isUserMenuDropdownVisible = true;
    this._renderer.addClass(this.userMenu.nativeElement, 'is-active');
  }

  hideUserMenuDropdown(): void {
    this._isUserMenuDropdownVisible = false;
    this._renderer.removeClass(this.userMenu.nativeElement, 'is-active');
  }

  @HostListener('document:click', ['$event'])
  detectExternalUserMenuDropdownClick(event) {
    if (this.userMenu.nativeElement && !this.userMenu.nativeElement.contains(event.target)) {
      this.hideUserMenuDropdown();
    }
  }

  get isLoggedIn(): boolean {
    return this._authService.isLoggedIn();
  }

  logout(): void {
    this._authService.logout();
    this._router.navigate(['/', 'login']);
  }
}
