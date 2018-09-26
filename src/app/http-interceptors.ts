import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AccessTokenHttpInterceptor } from './auth/access-token-http-interceptor';
import { BusyInterceptor } from './busy.service';

/** HTTP interceptors in outside-in order */
export const httpInterceptors = [
  { provide: HTTP_INTERCEPTORS, useClass: BusyInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AccessTokenHttpInterceptor, multi: true }
];
