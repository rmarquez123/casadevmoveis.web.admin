// app.component.ts

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { CommonModule } from '@angular/common'; // Import CommonModule for ngClass

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule, CommonModule], // Add RouterModule to the imports array
})
export class AppComponent {
 
}
