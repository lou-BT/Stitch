import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MdbCarouselModule } from 'mdb-angular-ui-kit/carousel';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';
import { DataService } from '../services/data.service';
import { Category, Pattern } from '../classes';

@Component({
    selector: 'app-pattern-details',
    imports: [CommonModule, FormsModule, MdbCarouselModule, FontAwesomeModule],
    templateUrl: './pattern-details.component.html',
    styleUrl: './pattern-details.component.scss'
})
export class PatternDetailsComponent implements OnInit, OnChanges {
  @Input() patternId?: number;
  pattern?: Pattern;
  categories: Category[] = [];

  fileIcon = icons.faFile;

  newCommentText = '';
  editingCommentId: number | null = null;
  editingCommentText = '';

  scrollToComments(): void {
    document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  public data = inject(DataService);

  ngOnInit() {
    this.loadPatternDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patternId']) {
      this.cancelEditComment();
      this.newCommentText = '';
      this.loadPatternDetails();
    }
  }

  reload() {
    this.loadPatternDetails();
  }

  private loadPatternDetails() {
    if (!this.patternId) return;
    this.data.getPatternDetails(this.patternId.toString()).then((details: Pattern | null) => {
      this.pattern = details ?? undefined;
    });
    // Load all categories for display
    this.data.getCategories().then((categories: Category[]) => {
      this.categories = categories;
    });
  }

  getCategoryNames(): string {
    if (!this.pattern?.categoryIds) return '';
    return this.pattern.categoryIds
      .map(id => this.categories.find(c => c.id === id)?.name || 'Unknown')
      .join(', ');
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
    const updatedPattern = await this.data.deleteComment(this.patternId, commentId);
    if (!updatedPattern) return;

    this.pattern = updatedPattern;
    if (this.editingCommentId === commentId) {
      this.cancelEditComment();
    }
  }


}
