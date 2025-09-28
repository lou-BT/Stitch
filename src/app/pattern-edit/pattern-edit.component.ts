import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Pattern, PatternEdit } from '../classes';
import { DataService } from '../services/data.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-pattern-edit',
    imports: [FormsModule, FontAwesomeModule],
    templateUrl: './pattern-edit.component.html',
    styleUrl: './pattern-edit.component.scss'
})
export class PatternEditComponent implements OnInit, OnChanges{
  @Input() oldPattern! : Pattern;
  newPattern! : Pattern;
  patternEdit!: PatternEdit;

  fileIcon = icons.faFile;
  plusIcon = solidIcons.faPlus;

  constructor(private data: DataService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.newPattern  = this.oldPattern as Pattern;
    this.patternEdit = new PatternEdit(this.newPattern);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if( changes['oldPattern']) {
      this.newPattern = this.oldPattern as Pattern;
      this.patternEdit = new PatternEdit(this.newPattern);
    }
  }

  submitForm() {
    this.data.editPattern(this.newPattern, this.patternEdit);
  }

  removeItem(item: number, index: number) {
    switch(item) {
      case 0:
        this.patternEdit.delPhotos.push(this.newPattern.photos[index]);
        this.newPattern.photos.splice(index,1);
        break;
      case 1:
        this.patternEdit.delTechDrawings.push(this.newPattern.techDrawings[index]);
        this.newPattern.techDrawings.splice(index,1);
        break;
      case 2:
        this.patternEdit.delFiles.push(this.newPattern.files[index]);
        this.newPattern.files.splice(index,1);
        break;
      default:
        break;
    }
  }

  removeNewItem(item: number, index: number) {
    switch(item) {
      case 0:
        this.patternEdit.newPhotos.splice(index,1);
        break;
      case 1:
        this.patternEdit.newTechDrawings.splice(index,1);
        break;
      case 2:
        this.patternEdit.newFiles.splice(index,1);
        break;
      default:
        break;
    }
  }

  onFileDrop(event: DragEvent, item: number): void {
    event.preventDefault();
    const files = event.dataTransfer!.files;
    switch (item) {
      case 0 :
        for(let i=0; i<files.length; i++) {
          this.patternEdit.newPhotos.push(files[i].path);
        }
        break;
      case 1 :
        for(let i=0; i<files.length; i++) {
          this.patternEdit.newTechDrawings.push(files[i].path);
        }
        break;
      case 2 :
        for(let i=0; i<files.length; i++) {
          this.patternEdit.newFiles.push(files[i].path);
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

  testFunction() {
    console.log("");
  }

  deletePattern() {
    this.data.deletePattern(this.oldPattern);
  }

  closeModal() {
    // this.modalInstance.hide();
  }

}
