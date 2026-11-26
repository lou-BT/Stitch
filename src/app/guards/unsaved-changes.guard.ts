import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

// Asks for confirmation before leaving a page with unsaved changes (cancel, back link, sidebar...).
// Works with any routed component that has a hasUnsavedChanges() method (add and edit pattern pages).
export const unsavedChangesGuard: CanDeactivateFn<{ hasUnsavedChanges(): boolean }> = (component) => {
  if (!component.hasUnsavedChanges()) return true;

  return inject(ConfirmDialogService).confirm(
    'Discard your changes?',
    'You have unsaved changes on this pattern. If you leave this page, they will be lost.',
    'Discard changes',
    true
  );
};
