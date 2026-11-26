import { afterNextRender, Component, ElementRef, inject, Injector, Input, numberAttribute, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import { DataService } from '../services/data.service';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { Category, Pattern } from '../classes';
import { categoryNames, fileName } from '../utils/pattern-format';

@Component({
    selector: 'app-pattern-details',
    imports: [CommonModule, FormsModule, MdbCarouselModule, FontAwesomeModule, RouterLink],
    templateUrl: './pattern-details.component.html',
    styleUrl: './pattern-details.component.scss'
})
export class PatternDetailsComponent implements OnChanges {
  // filled from the route /patterns/:patternId (route params are text, numberAttribute converts "12" to 12)
  @Input({ transform: numberAttribute }) patternId?: number;
  pattern?: Pattern;
  categories: Category[] = [];

  fileIcon = icons.faFile;

  newCommentText = '';
  editingCommentId: number | null = null;
  editingCommentText = '';

  @ViewChild('commentsHeading') commentsHeading?: ElementRef<HTMLElement>;
  @ViewChild('patternTitle') patternTitle?: ElementRef<HTMLElement>;

  private injector = inject(Injector);
  private confirmDialog = inject(ConfirmDialogService);
  private title = inject(Title);

  // scrolls to the comments and moves the focus there, so the next Tab continues in the comments
  scrollToComments(): void {
    const heading = this.commentsHeading?.nativeElement;
    if (!heading) return;
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    heading.focus({ preventScroll: true }); // preventScroll: keep the smooth scroll above
  }

  public data = inject(DataService);

  // runs when the route gives the pattern id (on opening the page, and if the id changes)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patternId']) {
      this.cancelEditComment();
      this.newCommentText = '';
      this.loadPatternDetails();
    }
  }

  private loadPatternDetails() {
    if (!this.patternId) return;
    this.data.getPatternDetails(this.patternId.toString()).then((details: Pattern | null) => {
      this.pattern = details ?? undefined;
      // window title: the pattern's name instead of the route's generic "Pattern"
      if (this.pattern) this.title.setTitle(`${this.pattern.name} – Stitch`);
      // once the page is drawn, focus the pattern name: screen readers announce which pattern opened,
      // and the next Tab continues in the page instead of starting again from the sidebar
      // (preventScroll: the page stays at the top, with the carousel visible)
      afterNextRender(() => this.patternTitle?.nativeElement.focus({ preventScroll: true }), { injector: this.injector });
    });
    // Load all categories for display
    this.data.getCategories().then((categories: Category[]) => {
      this.categories = categories;
    });
  }

  fileName(path: string): string {
    return fileName(path);
  }

  getCategoryNames(): string {
    if (!this.pattern?.categoryIds) return '';
    return categoryNames(this.pattern.categoryIds, this.categories);
  }

  async addComment(): Promise<void> {
    if (!this.patternId) return;
    const text = this.newCommentText.trim();
    if (!text) return;

    const updatedPattern = await this.data.addComment(this.patternId, text);
    if (!updatedPattern) return;

    this.pattern = updatedPattern;
    this.newCommentText = '';
  }

  startEditComment(commentId: number, text: string): void {
    this.editingCommentId = commentId;
    this.editingCommentText = text;
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editingCommentText = '';
  }

  async saveComment(commentId: number): Promise<void> {
    if (!this.patternId) return;
    const text = this.editingCommentText.trim();
    if (!text) return;

    const updatedPattern = await this.data.editComment(this.patternId, commentId, text);
    if (!updatedPattern) return;

    this.pattern = updatedPattern;
    this.cancelEditComment();
  }

  async deleteComment(commentId: number): Promise<void> {
    if (!this.patternId) return;
    const confirmed = await this.confirmDialog.confirm(
      'Delete this comment?',
      'This comment will be permanently removed.',
      'Delete comment',
      true
    );
    if (!confirmed) return;

    const updatedPattern = await this.data.deleteComment(this.patternId, commentId);
    if (!updatedPattern) return;

    this.pattern = updatedPattern;
    if (this.editingCommentId === commentId) {
      this.cancelEditComment();
    }
    // the delete button disappeared with the comment: keep the keyboard focus in the comments
    this.commentsHeading?.nativeElement.focus({ preventScroll: true });
  }


}
