import { Injectable } from '@angular/core';

// Filters of the pattern list, kept in a root service so they survive navigation
// (e.g. opening a pattern's details page and coming back to the list).
@Injectable({
  providedIn: 'root'
})
export class PatternFiltersService {
  patternSearch = '';
  selectedCategoryIds: number[] = [];
  previewSource: 'photo' | 'techDrawing' = 'photo';
}
