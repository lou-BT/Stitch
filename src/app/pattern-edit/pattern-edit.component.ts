import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Material, Pattern, PatternEdit, NewPattern, createPatternEdit } from '../classes';
import { DataService } from '../services/data.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import * as icons from '@fortawesome/free-regular-svg-icons';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-pattern-edit',
  imports: [FormsModule, FontAwesomeModule, DragDropModule],
    templateUrl: './pattern-edit.component.html',
    styleUrl: './pattern-edit.component.scss'
})
export class PatternEditComponent implements OnInit, OnChanges{
  @Input() oldPatternId?: number;
  @Output() savedEvent = new EventEmitter<void>();

  oldPattern?: Pattern;
  newPattern? : NewPattern;
  patternEdit?: PatternEdit;

  fileIcon = icons.faFile;
  plusIcon = solidIcons.faPlus;
  dragHandleIcon = solidIcons.faGripVertical;

  constructor(private data: DataService, private cdr: ChangeDetectorRef) {
console.log("constructor", this.oldPatternId);
  }

  onDifficultyChange() {
    if (!this.newPattern) return;
    this.newPattern.difficulty = Math.min(5, Math.max(1, Number(this.newPattern.difficulty) || 1));
  }

  ngOnInit() {
    if (this.oldPatternId) {
      this.data.getPatternDetails(this.oldPatternId.toString()).then((details: any) => {
        this.oldPattern = details;
        this.newPattern = this.oldPattern as NewPattern;
        this.newPattern.fabric = this.newPattern.fabric ?? [];
        this.newPattern.materials = this.newPattern.materials ?? [];
        this.patternEdit = createPatternEdit();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if( changes['oldPatternId']) {
      if (this.oldPatternId) {
        this.data.getPatternDetails(this.oldPatternId.toString()).then((details: any) => {
          this.oldPattern = details;
          this.newPattern = this.oldPattern as NewPattern;
          this.newPattern.fabric = this.newPattern.fabric ?? [];
          this.newPattern.materials = this.newPattern.materials ?? [];
          this.patternEdit = createPatternEdit();
        });
      }
    }
  }

  addResourceRow(type: 'fabric' | 'materials'): void {
    if (!this.newPattern) return;
    const nextItem: Material = { type: '', requirement: '' };
    if (type === 'fabric') {
      this.newPattern.fabric.push(nextItem);
      return;
    }
    this.newPattern.materials.push(nextItem);
  }

  removeResourceRow(type: 'fabric' | 'materials', index: number): void {
    if (!this.newPattern) return;
    if (type === 'fabric') {
      this.newPattern.fabric.splice(index, 1);
      return;
    }
    this.newPattern.materials.splice(index, 1);
  }

  async submitForm() {
    this.onDifficultyChange();
    if( this.newPattern && this.patternEdit) {
      this.newPattern.free = !!this.newPattern.free;
      this.newPattern.used = !!this.newPattern.used;
      await this.data.editPattern(this.newPattern, this.patternEdit);
      this.savedEvent.emit();
    }
  }

  onReorderDrop(event: CdkDragDrop<string[]>, item: number) {
    const targetList = this.getTargetList(item);
    if (!targetList) return;
    moveItemInArray(targetList, event.previousIndex, event.currentIndex);
  }

  private getTargetList(item: number): string[] | undefined {
    if (!this.newPattern) return undefined;
    switch (item) {
      case 0:
        return this.newPattern.photos;
      case 1:
        return this.newPattern.techDrawings;
      case 2:
        return this.newPattern.files;
      default:
        return undefined;
    }
  }

  removeItem(item: number, index: number) {
    if( !this.newPattern || !this.patternEdit) return;
    const targetList = this.getTargetList(item);
    if (!targetList || index < 0 || index >= targetList.length) return;

    const removedPath = targetList[index];

    switch(item) {
      case 0:
        if (this.removeFromNewList(this.patternEdit.newPhotos, removedPath)) break;
        this.patternEdit.delPhotos.push(removedPath);
        break;
      case 1:
        if (this.removeFromNewList(this.patternEdit.newTechDrawings, removedPath)) break;
        this.patternEdit.delTechDrawings.push(removedPath);
        break;
      case 2:
        if (this.removeFromNewList(this.patternEdit.newFiles, removedPath)) break;
        this.patternEdit.delFiles.push(removedPath);
        break;
      default:
        break;
    }

    targetList.splice(index, 1);
  }

  private removeFromNewList(list: string[], removedPath: string): boolean {
    const newIndex = list.indexOf(removedPath);
    if (newIndex === -1) return false;
    list.splice(newIndex, 1);
    return true;
  }

  onFileDrop(event: DragEvent, item: number): void {
    event.preventDefault();
    const files = event.dataTransfer!.files;
    if( !this.patternEdit || !this.newPattern) return;
    switch (item) {
      case 0 :
        for(let i=0; i<files.length; i++) {
          const filePath = window.getFilePath(files[i]);
          this.newPattern.photos.push(filePath);
          this.patternEdit.newPhotos.push(filePath);
        }
        break;
      case 1 :
        for(let i=0; i<files.length; i++) {
          const filePath = window.getFilePath(files[i]);
          this.newPattern.techDrawings.push(filePath);
          this.patternEdit.newTechDrawings.push(filePath);
        }
        break;
      case 2 :
        for(let i=0; i<files.length; i++) {
          const filePath = window.getFilePath(files[i]);
          this.newPattern.files.push(filePath);
          this.patternEdit.newFiles.push(filePath);
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

  openFilePicker(input: HTMLInputElement): void {
    input.click();
  }

  onFileSelect(event: Event, item: number): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files || !this.patternEdit || !this.newPattern) return;
    switch (item) {
      case 0:
        for (let i = 0; i < files.length; i++) {
          const filePath = window.getFilePath(files[i]);
          this.newPattern.photos.push(filePath);
          this.patternEdit.newPhotos.push(filePath);
        }
        break;
      case 1:
        for (let i = 0; i < files.length; i++) {
          const filePath = window.getFilePath(files[i]);
          this.newPattern.techDrawings.push(filePath);
          this.patternEdit.newTechDrawings.push(filePath);
        }
        break;
      case 2:
        for (let i = 0; i < files.length; i++) {
          const filePath = window.getFilePath(files[i]);
          this.newPattern.files.push(filePath);
          this.patternEdit.newFiles.push(filePath);
        }
        break;
      default:
        console.error('invalid type');
        break;
    }
    (event.target as HTMLInputElement).value = '';
    this.cdr.detectChanges();
  }

  testFunction() {
    console.log("");
  }

  deletePattern() {
    if( !this.oldPattern) return;
    this.data.deletePattern(this.oldPattern);
  }

  closeModal() {
    // this.modalInstance.hide();
  }

}
