import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

// The app's single confirmation modal, placed once in app.component.html.
// Pages don't use it directly: they call ConfirmDialogService.confirm().
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent implements AfterViewInit {
  @ViewChild('modal') modal!: ElementRef<HTMLElement>;

  dialog = inject(ConfirmDialogService);

  // set when the confirm button is clicked, read once the modal has closed
  private confirmed = false;

  ngAfterViewInit(): void {
    const modalElement = this.modal.nativeElement;
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);

    this.dialog.registerModal(() => {
      this.confirmed = false;
      modalInstance.show();
    });

    // answer only once the modal has finished closing (cancel, Escape and backdrop click all count as "no"),
    // so a navigation triggered by the answer happens after the modal and its backdrop are gone
    modalElement.addEventListener('hidden.bs.modal', () => this.dialog.answer(this.confirmed));
  }

  confirm(): void {
    this.confirmed = true;
    bootstrap.Modal.getInstance(this.modal.nativeElement)?.hide();
  }
}
