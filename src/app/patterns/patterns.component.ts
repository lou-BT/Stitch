import { Component, OnInit, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { Categories, Pattern } from '../classes';
import * as bootstrap from 'bootstrap';
import { Subscription } from 'rxjs';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import * as iconsSolid from '@fortawesome/free-solid-svg-icons';

import { AddPatternComponent } from "../add-pattern/add-pattern.component";
import { PatternDetailsComponent } from "../pattern-details/pattern-details.component";
import { PatternEditComponent } from '../pattern-edit/pattern-edit.component';

@Component({
  selector: 'app-patterns',
  standalone: true,
  imports: [CommonModule, PatternDetailsComponent, FontAwesomeModule, AddPatternComponent, PatternEditComponent],
  templateUrl: './patterns.component.html',
  styleUrl: './patterns.component.scss'
})
export class PatternsComponent implements OnInit, AfterViewInit{
  @ViewChild('patternModal') patternModal!: ElementRef;
  @ViewChild('addPatternModal') addPatternModal!: ElementRef;
  @ViewChild('patternEditModal') patternEditModal!: ElementRef;

  private modalInstance: any;

  patternList : any[] = [];
  selectedPattern: Pattern | null = null;

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
    // this.patternModal.nativeElement.addEventListener('hidden.bs.modal', () => {
    //   console.log('setting to null');
    //   this.selectedPattern = null;
    // })
  }
 
  setCategory(category: string) {
    this.selectedCategory = category;
  }

  openModal( modalName: string, pattern? : any ) {
    this.modalInstance.hide();

    if( pattern ) 
      this.selectedPattern = pattern;
    
    var modalElement : any = null;
    switch( modalName ) {
      case "pattern":
        modalElement = this.patternModal.nativeElement;
        break;
      case "new":
        modalElement = this.addPatternModal.nativeElement;
        break;
      case "edit":
        modalElement = this.patternEditModal.nativeElement;
        break;
      default:
        break;
    }
    document.body.appendChild(modalElement);
    this.modalInstance = new bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }

  async closeModal() {
    this.modalInstance.hide();
    setTimeout(() => {this.selectedPattern = null}, 100);
    //this.selectedPattern = null;
  }

  openPatternModal(pattern: any) {
    this.selectedPattern = pattern;
    const modalElement = this.patternModal.nativeElement;
    document.body.appendChild(modalElement); // Move modal to body
    this.modalInstance = new bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }

  openNewPatternModal() {
    const modalElement = this.addPatternModal.nativeElement;
    document.body.appendChild(modalElement);
    this.modalInstance = new bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }

  // openPatternEditModal() {
  //   this.modalInstance.hide();
  //   const modalEleme

  // }

}


