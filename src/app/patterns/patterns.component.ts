import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { PatternFiltersService } from '../services/pattern-filters.service';
import { FormsModule } from '@angular/forms';
import { Category, Pattern } from '../classes';
import { categoryNames } from '../utils/pattern-format';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as iconsSolid from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-patterns',
    imports: [FontAwesomeModule, FormsModule, RouterLink],
    templateUrl: './patterns.component.html',
    styleUrl: './patterns.component.scss'
})
export class PatternsComponent implements OnInit {
  patternList: Pattern[] = [];

  categories: Category[] = [];
  categorySearch = '';
  // search, selected categories and preview source: stored in a service to survive navigation
  filters = inject(PatternFiltersService);

  plusIcon = iconsSolid.faPlus;
  removeIcon = iconsSolid.faXmark;

  private destroyRef = inject(DestroyRef);

  constructor(private data: DataService) {}

  ngOnInit(): void {
    // the subscription ends automatically when the component is destroyed (e.g. navigating to another page)
    this.data.patternList$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: Pattern[]) => {
      this.patternList = data;
    });
    this.data.getCategories().then((categories: Category[]) => {
      this.categories = categories;
    });
  }

 
  // categories shown in the dropdown, narrowed by the text typed in its search input
  get filteredCategories(): Category[] {
    const search = this.categorySearch.trim().toLowerCase();
    if (!search) return this.categories;
    return this.categories.filter(category => category.name.toLowerCase().includes(search));
  }

  // selected categories, displayed as removable chips next to the dropdown
  get selectedCategories(): Category[] {
    return this.categories.filter(category => this.filters.selectedCategoryIds.includes(category.id));
  }

  isCategorySelected(categoryId: number): boolean {
    return this.filters.selectedCategoryIds.includes(categoryId);
  }

  toggleCategory(categoryId: number) {
    this.filters.selectedCategoryIds = this.isCategorySelected(categoryId)
      ? this.filters.selectedCategoryIds.filter(id => id !== categoryId)
      : [...this.filters.selectedCategoryIds, categoryId];
  }

  clearCategories() {
    this.filters.selectedCategoryIds = [];
  }

  // OR logic: the pattern matches if it has at least one of the selected categories
  private matchesCategories(pattern: Pattern): boolean {
    if (this.filters.selectedCategoryIds.length === 0) return true;
    return pattern.categoryIds.some(id => this.filters.selectedCategoryIds.includes(id));
  }

  // case-insensitive match on the pattern name or brand (brand is optional)
  private matchesSearch(pattern: Pattern): boolean {
    const search = this.filters.patternSearch.trim().toLowerCase();
    if (!search) return true;
    return pattern.name.toLowerCase().includes(search)
      || (pattern.brand ?? '').toLowerCase().includes(search);
  }

  // patterns displayed in the list: must match the search AND the category selection
  get filteredPatterns(): Pattern[] {
    return this.patternList.filter(pattern => this.matchesSearch(pattern) && this.matchesCategories(pattern));
  }

  clearSearch() {
    this.filters.patternSearch = '';
  }

  getCategoryNames(categoryIds: number[]): string {
    return categoryNames(categoryIds, this.categories);
  }

  togglePreviewSource() {
    this.filters.previewSource = this.filters.previewSource === 'photo' ? 'techDrawing' : 'photo';
  }

  getPreviewImage(pattern: Pattern): string {
    const preferredImages = this.filters.previewSource === 'photo' ? pattern.photos : pattern.techDrawings;
    const fallbackImages = this.filters.previewSource === 'photo' ? pattern.techDrawings : pattern.photos;
    return preferredImages?.[0] || fallbackImages?.[0] || '';
  }
}
