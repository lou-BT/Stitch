import { Component, ViewEncapsulation } from '@angular/core';
import { MatIconModule }  from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';


@Component({
    selector: 'app-root',
    imports: [FontAwesomeModule,
        MatIconModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        ConfirmDialogComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    encapsulation: ViewEncapsulation.None
})

export class AppComponent {
  title = 'Stitch';

  //nav icons
  settingsIcon = solidIcons.faGear;
  patternsIcon = solidIcons.faShirt;
  fabricsIcon = solidIcons.faScroll;
  images = solidIcons.faImages;
  scroll = solidIcons.faScroll;
  plus = icons.faSquarePlus;
  clock = icons.faClock;
}
