import { Component, OnInit, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { Categories } from '../classes';
import * as bootstrap from 'bootstrap';
import { PatternDetailsComponent } from "../pattern-details/pattern-details.component";
import { Subscription } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import * as iconsSolid from '@fortawesome/free-solid-svg-icons';
import { AddPatternComponent } from "../add-pattern/add-pattern.component";


@Component({
  selector: 'app-patterns',
  standalone: true,
  imports: [CommonModule, PatternDetailsComponent, FontAwesomeModule, AddPatternComponent],
  templateUrl: './patterns.component.html',
  styleUrl: './patterns.component.scss'
})
export class PatternsComponent implements OnInit, AfterViewInit{
  @ViewChild('patternModal') patternModal!: ElementRef;
  @ViewChild('addPatternModal') addPatternModal!: ElementRef;
  patternList : any[] = [];
  selectedPattern: any | null = null;

  categories = Categories;
  selectedCategory: string;

  plusIcon = iconsSolid.faPlus;

  constructor(private data: DataService) {
    this.selectedCategory = "all";
  }

  ngOnInit(): void {
    this.data.patternList$.subscribe((data:any[]) => {
      this.patternList = data;
    })
  }

  ngAfterViewInit() {
    this.patternModal.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.selectedPattern = null;
    })
  }
 
  setCategory(category: string) {
    this.selectedCategory = category;
  }

  openPatternModal(pattern: any) {
    this.selectedPattern = pattern;
    const modalElement = this.patternModal.nativeElement;
    document.body.appendChild(modalElement); // Move modal to body
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  openNewPatternModal() {
    const modalElement = this.addPatternModal.nativeElement;
    document.body.appendChild(modalElement);
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

}
