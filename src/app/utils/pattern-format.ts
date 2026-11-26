import { Category } from '../classes';

// Small display helpers shared by the pattern pages (list, details, add, edit).
// Components wrap them in a method so templates can call them.

// "C:\...\pattern.pdf" -> "pattern.pdf" (handles \ and / separators)
export function fileName(path: string): string {
  return path.split(/[\\/]/).pop() || path;
}

// [2, 5] -> "Dresses, Summer" ("Unknown" for an id missing from the list)
export function categoryNames(categoryIds: number[], categories: Category[]): string {
  return categoryIds
    .map(id => categories.find(category => category.id === id)?.name || 'Unknown')
    .join(', ');
}
