import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes, withComponentInputBinding, withInMemoryScrolling, withRouterConfig, withViewTransitions } from '@angular/router';
import { provideAnimations } from "@angular/platform-browser/animations";

import { PatternsComponent } from './patterns/patterns.component';
import { AddPatternComponent } from './add-pattern/add-pattern.component';
import { SettingsComponent } from './settings/settings.component';
// import { routes } from './app.routes';

const routes: Routes = [
  { path: '', redirectTo: '/patterns', pathMatch: 'full'},
  { path: 'patterns', component: PatternsComponent},
  { path: 'settings', component: SettingsComponent}
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, 
      withComponentInputBinding(), 
      withViewTransitions(),
      withInMemoryScrolling(), // New recommended
      withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideAnimations(),
  ]
};
