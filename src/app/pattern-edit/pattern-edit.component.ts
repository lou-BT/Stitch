import { Component, Input, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { Pattern } from '../classes';
import { DataService } from '../services/data.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as icons from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-pattern-edit',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, FontAwesomeModule],
  templateUrl: './pattern-edit.component.html',
  styleUrl: './pattern-edit.component.scss'
})
export class PatternEditComponent implements OnInit{
  @Input() oldPattern! : Pattern;
  newPattern! : Pattern;
  fileIcon = icons.faFile;

  photosList! : [string, boolean][];
  techDrawingsList! : [string, boolean][];
  filesList! : [string, boolean][];

  constructor(private data: DataService) {}

  ngOnInit() {
    this.photosList = this.oldPattern.photos.map( (path : string) => {return [ path, true]} );
    this.techDrawingsList = this.oldPattern.techDrawings.map( (path : string) => {return [ path, true]} );
    this.filesList = this.oldPattern.files.map( (path : string) => {return [ path, true]} );

    this.newPattern  = this.oldPattern as Pattern;
  }

  submitForm() {}

  deletePattern() {
    this.data.deletePattern(this.oldPattern);
  }

}
