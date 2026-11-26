import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

// Sets the window title from the route's `title` (app.config.ts), e.g. "Patterns – Stitch".
// Electron shows it in the window title bar and the taskbar; screen readers announce it on navigation.
// The details page replaces it with the pattern's name once loaded.
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    this.title.setTitle(pageTitle ? `${pageTitle} – Stitch` : 'Stitch');
  }
}
