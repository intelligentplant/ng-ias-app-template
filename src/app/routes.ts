import { Routes } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { CanDeactivateGuard } from './can-deactivate.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { LoginCallbackComponent } from './login/login-callback.component';
import { NotFoundComponent } from './not-found/not-found.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full'
  },
  {
      path: 'login',
      component: LoginComponent
  },
  {
      path: 'login-callback',
      component: LoginCallbackComponent
  },
  {
    path: 'app',
    canActivate: [AuthGuard],
    children: [
      {
          path: '',
          redirectTo: 'dashboards',
          pathMatch: 'full'
      },
      {
        path: 'dashboards',
        component: DashboardComponent,
        canDeactivate: [CanDeactivateGuard]
      }
    ]
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
