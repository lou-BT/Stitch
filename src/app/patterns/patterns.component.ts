import { Component, OnInit, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import { DataService } from '../services/data.service';
import { NgClass } from '@angular/common';
import { Categories, Pattern } from '../classes';
import * as bootstrap from 'bootstrap';
import { Subscription } from 'rxjs';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as iconsSolid from '@fortawesome/free-solid-svg-icons';

import { AddPatternComponent } from "../add-pattern/add-pattern.component";
import { PatternDetailsComponent } from "../pattern-details/pattern-details.component";
import { PatternEditComponent } from '../pattern-edit/pattern-edit.component';

@Component({
    selector: 'app-patterns',
    imports: [PatternDetailsComponent, FontAwesomeModule, AddPatternComponent, PatternEditComponent, NgClass],
    templateUrl: './patterns.component.html',
    styleUrl: './patterns.component.scss'
})
export class PatternsComponent implements OnInit, AfterViewInit{
  @ViewChild('patternModal') patternModal!: ElementRef;
  @ViewChild('addPatternModal') addPatternModal!: ElementRef;
  @ViewChild('patternEditModal') patternEditModal!: ElementRef;

  @ViewChild(PatternDetailsComponent) patternDetails?: PatternDetailsComponent;

  private modalInstance: any;
  private isSwitchingModal = false;

  patternList : any[] = [];
  selectedPatternId?: number;

  categories = Categories;
  selectedCategory: string = 'all';
  previewSource: 'photo' | 'techDrawing' = 'photo';

  plusIcon = iconsSolid.faPlus;

  constructor(private data: DataService) {
    //this.selectedCategory = "all";
  }

  ngOnInit(): void {
    this.data.patternList$.subscribe((data:any[]) => {
      console.log('Received pattern list update:', data);
      this.patternList = data;
    
    })
  }

  ngAfterViewInit() {
    const resetSelectedPatternIfNotSwitching = () => {
      if (!this.isSwitchingModal) {
        this.selectedPatternId = undefined;
      }
    };

    this.patternModal.nativeElement.addEventListener('hidden.bs.modal', resetSelectedPatternIfNotSwitching);
    this.patternEditModal.nativeElement.addEventListener('hidden.bs.modal', resetSelectedPatternIfNotSwitching);
  }
 
  setCategory(category: string) {
    if( category !== this.selectedCategory) {
      this.selectedCategory = category; 
    } else {
      this.selectedCategory = "all"; 
    } 
  }

  filterCategory = (pattern: Pattern): boolean => {
    if (!this.selectedCategory || this.selectedCategory === 'all') return true;
    return pattern.category as unknown as string === this.selectedCategory;
  }

  togglePreviewSource() {
    this.previewSource = this.previewSource === 'photo' ? 'techDrawing' : 'photo';
  }

  getPreviewImage(pattern: Pattern): string {
    const preferredImages = this.previewSource === 'photo' ? pattern.photos : pattern.techDrawings;
    const fallbackImages = this.previewSource === 'photo' ? pattern.techDrawings : pattern.photos;
    return preferredImages?.[0] || fallbackImages?.[0] || '';
  }

  private showModal(modalElement: HTMLElement) {
    document.body.appendChild(modalElement);
    this.modalInstance = new bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }

  onPatternSaved() {
    this.patternDetails?.reload();
    this.openModal('pattern');
  }

  openModal(modalName: string, pattern?: Pattern | number) {
    if (typeof pattern === 'number') {
      this.selectedPatternId = pattern;
    } else if (pattern?.id) {
      this.selectedPatternId = pattern.id;
    }
    
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

    if (!modalElement) return;

    const currentModalElement = this.modalInstance?._element as HTMLElement | undefined;
    const isSwitchingModals = !!currentModalElement && currentModalElement !== modalElement;

    if (isSwitchingModals && currentModalElement.classList.contains('show')) {
      this.isSwitchingModal = true;
      currentModalElement.addEventListener('hidden.bs.modal', () => {
        this.showModal(modalElement);
        this.isSwitchingModal = false;
      }, { once: true });
      this.modalInstance.hide();
      return;
    }

    this.showModal(modalElement);
  }

  async closeModal() {
    this.modalInstance.hide();
    //this.selectedPattern = null;
  }

  openPatternModal(pattern: any) {
    this.selectedPatternId = pattern.id;
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

}


