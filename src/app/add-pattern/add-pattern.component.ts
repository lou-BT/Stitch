import { Component, ViewEncapsulation, ChangeDetectorRef, OnInit, inject, ViewChild, ElementRef, Injector, afterNextRender } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Material, NewPattern, SharedFile, createPattern, Category } from '../classes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DataService } from '../services/data.service';
import { fileName } from '../utils/pattern-format';
import { CategoryPickerComponent } from '../category-picker/category-picker.component';
import { PatternNameValidatorDirective } from '../validators/pattern-name.validator';

@Component({
    selector: 'app-add-pattern',
    imports: [FormsModule, FontAwesomeModule, ScrollingModule, DragDropModule, RouterLink, CategoryPickerComponent, PatternNameValidatorDirective],
    templateUrl: './add-pattern.component.html', 
    styleUrl: './add-pattern.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class AddPatternComponent implements OnInit {
  pattern: NewPattern =  createPattern();
  availableSharedFiles: SharedFile[] = [];
  sharedFilesFilter = '';

  fileIcon = icons.faFile;
  plusIcon = solidIcons.faPlus;
  dragHandleIcon = solidIcons.faGripVertical;

  categories: Category[] = [];

  // VALIDATION
  // set by the first click on "Add pattern": from then on, every error message is shown
  submitted = false;
  // while the pattern is being added (files copied): the submit button is disabled
  saving = false;
  // adding failed in the main process (file copy or database): shows an alert above the buttons
  addFailed = false;

  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;
  @ViewChild('addFilesButton') addFilesButton?: ElementRef<HTMLButtonElement>;

  private cdr = inject(ChangeDetectorRef);
  private data = inject(DataService);
  private router = inject(Router);
  private injector = inject(Injector);

  // empty form content (after the default category is applied), compared by hasUnsavedChanges()
  private initialSnapshot = JSON.stringify(this.pattern);
  // set after the pattern is added, so leaving the page doesn't ask about unsaved changes
  private skipUnsavedCheck = false;

  private loadSharedFiles(): void {
    this.data.getAllSharedFiles().then(files  => {
      this.availableSharedFiles = files;
      this.cdr.detectChanges();
    });
  }

  private loadCategories(): void {
    this.data.getCategories().then((categories: Category[]) => {
      this.categories = categories;
      // Initialize with "Else" category if none provided
      if (!this.pattern.categoryIds || this.pattern.categoryIds.length === 0) {
        const elseCategory = this.categories.find(category => category.name === 'Else') ?? this.categories[0];
        if (elseCategory) {
          this.pattern.categoryIds = [elseCategory.id];
        }
        // the default category is not a change made by the user
        this.initialSnapshot = JSON.stringify(this.pattern);
      }
      this.cdr.detectChanges();
    });
  }
  
  ngOnInit(): void {
    this.loadSharedFiles();
    this.loadCategories();
  }

  fileName(path: string): string {
    return fileName(path);
  }
  
  // at least one pattern file is required
  get filesMissing(): boolean {
    return this.pattern.files.length === 0;
  }

  onDifficultyChange(): void {
    this.pattern.difficulty = Math.min(5, Math.max(1, Number(this.pattern.difficulty) || 1));
  }

  // FILES HANDLING 
  private addFiles(files: FileList, type: string): void {
    switch (type) {
      case "photos":
        for (let i = 0; i < files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.pattern.photos.push(filePath);
        }
        break;
      case "techDrawings":
        for (let i = 0; i < files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.pattern.techDrawings.push(filePath);
        }
        break;
      case "files":
        for (let i = 0; i < files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.pattern.files.push(filePath);
        }
        break;
      case "newSharedFiles":
        for (let i = 0; i < files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
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
    return !q || this.fileName(path).toLowerCase().includes(q);
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

  async submitForm(form: NgForm): Promise<void> {
    this.submitted = true;
    this.addFailed = false;
    this.onDifficultyChange();

    // invalid: the error messages are now shown, move the focus to the first problem
    if (form.invalid || this.filesMissing) {
      this.focusFirstError(form);
      return;
    }

    this.saving = true;
    // spaces at the ends are not kept (" Calliope " -> "Calliope"), the folder is named after it
    const newPatternId = await this.data.addPattern({ ...this.pattern, name: this.pattern.name.trim() });
    this.saving = false;

    if (newPatternId === null) {
      // stay on the form so nothing typed is lost, and say so (role="alert" in the template)
      this.addFailed = true;
      return;
    }
    // open the new pattern's details page
    this.skipUnsavedCheck = true;
    this.router.navigate(['/patterns', newPatternId]);
  }

  // once the error messages are drawn, focus the first field to fix (name first, then the files)
  private focusFirstError(form: NgForm): void {
    afterNextRender(() => {
      if (form.controls['name']?.invalid) {
        this.nameInput?.nativeElement.focus();
      } else if (this.filesMissing) {
        this.addFilesButton?.nativeElement.focus();
      }
    }, { injector: this.injector });
  }

  // used by unsavedChangesGuard when leaving the page
  hasUnsavedChanges(): boolean {
    if (this.skipUnsavedCheck) return false;
    return JSON.stringify(this.pattern) !== this.initialSnapshot;
  }
}
