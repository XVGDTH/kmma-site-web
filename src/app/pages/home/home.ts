import { Component } from '@angular/core';
import { Hero } from './sections/hero/hero';
import { Programs } from './sections/programs/programs';
import { Accompaniment } from './sections/accompaniment/accompaniment';
import { Philosophy } from './sections/philosophy/philosophy';
import { WhyUs } from './sections/why-us/why-us';
import { About } from './sections/about/about';  
import { MyAcademie } from './sections/my-academy/my-academie';
import { Method } from './sections/method/method';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, About, Accompaniment, Method, MyAcademie, Philosophy, WhyUs],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
