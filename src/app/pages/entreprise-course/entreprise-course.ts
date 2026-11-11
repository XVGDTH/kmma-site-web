import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, CommonModule } from '@angular/common';

import {
  CoursesApiService,
  ApiCourseSummary,
} from '../../shared/courses-api.service';
import { toAbsoluteUrl } from '../../shared/formateur-content.service';

@Component({
  selector: 'app-entreprise-course',
  standalone: true,
  imports: [RouterLink, DecimalPipe, CommonModule],
  templateUrl: './entreprise-course.html',
  styleUrl: './entreprise-course.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntrepriseCourse implements OnInit {

  private readonly coursesApi = inject(CoursesApiService);

  // ============================================================
  // ÉTAT
  // ============================================================
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly courses = signal<ApiCourseSummary[]>([]);
    // ✅ Expose la fonction pour le HTML
  readonly assetUrl = toAbsoluteUrl;

  readonly activeSubject = signal<string>('tous');
  private readonly PAGE_SIZE = 8;
  readonly visibleCount = signal<number>(this.PAGE_SIZE);

  readonly subjects: string[] = [
    'Commissariat aux comptes',
    'Actuariat',
    'Audit & Contrôle',
    'Expertise comptable',
    'Conseil & Stratégie',
    'Finance d\'entreprise',
    'Fiscalité & Droit',
    'Data & Tech',
    'Management & Leadership',
    'Cybersécurité',
  ];

  // ============================================================
  // COMPUTED
  // ============================================================
  readonly filteredCourses = computed(() => {
    const subject = this.activeSubject();
    if (subject === 'tous') return this.courses();
    return this.courses().filter(
      (c) => c.subject?.toLowerCase() === subject.toLowerCase()
    );
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

    // ✅ Filtrer UNIQUEMENT les formations entreprises
    this.coursesApi.getCourses({ type: 'enterprise' }).subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement formations entreprises :', err);
        this.errorMessage.set('Impossible de charger les formations.');
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