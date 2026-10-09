import { Component } from '@angular/core';
import { OPTIMIZED_IMAGE } from '../../shared/images/explicit-sizes.directive';

@Component({
  selector: 'app-biography',
  imports: [OPTIMIZED_IMAGE],
  templateUrl: './biography.component.html',
  styleUrl: './biography.component.css'
})
export class BiographyComponent {

}
