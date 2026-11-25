import { Injectable, OnInit } from '@angular/core';
import { Category, Pattern, NewPattern, SharedFile } from '../classes';
import { BehaviorSubject, Subject } from 'rxjs';
import { ipcMain } from 'electron'; // keep this line for Electron IPC communication

@Injectable({
  providedIn: 'root'
})
export class DataService {
  //pattern list as a behavior subject
  private _patternList = new BehaviorSubject<Pattern[]>([]);
  public patternList$ = this._patternList.asObservable();

  constructor() {
    this.loadPatterns().then((data: Pattern[]) => {
      this._patternList.next(data)
    })    
    window.electronAPI.onPatternsUpdate((event: any, data: Pattern[]) => {
      this._patternList.next(data);
    })
   }

  async getCategories(): Promise<Category[]> {
    try {
      const categories = await window.electronAPI.getCategories() as Category[];
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async getCategoryById(id: number): Promise<Category | null> {
    try {
      const category = await window.electronAPI.getCategoryById(id) as Category | null;
      return category;
    } catch (error) {
      console.error('Error getting category by id:', error);
      return null;
    }
  }

  // Note: unlike the getters above, these intentionally let errors (e.g. duplicate
  // or protected "Else" category) propagate so callers can show the message to the user.
  async addCategory(name: string): Promise<Category> {
    return await window.electronAPI.addCategory(name) as Category;
  }

  async updateCategory(id: number, name: string): Promise<Category> {
    return await window.electronAPI.updateCategory(id, name) as Category;
  }

  async deleteCategory(id: number): Promise<void> {
    await window.electronAPI.deleteCategory(id);
  }

  async loadPatterns(): Promise<Pattern[]> {
    try {
      const patterns = await window.electronAPI.loadPatterns() as Pattern[];
      console.log('Loaded patterns:', patterns);
      return patterns;
    } catch (error) {
      console.error('Error loading file:', error);
      return [];
    }
  }

  async getPatternDetails(patternId: string): Promise<Pattern | null> {
    try {
      const patternDetails = await window.electronAPI.getPatternDetails(patternId) as Pattern | null;
      console.log('Received pattern details:', patternDetails);
      return patternDetails;
    } catch (error) {
      console.error('Error getting pattern details:', error);
      return null;
    }
  }

  getPatternNameList() {
    return this._patternList.value.map(pattern => pattern.name);
  }

  checkPatternNameValidity(patternName: string) {
    const invalidChars = /[<>:"/\\|?*]/;
    return !this._patternList.value.find((pattern => pattern.name === patternName)) && !invalidChars.test(patternName);
  }

  addPattern( pattern: NewPattern ) {
    window.electronAPI.addPattern(pattern);
  }

  openFile( file: string ) {
    window.electronAPI.openFile(file);
  }

  deletePattern( pattern: Pattern ) {
    window.electronAPI.deletePattern(pattern);
  }

  async editPattern( oldPattern: Pattern, newPattern: NewPattern): Promise<void> {
    await window.electronAPI.editPattern(oldPattern, newPattern);
  }

  //////////////////////////////////////////////////////////////////////////////////////////
  // COMMENTS
  async addComment(patternId: number, text: string): Promise<Pattern | null> {
    try {
      return await window.electronAPI.addComment(patternId, text) as Pattern | null;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  async editComment(patternId: number, commentId: number, text: string): Promise<Pattern | null> {
    try {
      return await window.electronAPI.editComment(patternId, commentId, text) as Pattern | null;
    } catch (error) {
      console.error('Error editing comment:', error);
      return null;
    }
  }

  async deleteComment(patternId: number, commentId: number): Promise<Pattern | null> {
    try {
      return await window.electronAPI.deleteComment(patternId, commentId) as Pattern | null;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return null;
    }
  }

    //////////////////////////////////////////////////////////////////////////////////////////
  // SHARED FILES
  async getAllSharedFiles(): Promise<SharedFile[]> {
    try {
      const sharedFiles = await window.electronAPI.getSharedFiles() as SharedFile[];
      console.log('Retrieved shared files:', sharedFiles);
      return sharedFiles;
    } catch (error) {
      console.error('Error getting all shared files:', error);
      return [];
    }
  }

  
}
