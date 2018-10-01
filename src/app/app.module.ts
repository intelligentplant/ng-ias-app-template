import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OAuthModule } from 'angular-oauth2-oidc';

import { AppComponent } from './app.component';
import { AppConfigService } from './app-config.service';
import { httpInterceptors } from './http-interceptors';
import { loadFaIcons } from './font-awesome';
import { routes } from './routes';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { LoginComponent } from './login/login.component';
import { LoginCallbackComponent } from './login/login-callback.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TagSearchComponent } from './tag-search/tag-search.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardGroupComponent } from './dashboard/dashboard-group/dashboard-group.component';
import { DashboardGroupItemComponent } from './dashboard/dashboard-group-item/dashboard-group-item.component';
import { DashboardToolbarComponent } from './dashboard/dashboard-toolbar/dashboard-toolbar.component';
import { DashboardEditorComponent } from './dashboard/dashboard-editor/dashboard-editor.component';
import { environment } from '../environments/environment';



const onInit = (appConfig: AppConfigService) => {
  return () => {
    loadFaIcons();
    return appConfig.load();
  };
};


@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    LoginComponent,
    LoginCallbackComponent,
    NotFoundComponent,
    TagSearchComponent,
    DashboardComponent,
    DashboardGroupComponent,
    DashboardGroupItemComponent,
    DashboardToolbarComponent,
    DashboardEditorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    OAuthModule.forRoot(),
    RouterModule.forRoot(routes),
    FontAwesomeModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: onInit, deps: [AppConfigService], multi: true },
    httpInterceptors
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
