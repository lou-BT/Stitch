export {};
import type { Pattern, NewPattern, Category, SharedFile } from './models';

declare global {
  interface Window {
    electronAPI: {
      loadPatterns: () => Promise<Pattern[]>;
      getPatternDetails: (patternId: string) => Promise<Pattern | null>;
      addPattern: (pattern: NewPattern) => Promise<number | null>;
      deletePattern: (pattern: Pattern) => void;
      editPattern: (oldPattern: Pattern, newPattern: NewPattern) => Promise<void>;
      //COMMENTS
      addComment: (patternId: number, text: string) => Promise<Pattern | null>;
      editComment: (patternID: number, commentId: number, text: string) => Promise<Pattern | null>;
      deleteComment: (patternID: number, commentId: number) => Promise<Pattern | null>;
      //CATEGORIES
      getCategories: () => Promise<Category[]>;
      getCategoryById: (categoryId: number) => Promise<Category | null>;
      addCategory: (name: string) => Promise<Category>;
      updateCategory: (categoryId: number, name: string) => Promise<Category>;
      deleteCategory: (categoryId: number) => Promise<void>;

      getSharedFiles: () => Promise<SharedFile[]>;

      onPatternsUpdate: (callback: (event: Electron.IpcRendererEvent, patterns: Pattern[]) => void) => () => void;
      //FILES
      getFilePath: (file: File) => string;
      openFile: (filePath: string) => void;
    },
  }
}