import { Component } from '@angular/core';
import { NgForm, FormsModule, FormControl } from '@angular/forms';
import { Pattern, Category } from '../classes';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-add-pattern',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './add-pattern.component.html',
  styleUrl: './add-pattern.component.scss'
})
export class AddPatternComponent {
  
  categoryKeys = Object.values(Category);
  patternName: string = '';
  files: File[] = [];
  //pattern: Pattern;

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer!.files;
    this.files = this.files.concat(Array.from(files));
    console.log("new file", this.files[0].webkitRelativePath);
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  submitForm(): void {
    // Validate form data
    if (!this.patternName || this.files.length === 0) {
      console.error('Pattern name and files are required.');
      return;
    }

    var pattern = new Pattern(this.patternName, this.files);

    //create pattern folder
    window.ipcRenderer.send('add-pattern', pattern);
    console.log('Files uploaded successfully.');
  }

}
