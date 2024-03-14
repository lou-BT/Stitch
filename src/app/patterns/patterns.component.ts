import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-patterns',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patterns.component.html',
  styleUrl: './patterns.component.scss'
})
export class PatternsComponent implements OnInit{
  patterns: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // this.loadPatterns();
  }


  // loadPatterns(): void {
  //   this.dataService.getAllPatterns()
  //     .then((patterns) => {
  //       this.patterns = patterns;
  //     })
  //     .catch((error) => {
  //       console.error('Error loading patterns:', error);
  //     });
  // }
}
