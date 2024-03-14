import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [MatTabsModule,
            FontAwesomeModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  // faImages= faImages;
  images = icons.faImages;
  plus = icons.faSquarePlus;
  clock = icons.faClock;

}
