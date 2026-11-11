import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe, CommonModule } from '@angular/common';

import {
  CoursesApiService,
  ApiCourseSummary,
} from '../../shared/courses-api.service';
import { toAbsoluteUrl } from '../../shared/formateur-content.service';

interface NewsArticle {
  title: string;
  category: string;
  date: string;
  image: string;
  imageAlt: string;
}

@Component({
  selector: 'app-sujet',
  standalone: true,
  imports: [RouterLink, UpperCasePipe, CommonModule],
  templateUrl: './sujet.html',
  styleUrl: './sujet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sujet implements OnInit {

  private readonly coursesApi = inject(CoursesApiService);

  // ============================================================
  // ÉTAT
  // ============================================================
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly courses = signal<ApiCourseSummary[]>([]);
  readonly assetUrl = toAbsoluteUrl;

  // Filtres
  readonly activeSubject = signal<string>('tous');
  private readonly PAGE_SIZE = 8;
  readonly visibleCount = signal<number>(this.PAGE_SIZE);

  readonly subjects: string[] = [
    'Audit & Contrôle', 'Expertise Comptable', 'Fiscalité & Droit',
    'Finance & Banque', 'Conseil & Stratégie', 'Data & Tech',
    'Management & RH', 'Entrepreneuriat', 'Santé & Administration',
    'Langues & Soft Skills',
  ];

  // ============================================================
  // ✅ NOUVELLES SECTIONS DYNAMIQUES (remplacent les statiques)
  // ============================================================
  
  // Filtre les cours pour les Parcours Experts
  readonly expertTracks = computed(() => 
    this.courses().filter(c => c.category === 'Parcours Expert')
  );

  // Filtre les cours pour les Micro-accréditations
  readonly microCredentials = computed(() => 
    this.courses().filter(c => c.category === 'Micro-accréditation')
  );

  // Filtre les cours "normaux" pour la grille principale (on exclut les parcours et micro)
  readonly regularCourses = computed(() => 
    this.courses().filter(c => 
      c.category !== 'Parcours Expert' && c.category !== 'Micro-accréditation'
    )
  );

  // ============================================================
  // ARTICLES STATIQUES (On les garde car ce ne sont pas des cours)
  // ============================================================
  readonly newsArticles: NewsArticle[] = [
    { title: 'Un guide étape par étape pour rédiger un business plan', category: 'Entrepreneuriat', date: '12 Oct 2026', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=60', imageAlt: 'Business Plan' },
    { title: 'Introduction à l\'audit interne : tout ce qu\'il faut savoir', category: 'Audit', date: '08 Oct 2026', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=60', imageAlt: 'Audit Interne' },
    { title: 'Comment créer une stratégie marketing efficace en 2027', category: 'Marketing', date: '01 Oct 2026', image: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=800&q=60', imageAlt: 'Stratégie Marketing' },
    { title: 'Compétences relationnelles : lesquelles développer ?', category: 'Soft Skills', date: '28 Sep 2026', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=60', imageAlt: 'Soft Skills' },
  ];

  readonly latestNews: NewsArticle[] = [
    { title: 'Les 5 tendances fiscales à surveiller au Burkina Faso en 2027', category: 'Fiscalité', date: '15 Oct 2026', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60', imageAlt: 'Tendances fiscales' },
    { title: 'Comment l\'IA transforme le métier d\'auditeur interne', category: 'Technologie', date: '10 Oct 2026', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=60', imageAlt: 'IA et audit' },
    { title: 'OHADA : ce qui change pour les entreprises en 2027', category: 'Droit des affaires', date: '05 Oct 2026', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=60', imageAlt: 'Réforme OHADA' },
    { title: 'Leadership au féminin : briser le plafond de verre en Afrique', category: 'Management', date: '30 Sep 2026', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=60', imageAlt: 'Leadership féminin' },
    { title: 'Cybersécurité : 7 erreurs fatales que commettent les PME', category: 'Sécurité', date: '25 Sep 2026', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=60', imageAlt: 'Cybersécurité PME' },
  ];

  // ============================================================
  // COMPUTED POUR LA GRILLE PRINCIPALE
  // ============================================================
  readonly filteredCourses = computed(() => {
    const subject = this.activeSubject();
    const list = this.regularCourses(); // On utilise uniquement les cours normaux

    if (subject === 'tous') return list;
    return list.filter(c => c.subject?.toLowerCase() === subject.toLowerCase());
  });

  readonly totalFiltered = computed(() => this.filteredCourses().length);

  readonly visibleCourses = computed(() =>
    this.filteredCourses().slice(0, this.visibleCount())
  );

  readonly hasMore = computed(
    () => this.visibleCount() < this.totalFiltered()
  );

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit(): void {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.coursesApi.getCourses({ type: 'individual' } as any).subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement cours :', err);
        this.errorMessage.set('Impossible de charger les cours.');
        this.isLoading.set(false);
      },
    });
  }

  // ============================================================
  // ACTIONS
  // ============================================================
  setSubject(subject: string): void {
    this.activeSubject.set(subject);
    this.visibleCount.set(this.PAGE_SIZE);
  }

  showMore(): void {
    this.visibleCount.update((c) => c + this.PAGE_SIZE);
  }
}