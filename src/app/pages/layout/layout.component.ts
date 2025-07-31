import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { MaterialModule } from '../material/material.module';



@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [MaterialModule, RouterLink, RouterOutlet, RouterLinkActive, NgIf],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {


  logout(){

  }
}
