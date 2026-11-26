import { Injectable } from '@angular/core';

// Shows the app's confirmation modal (ConfirmDialogComponent, placed once in app.component.html)
// and returns the user's answer:
//   if (await confirmDialog.confirm('Delete?', 'This cannot be undone.', 'Delete', true)) { ... }
@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  // content displayed by ConfirmDialogComponent
  title = '';
  message = '';
  confirmLabel = 'Confirm';
  danger = false;

  private resolveAnswer?: (confirmed: boolean) => void;
  private showModal?: () => void;

  // called by ConfirmDialogComponent once its modal exists
  registerModal(showModal: () => void): void {
    this.showModal = showModal;
  }

  confirm(title: string, message: string, confirmLabel = 'Confirm', danger = false): Promise<boolean> {
    // a question still waiting for an answer is treated as cancelled
    this.answer(false);

    this.title = title;
    this.message = message;
    this.confirmLabel = confirmLabel;
    this.danger = danger;

    return new Promise<boolean>(resolve => {
      this.resolveAnswer = resolve;
      this.showModal?.();
    });
  }

  // called by ConfirmDialogComponent when the modal has finished closing
  answer(confirmed: boolean): void {
    this.resolveAnswer?.(confirmed);
    this.resolveAnswer = undefined;
  }
}
