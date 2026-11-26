import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../classes';
import { DataService } from '../services/data.service';

// local view-model: adds inline edit state on top of the Category shared type
interface EditableCategory extends Category {
    editing?: boolean;
    draftName?: string;
    error?: string;
}

@Component({
    selector: 'app-settings',
    imports: [FormsModule, NgClass],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
    private data = inject(DataService);
    private cdr = inject(ChangeDetectorRef);

    categories: EditableCategory[] = [];

    newCategoryName = '';
    newCategoryError = '';
    addingCategory = false;

    ngOnInit(): void {
        this.loadCategories();
    }

    private loadCategories(): void {
        this.data.getCategories().then(categories => {
            this.categories = categories
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(category => ({ ...category }));
            this.cdr.detectChanges();
        });
    }

    isElse(category: Category): boolean {
        return category.name === 'Else';
    }

    private isDuplicateName(name: string, excludeId?: number): boolean {
        const normalized = name.toLowerCase();
        return this.categories.some(category => category.id !== excludeId && category.name.toLowerCase() === normalized);
    }

    // Electron forwards thrown main-process errors as
    // "Error invoking remote method '...': Error: <message>"; extract the original message.
    private extractErrorMessage(error: unknown, fallback: string): string {
        if (error instanceof Error && error.message) {
            const parts = error.message.split('Error: ');
            return parts[parts.length - 1].trim() || fallback;
        }
        return fallback;
    }

    async addCategory(): Promise<void> {
        const trimmedName = this.newCategoryName.trim();
        this.newCategoryError = '';

        if (!trimmedName) {
            this.newCategoryError = 'Category name cannot be empty.';
            return;
        }
        if (this.isDuplicateName(trimmedName)) {
            this.newCategoryError = `A category named "${trimmedName}" already exists.`;
            return;
        }

        this.addingCategory = true;
        try {
            await this.data.addCategory(trimmedName);
            this.newCategoryName = '';
            this.loadCategories();
        } catch (error) {
            this.newCategoryError = this.extractErrorMessage(error, 'Failed to add category.');
        } finally {
            this.addingCategory = false;
            this.cdr.detectChanges();
        }
    }

    startEdit(category: EditableCategory): void {
        this.categories.forEach(c => {
            c.editing = false;
            c.error = undefined;
        });
        category.editing = true;
        category.draftName = category.name;
    }

    cancelEdit(category: EditableCategory): void {
        category.editing = false;
        category.error = undefined;
        category.draftName = category.name;
    }

    async saveEdit(category: EditableCategory): Promise<void> {
        const trimmedName = (category.draftName ?? '').trim();
        category.error = undefined;

        if (!trimmedName) {
            category.error = 'Category name cannot be empty.';
            return;
        }
        if (trimmedName.toLowerCase() === category.name.toLowerCase()) {
            category.editing = false;
            return;
        }
        if (this.isDuplicateName(trimmedName, category.id)) {
            category.error = `A category named "${trimmedName}" already exists.`;
            return;
        }

        try {
            await this.data.updateCategory(category.id, trimmedName);
            category.editing = false;
            this.loadCategories();
        } catch (error) {
            category.error = this.extractErrorMessage(error, 'Failed to update category.');
            this.cdr.detectChanges();
        }
    }

    async deleteCategory(category: EditableCategory): Promise<void> {
        const confirmed = window.confirm(`Delete category "${category.name}"? Patterns using it will be moved to "Else".`);
        if (!confirmed) return;

        category.error = undefined;
        try {
            await this.data.deleteCategory(category.id);
            this.loadCategories();
        } catch (error) {
            category.error = this.extractErrorMessage(error, 'Failed to delete category.');
            this.cdr.detectChanges();
        }
    }
}
