import { Component, ViewEncapsulation, ChangeDetectorRef, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Material, NewPattern, SharedFile, createPattern, Category } from '../classes';
import { NgClass} from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DataService } from '../services/data.service';

@Component({
    selector: 'app-add-pattern',
    imports: [FormsModule, NgClass, FontAwesomeModule, ScrollingModule, DragDropModule],
    templateUrl: './add-pattern.component.html', 
    styleUrl: './add-pattern.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AddPatternComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<any>();
  patternNameList : string[] = [];
  patternName: string = '';
  pattern: NewPattern =  createPattern();
  availableSharedFiles: SharedFile[] = [];
  sharedFilesFilter = '';

  fileIcon = icons.faFile;
  plusIcon = solidIcons.faPlus;
  dragHandleIcon = solidIcons.faGripVertical;

  categories: Category[] = [];

  private cdr = inject(ChangeDetectorRef);
  private data = inject(DataService);

  private loadSharedFiles(): void {
    this.data.getAllSharedFiles().then(files  => {
      this.availableSharedFiles = files;
      this.cdr.detectChanges();
    });
  }

  private loadCategories(): void {
    this.data.getCategories().then((categories: Category[]) => {
      this.categories = categories;
      if (this.pattern.categoryId === null) {
        this.pattern.categoryId = (this.categories.find(category => category.name === 'Else') ?? this.categories[0]).id;
      }
      this.cdr.detectChanges();
    });
  }
  
  ngOnInit(): void {
    this.loadSharedFiles();
    this.loadCategories();
    console.log(this.categories);
  }

  extractFileName(filePath: string): string {
    const pathParts = filePath.split(/[\\/]/);
    return pathParts[pathParts.length - 1] || '';
  }
  
  checkNameValidity() {
    if (!this.data.checkPatternNameValidity(this.pattern.name)) {
      const inputField = document.getElementById('name');
      inputField?.classList.add('is-invalid');
    } else {
      const inputField = document.getElementById('name');
      inputField?.classList.remove('is-invalid');
    }
  }

  checkNameValidityBis() {
    return this.data.checkPatternNameValidity(this.pattern.name);
  }

  onDifficultyChange(): void {
    this.pattern.difficulty = Math.min(5, Math.max(1, Number(this.pattern.difficulty) || 1));
  }

  // FILES HANDLING 
  private addFiles(files: FileList, type: string): void {
    switch (type) {
      case "photos":
        for (let i = 0; i < files.length; i++) {
          const filePath = window.getFilePath(files[i]);
          this.pattern.photos.push(filePath);
        }
        break;
      case "techDrawings":
        for (let i = 0; i < files.length; i++) {
          const filePath = window.getFilePath(files[i]);
          this.pattern.techDrawings.push(filePath);
        }
        break;
      case "files":
        for (let i = 0; i < files.length; i++) {
          const filePath = window.getFilePath(files[i]);
          this.pattern.files.push(filePath);
        }
        break;
      case "newSharedFiles":
        for (let i = 0; i < files.length; i++) {
          const filePath = window.getFilePath(files[i]);
          this.pattern.newSharedFiles.push(filePath);
        }
        break;
      default:
        console.error("invalid type");
        break;
    }
    this.cdr.detectChanges();
  }

  openFilePicker(input: HTMLInputElement): void {
    input.click();
  }

  onFileSelect(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.addFiles(input.files, type);
    input.value = '';
  }

  onFileDrop(event: DragEvent, type: string): void {
    event.preventDefault();
    const files = event.dataTransfer!.files;
    if (!files || files.length === 0) return;
    this.addFiles(files, type);
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  private getTargetList(list: number): string[] | undefined {
    switch (list) {
      case 0:
        return this.pattern.photos;
      case 1:
        return this.pattern.techDrawings;
      case 2:
        return this.pattern.files;
      default:
        return undefined;
    }
  }

  onReorderDrop(event: CdkDragDrop<string[]>, list: number): void {
    const targetList = this.getTargetList(list);
    if (!targetList) return;
    moveItemInArray(targetList, event.previousIndex, event.currentIndex);
  }

  removeItem(list: number, index: number): void {
    this.getTargetList(list)?.splice(index, 1);
  }

  // SHARED FILES
  // available files + any newly added ones, filtered by the search text
  private matchesFilter(path: string): boolean {
    const q = this.sharedFilesFilter.trim().toLowerCase();
    return !q || this.extractFileName(path).toLowerCase().includes(q);
  }

  get filteredAvailableSharedFiles(): SharedFile[] {
    return this.availableSharedFiles.filter(f => this.matchesFilter(f.filePath));
  }

  get filteredNewSharedFiles(): string[] {
    return this.pattern.newSharedFiles.filter(p => this.matchesFilter(p));
  }

  isSharedFileSelected(file: SharedFile): boolean {
    return this.pattern.sharedFiles.some(f => f.id === file.id);
  }

  toggleSharedFile(file: SharedFile, checked: boolean): void {
    if (checked) {
      if (!this.isSharedFileSelected(file)) this.pattern.sharedFiles.push(file);
    } else {
      this.pattern.sharedFiles = this.pattern.sharedFiles.filter(f => f.id !== file.id);
    }
  }

  removeNewSharedFile(path: string): void {
    this.pattern.newSharedFiles = this.pattern.newSharedFiles.filter(p => p !== path);
  }


  // RESSOURCES
  addResourceRow(type: 'fabric' | 'materials'): void {
    const nextItem: Material = { type: '', requirement: '' };
    if (type === 'fabric') {
      this.pattern.fabric.push(nextItem);
      return;
    }
    this.pattern.materials.push(nextItem);
  }

  removeResourceRow(type: 'fabric' | 'materials', index: number): void {
    if (type === 'fabric') {
      this.pattern.fabric.splice(index, 1);
      return;
    }
    this.pattern.materials.splice(index, 1);
  }

  submitForm(): void {
    this.onDifficultyChange();
    // Validate form data
    if (!this.pattern.name || this.pattern.files.length === 0 || !this.data.checkPatternNameValidity(this.pattern.name)) {
      console.error('Pattern name and files are required.');
      return;
    }

    else {
      console.log(this.pattern);
      this.data.addPattern(this.pattern);
      this.loadSharedFiles();
      this.loadCategories();
      this.closeModal();
    }
  }

  closeModal() {
    console.log('close modale 1');
    this.closeModalEvent.emit(true);
    this.pattern = createPattern();
    this.pattern.categoryId = (this.categories.find(category => category.name === 'Else') ?? this.categories[0]).id;
  }

}
