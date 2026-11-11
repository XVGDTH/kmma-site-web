// import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink, ActivatedRoute } from '@angular/router';
// import { CoursesApiService, ApiCourseSummary } from '../../shared/courses-api.service';

// type FormatFilter = 'tous' | 'en_ligne' | 'presentiel';
// type TypeFilter = 'tous' | 'cours' | 'abonnement';

// @Component({
//   selector: 'app-catalogue-cours',
//   standalone: true,
//   imports: [CommonModule, RouterLink],
//   templateUrl: './catalogue.component.html',
//   styleUrl: './catalogue.component.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class CatalogueCoursComponent implements OnInit {
//   private readonly coursesApi = inject(CoursesApiService);
//   private readonly route = inject(ActivatedRoute);

//   readonly allCourses = signal<ApiCourseSummary[]>([]);
//   readonly isLoading = signal(true);
//   readonly errorMessage = signal<string | null>(null);

//   readonly formatFilter = signal<FormatFilter>('tous');
//   readonly typeFilter = signal<TypeFilter>('tous');
//   readonly subjectFilter = signal<string>('tous');

//   // ✅ 1. Les cours qui correspondent EXACTEMENT aux filtres
//   readonly matchingCourses = computed(() => {
//     let list = this.allCourses();
//     const type = this.typeFilter();
//     const format = this.formatFilter();
//     const subject = this.subjectFilter();

//     if (type === 'cours') list = list.filter(c => c.type === 'individual');
//     else if (type === 'abonnement') list = list.filter(c => c.type === 'enterprise');

//     if (format === 'presentiel') list = list.filter(c => c.deliveryMode === 'presentiel' || c.deliveryMode === 'mixte');
//     else if (format === 'en_ligne') list = list.filter(c => c.deliveryMode === 'en_ligne' || c.deliveryMode === 'mixte');

//     if (subject !== 'tous') {
//       list = list.filter(c => c.subject?.toLowerCase() === subject.toLowerCase());
//     }

//     return list;
//   });

//   // ✅ 2. Les autres cours (qui ne matchent pas, pour la section "Vous pourriez aimer")
//   readonly suggestedCourses = computed(() => {
//     const matchingIds = this.matchingCourses().map(c => c.id);
//     return this.allCourses().filter(c => !matchingIds.includes(c.id));
//   });

//   ngOnInit(): void {
//     this.route.queryParams.subscribe(params => {
//       if (params['format']) this.formatFilter.set(params['format'] as FormatFilter);
//       if (params['type']) this.typeFilter.set(params['type'] as TypeFilter);
//       if (params['subject']) this.subjectFilter.set(params['subject']);
//     });

//     this.loadCourses();
//   }

//   private loadCourses(): void {
//     this.isLoading.set(true);
//     this.coursesApi.getCourses().subscribe({
//       next: (courses) => {
//         this.allCourses.set(courses);
//         this.isLoading.set(false);
//       },
//       error: () => {
//         this.errorMessage.set('Impossible de charger les cours.');
//         this.isLoading.set(false);
//       }
//     });
//   }


//     // ============================================================
//   // ✅ Résout les URLs des médias (images, vidéos, PDF)
//   // ============================================================
//   resolveMediaUrl(url: string | null | undefined): string | null {
//     if (!url) return null;
//     const value = url.trim();
//     if (!value) return null;

//     // URL absolue
//     if (value.startsWith('http://') || value.startsWith('https://')) {
//       return value;
//     }

//     // /storage/... → ajouter le domaine Laravel
//     if (value.startsWith('/storage/')) {
//       return `http://127.0.0.1:8000${value}`;
//     }

//     // storage/... → ajouter /storage/
//     if (value.startsWith('storage/')) {
//       return `http://127.0.0.1:8000/${value}`;
//     }

//     // Chemin relatif (ex: courses/xxx.webp)
//     const path = value.replace(/^\/+/, '');
//     return `http://127.0.0.1:8000/storage/${path}`;
//   }
// }


import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CoursesApiService, ApiCourseSummary } from '../../shared/courses-api.service';

type FormatFilter = 'tous' | 'en_ligne' | 'presentiel';
type TypeFilter = 'tous' | 'cours' | 'abonnement';

@Component({
  selector: 'app-catalogue-cours',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueCoursComponent implements OnInit {
  private readonly coursesApi = inject(CoursesApiService);
  private readonly route = inject(ActivatedRoute);

  readonly allCourses = signal<ApiCourseSummary[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly formatFilter = signal<FormatFilter>('tous');
  readonly typeFilter = signal<TypeFilter>('tous');
  readonly subjectFilter = signal<string>('tous');

  // ✅ Computed qui dépend de TOUS les filtres
  readonly matchingCourses = computed(() => {
    let list = this.allCourses();
    const type = this.typeFilter();
    const format = this.formatFilter();
    const subject = this.subjectFilter();

    if (type === 'cours') list = list.filter(c => c.type === 'individual');
    else if (type === 'abonnement') list = list.filter(c => c.type === 'enterprise');

    if (format === 'presentiel') list = list.filter(c => c.deliveryMode === 'presentiel' || c.deliveryMode === 'mixte');
    else if (format === 'en_ligne') list = list.filter(c => c.deliveryMode === 'en_ligne' || c.deliveryMode === 'mixte');

    if (subject !== 'tous') {
      list = list.filter(c => c.subject?.toLowerCase() === subject.toLowerCase());
    }

    return list;
  });

  // ✅ Suggestions : cours qui ne matchent pas
  readonly suggestedCourses = computed(() => {
    const matchingIds = this.matchingCourses().map(c => c.id);
    return this.allCourses().filter(c => !matchingIds.includes(c.id)).slice(0, 3);
  });

  ngOnInit(): void {
    // ✅ On écoute les changements de queryParams
    this.route.queryParams.subscribe(params => {
      if (params['format']) this.formatFilter.set(params['format'] as FormatFilter);
      else this.formatFilter.set('tous');

      if (params['type']) this.typeFilter.set(params['type'] as TypeFilter);
      else this.typeFilter.set('tous');

      if (params['subject']) this.subjectFilter.set(params['subject']);
      else this.subjectFilter.set('tous');
    });

    this.loadCourses();
  }

  private loadCourses(): void {
    this.isLoading.set(true);
    this.coursesApi.getCourses().subscribe({
      next: (courses) => {
        this.allCourses.set(courses);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les cours.');
        this.isLoading.set(false);
      }
    });
  }

  // ✅ Ajouter cette méthode pour les filtres
  setSubject(subject: string): void {
    this.subjectFilter.set(subject);
  }

  // ✅ Résout les URLs des médias
  resolveMediaUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const value = url.trim();
    if (!value) return null;

    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    if (value.startsWith('/storage/')) return `http://127.0.0.1:8000${value}`;
    if (value.startsWith('storage/')) return `http://127.0.0.1:8000/${value}`;

    const path = value.replace(/^\/+/, '');
    return `http://127.0.0.1:8000/storage/${path}`;
  }
}