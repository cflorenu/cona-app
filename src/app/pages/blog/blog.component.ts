import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {
  noticias = [
    {
      titulo: '¿Cuál es el futuro de Sebastián "Camelo" Escurra?',
      descripcion: 'Algunas personas nacen con talento. Otras con disciplina...',
      imagen: '../assets/boxeo.jpg'
    },
    {
      titulo: 'De la práctica al triunfo: cómo la dedicación forja campeones',
      descripcion: 'Escribir sobre nuestros luchadores es una tarea que...',
      imagen: '../assets/lucha.jpg'
    },
    {
      titulo: 'Con Solo 15 Años, Aziel Muestra Carácter y Habilidad en el Tatami',
      descripcion: 'En el emocionante mundo de las artes marciales...',
      imagen: '../assets/jiu-jitsu.jpg'
    },
    {
      titulo: 'Fight Academy: Forjando Atletas con Futuro Más Allá del Deporte',
      descripcion: 'Siempre buscamos formar atletas completos...',
      imagen: '../assets/sambo.jpg'
    },
    {
      titulo: '¿Amor por las Artes Marciales o Ruina Financiera?',
      descripcion: 'Diciembre puede ser un mes desafiante para las academias...',
      imagen: '../assets/muay-thai.jpg'
    },
    {
      titulo: 'Esfuerzo y Dedicación: La Historia Detrás de Cada Round',
      descripcion: 'Vivimos un fin de semana lleno de pasión y emociones...',
      imagen: '../assets/luchadores.jpg'
    }
  ];
}
