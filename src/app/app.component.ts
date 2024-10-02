import { Component, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AddPatternComponent } from './add-pattern/add-pattern.component';
import { PatternsComponent } from './patterns/patterns.component';
import { MatIconModule }  from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { RouterOutlet, RouterLink } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatTabsModule,
            AddPatternComponent,
            PatternsComponent,
            FontAwesomeModule,
            MatIconModule,
            RouterOutlet,
            RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'Stitch';

  //nav icons
  settingsIcon = solidIcons.faGear;
  images = solidIcons.faImages;
  scroll = solidIcons.faScroll;
  plus = icons.faSquarePlus;
  clock = icons.faClock;
}
