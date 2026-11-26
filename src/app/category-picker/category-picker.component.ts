import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../classes';

let nextPickerId = 0;

// Category selection used by the add and edit pattern forms:
// a dropdown with a search field and checkboxes, the selection shown as removable chips.
// Usage: <app-category-picker [categories]="categories" [(selectedIds)]="pattern.categoryIds">
@Component({
  selector: 'app-category-picker',
  imports: [FormsModule],
  templateUrl: './category-picker.component.html',
  styleUrl: './category-picker.component.scss'
})
export class CategoryPickerComponent {
  @Input() categories: Category[] = [];
  @Input() selectedIds: number[] = [];
  @Output() selectedIdsChange = new EventEmitter<number[]>();
  @Input() max = 5;

  search = '';

  // unique ids for the checkboxes and the hint (in case several pickers are on the same page)
  readonly idPrefix = `categoryPicker${nextPickerId++}-`;

  // categories shown in the dropdown, narrowed by the search text
  get filteredCategories(): Category[] {
    const search = this.search.trim().toLowerCase();
    if (!search) return this.categories;
    return this.categories.filter(category => category.name.toLowerCase().includes(search));
  }

  // selected categories, shown as chips
  get selectedCategories(): Category[] {
    return this.categories.filter(category => this.selectedIds.includes(category.id));
  }

  isSelected(categoryId: number): boolean {
    return this.selectedIds.includes(categoryId);
  }

  // the last selected category can't be removed (at least one is required),
  // and nothing can be added once the maximum is reached
  isDisabled(categoryId: number): boolean {
    return this.isSelected(categoryId)
      ? this.selectedIds.length <= 1
      : this.selectedIds.length >= this.max;
  }

  toggle(categoryId: number): void {
    if (this.isDisabled(categoryId)) return;
    this.selectedIds = this.isSelected(categoryId)
      ? this.selectedIds.filter(id => id !== categoryId)
      : [...this.selectedIds, categoryId];
    this.selectedIdsChange.emit(this.selectedIds);
  }
}
