import { Component, Input } from '@angular/core';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-pattern-details',
  standalone: true,
  imports: [CommonModule, MdbCarouselModule, FontAwesomeModule],
  templateUrl: './pattern-details.component.html',
  styleUrl: './pattern-details.component.scss'
})
export class PatternDetailsComponent {
  @Input() pattern: any | null;

  fileIcon = icons.faFile;

  constructor(public data: DataService) {}
  
}
