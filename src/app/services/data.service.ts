import { Injectable, OnInit } from '@angular/core';
import { Category, Pattern, NewPattern, PatternEdit, SharedFile } from '../classes';
import { BehaviorSubject, Subject } from 'rxjs';

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

    window.ipcRenderer.on('patterns:update', (event: any, data: Pattern[]) => {
      this._patternList.next(data);
    })
   }


  async loadPatterns(): Promise<Pattern[]> {
    try {
      const patterns = await window.ipcRenderer.invoke('patterns:getAll') as Pattern[];
      return patterns;
    } catch (error) {
      console.error('Error loading file:', error);
      return [];
    }
  }

  async getPatternDetails(patternId: string): Promise<Pattern | null> {
    try {
      const patternDetails = await window.ipcRenderer.invoke('patterns:getDetails', patternId) as Pattern | null;
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
    window.ipcRenderer.send('patterns:addNew', pattern);
  }

  openFile( file: string ) {
    window.ipcRenderer.send('patterns:openFile', file);
  }

  deletePattern( pattern: Pattern ) {
    window.ipcRenderer.send('patterns:delete', pattern);
  }

  async editPattern( newPattern: Pattern, patternEdit: PatternEdit): Promise<void> {
    await window.ipcRenderer.invoke('patterns:edit', newPattern, patternEdit);
  }

  //////////////////////////////////////////////////////////////////////////////////////////
  // COMMENTS
  async addComment(patternId: number, text: string): Promise<Pattern | null> {
    try {
      return await window.ipcRenderer.invoke('comments:add', patternId, text) as Pattern | null;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  async editComment(patternId: number, commentId: number, text: string): Promise<Pattern | null> {
    try {
      return await window.ipcRenderer.invoke('comments:edit', patternId, commentId, text) as Pattern | null;
    } catch (error) {
      console.error('Error editing comment:', error);
      return null;
    }
  }

  async deleteComment(patternId: number, commentId: number): Promise<Pattern | null> {
    try {
      return await window.ipcRenderer.invoke('comments:delete', patternId, commentId) as Pattern | null;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return null;
    }
  }

    //////////////////////////////////////////////////////////////////////////////////////////
  // SHARED FILES
  async getAllSharedFiles(): Promise<SharedFile[]> {
    try {
      const sharedFiles = await window.ipcRenderer.invoke('sharedFiles:getAll') as SharedFile[];
      return sharedFiles;
    } catch (error) {
      console.error('Error getting all shared files:', error);
      return [];
    }
  }

  
}
