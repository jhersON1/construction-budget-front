import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideMarkdown(), provideRouter(routes),provideHttpClient(withInterceptorsFromDi())]
};
