import { bootstrapApplication } from '@angular/platform-browser';
// Bootstrap's JavaScript, loaded once for the whole app (dropdowns, modals... using data-bs-* attributes)
import 'bootstrap';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

