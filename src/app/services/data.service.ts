import { Injectable, OnInit } from '@angular/core';
import { Category, Pattern, NewPattern, PatternEdit } from '../classes';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  //pattern list as a behavior subject
  private _patternList = new BehaviorSubject<any[]>([]);
  public patternList$ = this._patternList.asObservable();

  constructor() {
    this.loadPatterns().then( (data:any) => {
      this._patternList.next(data)
    })    

    window.ipcRenderer.on('patterns:update', (event:any,data:any) => {
      this._patternList.next(data);
    })
   }


  async loadPatterns() {
    try {
      const patterns = await window.ipcRenderer.invoke('patterns:getAll');
      return patterns;
    } catch (error) {
      console.error('Error loading file:', error);
      return [];
    }
  }

  getPatternNameList() {
    return this._patternList.value.map(pattern => pattern.name);
  }

  checkPatternNameValidity(patternName: string) {
    const invalidChars = /[<>:"/\\|?*]/;
    return !this._patternList.value.find((pattern => pattern.name === patternName)) && !invalidChars.test(patternName);
  }

  addPattern( pattern: Pattern ) {
    window.ipcRenderer.send('patterns:addNew', pattern);
  }

  openFile( file: string ) {
    window.ipcRenderer.send('patterns:openFile', file);
  }

  deletePattern( pattern: Pattern ) {
    window.ipcRenderer.send('patterns:delete', pattern);
  }

  editPattern( newPattern: Pattern, patternEdit: PatternEdit) {
    window.ipcRenderer.send('patterns:edit', newPattern, patternEdit);
  }
}
