import { ChangeDetectorRef, Component, Input, numberAttribute, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Material, Pattern, NewPattern, SharedFile, Category } from '../classes';
import { DataService } from '../services/data.service';
import { fileName } from '../utils/pattern-format';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { CategoryPickerComponent } from '../category-picker/category-picker.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import * as icons from '@fortawesome/free-regular-svg-icons';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-pattern-edit',
  imports: [FormsModule, FontAwesomeModule, DragDropModule, RouterLink, CategoryPickerComponent],
    templateUrl: './pattern-edit.component.html',
    styleUrl: './pattern-edit.component.scss'
})
export class PatternEditComponent implements OnInit, OnChanges{
  // filled from the route /patterns/:patternId/edit (route params are text, numberAttribute converts "12" to 12)
  @Input({ transform: numberAttribute }) patternId?: number;

  private router = inject(Router);
  private confirmDialog = inject(ConfirmDialogService);

  // form content when the page was loaded, compared by hasUnsavedChanges()
  private initialSnapshot = '';
  // set after saving or deleting, so leaving the page doesn't ask about unsaved changes
  private skipUnsavedCheck = false;

  oldPattern?: Pattern;
  newPattern?: NewPattern;
  availableSharedFiles: SharedFile[] = [];
  sharedFilesFilter = '';

  fileIcon = icons.faFile;
  plusIcon = solidIcons.faPlus;
  dragHandleIcon = solidIcons.faGripVertical;

  categories: Category[] = [];

  constructor(private data: DataService, private cdr: ChangeDetectorRef) {}

  onDifficultyChange() {
    if (!this.newPattern) return;
    this.newPattern.difficulty = Math.min(5, Math.max(1, Number(this.newPattern.difficulty) || 1));
  }

  private loadPattern(): void {
    if (!this.patternId) return;
    this.data.getPatternDetails(this.patternId.toString()).then((details: any) => {
      this.oldPattern = details;
      this.newPattern = structuredClone(details) as NewPattern;
      this.newPattern.newSharedFiles = this.newPattern.newSharedFiles ?? [];
      // Ensure categoryIds is an array
      if (!this.newPattern.categoryIds || !Array.isArray(this.newPattern.categoryIds)) {
        this.newPattern.categoryIds = [];
      }
      this.initialSnapshot = JSON.stringify(this.newPattern);
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.data.getAllSharedFiles().then(files => {
      this.availableSharedFiles = files;
      this.cdr.detectChanges();
    });
    this.data.getCategories().then((categories: Category[]) => {
      this.categories = categories;
      this.cdr.detectChanges();
    });
  }

  // runs when the route gives the pattern id (on opening the page, and if the id changes)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patternId']) this.loadPattern();
  }

  fileName(path: string): string {
    return fileName(path);
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
    if( this.oldPattern && this.newPattern ) {
      this.newPattern.free = !!this.newPattern.free;
      this.newPattern.used = !!this.newPattern.used;
      await this.data.editPattern(this.oldPattern, this.newPattern);
      // back to the details page, which loads the saved version
      this.skipUnsavedCheck = true;
      this.router.navigate(['/patterns', this.oldPattern.id]);
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
    if( !this.newPattern ) return;
    const targetList = this.getTargetList(item);
    if (!targetList || index < 0 || index >= targetList.length) return;

    targetList.splice(index, 1);
  }

  onFileDrop(event: DragEvent, item: number): void {
    event.preventDefault();
    const files = event.dataTransfer!.files;
    if( !this.newPattern) return;
    switch (item) {
      case 0 :
        for(let i=0; i<files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.newPattern.photos.push(filePath);
        }
        break;
      case 1 :
        for(let i=0; i<files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.newPattern.techDrawings.push(filePath);
        }
        break;
      case 2 :
        for(let i=0; i<files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.newPattern.files.push(filePath);
        }
        break;
      case 3 :
        for(let i=0; i<files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.newPattern.newSharedFiles.push(filePath);
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
    if (!files || !this.newPattern) return;
    switch (item) {
      case 0:
        for (let i = 0; i < files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.newPattern.photos.push(filePath);
        }
        break;
      case 1:
        for (let i = 0; i < files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.newPattern.techDrawings.push(filePath);
        }
        break;
      case 2:
        for (let i = 0; i < files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.newPattern.files.push(filePath);
        }
        break;
      case 3:
        for (let i = 0; i < files.length; i++) {
          const filePath = window.electronAPI.getFilePath(files[i]);
          this.newPattern.newSharedFiles.push(filePath);
        }
        break;
      default:
        console.error('invalid type');
        break;
    }
    (event.target as HTMLInputElement).value = '';
    this.cdr.detectChanges();
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
    return (this.newPattern?.newSharedFiles ?? []).filter(p => this.matchesFilter(p));
  }

  isSharedFileSelected(file: SharedFile): boolean {
    return !!this.newPattern?.sharedFiles.some(f => f.id === file.id);
  }

  toggleSharedFile(file: SharedFile, checked: boolean): void {
    if (!this.newPattern) return;
    if (checked) {
      if (!this.isSharedFileSelected(file)) this.newPattern.sharedFiles.push(file);
    } else {
      this.newPattern.sharedFiles = this.newPattern.sharedFiles.filter(f => f.id !== file.id);
    }
  }

  removeNewSharedFile(path: string): void {
    if (!this.newPattern) return;
    this.newPattern.newSharedFiles = this.newPattern.newSharedFiles.filter(p => p !== path);
  }

  async deletePattern() {
    if( !this.oldPattern) return;
    const confirmed = await this.confirmDialog.confirm(
      `Delete "${this.oldPattern.name}"?`,
      'This permanently removes the pattern and its folder (photos, technical drawings and files).',
      'Delete pattern',
      true
    );
    if (!confirmed) return;

    this.data.deletePattern(this.oldPattern);
    // the pattern no longer exists: back to the list
    this.skipUnsavedCheck = true;
    this.router.navigate(['/patterns']);
  }

  // used by unsavedChangesGuard when leaving the page
  hasUnsavedChanges(): boolean {
    if (this.skipUnsavedCheck || !this.newPattern) return false;
    return JSON.stringify(this.newPattern) !== this.initialSnapshot;
  }
}
