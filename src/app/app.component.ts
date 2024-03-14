import { Component, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AddPatternComponent } from './add-pattern/add-pattern.component';
import { PatternsComponent } from './patterns/patterns.component';
import { MatIconModule }  from '@angular/material/icon';
import { NavComponent } from './nav/nav.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatTabsModule,
            NavComponent,
            AddPatternComponent,
            PatternsComponent,
            FontAwesomeModule,
            MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'Stitch';

  //nav icons
  images = icons.faImages;
  plus = icons.faSquarePlus;
  clock = icons.faClock;
}
