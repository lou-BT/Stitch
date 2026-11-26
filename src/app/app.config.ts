import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes, TitleStrategy, withComponentInputBinding, withInMemoryScrolling, withRouterConfig, withViewTransitions } from '@angular/router';
import { provideAnimations } from "@angular/platform-browser/animations";

import { PatternsComponent } from './patterns/patterns.component';
import { AddPatternComponent } from './add-pattern/add-pattern.component';
import { PatternDetailsComponent } from './pattern-details/pattern-details.component';
import { PatternEditComponent } from './pattern-edit/pattern-edit.component';
import { SettingsComponent } from './settings/settings.component';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';
import { AppTitleStrategy } from './app-title.strategy';
// import { routes } from './app.routes';

// route parameters (e.g. :patternId) are passed to the component input with the same name (withComponentInputBinding)
const routes: Routes = [
  { path: '', redirectTo: '/patterns', pathMatch: 'full'},
  // title: window title, see AppTitleStrategy (the details page replaces it with the pattern's name)
  { path: 'patterns', component: PatternsComponent, title: 'Patterns'},
  // must stay before 'patterns/:patternId', otherwise "new" would be read as a pattern id
  { path: 'patterns/new', component: AddPatternComponent, title: 'New pattern', canDeactivate: [unsavedChangesGuard]},
  { path: 'patterns/:patternId', component: PatternDetailsComponent, title: 'Pattern'},
  { path: 'patterns/:patternId/edit', component: PatternEditComponent, title: 'Edit pattern', canDeactivate: [unsavedChangesGuard]},
  { path: 'settings', component: SettingsComponent, title: 'Settings'}
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, 
      withComponentInputBinding(), 
      withViewTransitions(),
      withInMemoryScrolling(), // New recommended
      withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideAnimations(),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ]
};
