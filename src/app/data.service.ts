import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  // getAllPatterns(): Promise<any[]> {
  //   return new Promise((resolve, reject) => {
  //     ipcRenderer.once('patterns:getAll:response', (event, patterns) => {
  //       resolve(patterns);
  //     });
  //     ipcRenderer.send('patterns:getAll');
  //   });
  // }
}
