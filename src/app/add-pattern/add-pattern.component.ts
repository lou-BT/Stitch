import { Component, ViewEncapsulation, ChangeDetectorRef, EventEmitter, Output, OnInit } from '@angular/core';
import { NgForm, FormsModule, FormControl } from '@angular/forms';
import { Pattern, Category, NewPattern } from '../classes';
import { NgClass, NgFor, NgIf } from '@angular/common';
//import { PatternService } from '../services/pattern.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-add-pattern',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, NgClass, MatGridListModule, FontAwesomeModule, ScrollingModule],
  templateUrl: './add-pattern.component.html',
  styleUrl: './add-pattern.component.scss',
  encapsulation: ViewEncapsulation.None 
})
export class AddPatternComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<any>();
  //patternService = new PatternService();
  patternNameList : string[] = [];
  patternName: string = '';
  pattern =  new Pattern();

  pdf = icons.faFilePdf;
  xmark = solidIcons.faCircleXmark; // faXmarkCircle;

  constructor(private cdr: ChangeDetectorRef, private data: DataService) {}

  ngOnInit(): void {}

  extractFileName(filePath: string): string {
    // Split the filePath by '/' to separate into parts
    const pathParts = filePath.split(/[\\/]/);

    // Get the last part of the path, which is the filename
    const fileName = pathParts[pathParts.length -1];
    return fileName || ''; // Return the extracted filename or an empty string if not found
  }
  
  checkNameValidity() {
    if (!this.data.checkPatternNameValidity(this.pattern.name)) {
      const inputField = document.getElementById('patternNameInput');
      inputField?.classList.add('is-invalid');
    } else {
      const inputField = document.getElementById('patternNameInput');
      inputField?.classList.remove('is-invalid');
    }
  }

  checkNameValidityBis() {
    return this.data.checkPatternNameValidity(this.pattern.name);
  }

  onFileDrop(event: DragEvent, type: string): void {
    event.preventDefault();
    const files = event.dataTransfer!.files;
    switch (type) {
      case "photos" :
        for(let i=0; i<files.length; i++) {
          this.pattern.photos.push(files[i].path);
        }
        break;
      case "techDrawings" :
        for(let i=0; i<files.length; i++) {
          this.pattern.techDrawings.push(files[i].path);
        }
        break;
      case "files" :
        for(let i=0; i<files.length; i++) {
          this.pattern.files.push(files[i].path);
        }
        break;
      default:
        console.error("invalid type");
        break;
    }
    this.cdr.detectChanges();
    //console.log("new file",  this.files, this.pattern);
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  deleteItem(list: number , item: string) {
    switch(list) {
      case 0 :
        var index = this.pattern.photos.indexOf(item);
        if ( index != -1 ) this.pattern.photos.splice(index,1);
        break;
      case 1 :
        var index = this.pattern.techDrawings.indexOf(item);
        if ( index != -1 ) this.pattern.techDrawings.splice(index,1);
        break;
      case 2 :
        var index = this.pattern.files.indexOf(item);
        if ( index != -1 ) this.pattern.files.splice(index,1);
        break;
      default :
        break;
    }
  }

  submitForm(): void {
    // Validate form data
    if (!this.pattern.name || this.pattern.files.length === 0 || !this.data.checkPatternNameValidity(this.pattern.name)) {
      console.error('Pattern name and files are required.');
      return;
    }

    else {
      console.log(this.pattern);
      this.data.addPattern(this.pattern);
      this.closeModal();
    }
  }

  closeModal() {
    console.log('close modale 1');
    this.closeModalEvent.emit(true);
    this.pattern = new Pattern();
  }

}
