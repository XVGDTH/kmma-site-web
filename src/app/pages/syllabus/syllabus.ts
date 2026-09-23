import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CoursesApiService } from '../../shared/courses-api.service';
import { LowerCasePipe } from '@angular/common';

interface ApiSequence {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'devoir' | 'tp' | 'td' | 'document';
  duration?: string | null;
  instructions?: string | null;
  quizQuestions?: unknown[] | null;
}

interface ApiChapter {
  id: string;
  title: string;
  sequences: ApiSequence[];
}

interface ApiCourse {
  id: string;
  subject: string;
  category: string;
  title: string;
  level: string;
  diploma?: string;
  durationFull: string;
  durationAlternance: string;
  image: string;
  imageAlt: string;
  isFree: boolean;
  hasCertificate: boolean;
  description?: string;
  instructor?: string;
  instructorRole?: string;
  chapters?: ApiChapter[];
}

@Component({
  selector: 'app-syllabus',
  standalone: true,
  imports: [RouterLink, LowerCasePipe],
  templateUrl: './syllabus.html',
  styleUrl: './syllabus.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Syllabus {
  private readonly route = inject(ActivatedRoute);
  private readonly coursesApi = inject(CoursesApiService);

  readonly courseId = this.route.snapshot.paramMap.get('slug') ?? '';

  readonly course = toSignal<ApiCourse | undefined>(
    this.coursesApi.getCourseDetail(this.courseId).pipe(
      catchError((err) => {
        console.error('Erreur chargement cours (syllabus) :', err);
        return of(undefined);
      }),
    ),
    { initialValue: undefined },
  );

  readonly chapters = computed(() => this.course()?.chapters ?? []);

  readonly openChapterId = signal<string | null>(null);

  toggleChapter(id: string): void {
    this.openChapterId.set(this.openChapterId() === id ? null : id);
  }

  readonly levelLabels: Record<string, string> = {
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé',
  };

  readonly typeLabels: Record<string, string> = {
    video: 'Vidéo',
    document: 'Document',
    quiz: 'Quiz',
    devoir: 'Devoir',
    tp: 'TP',
    td: 'TD',
  };

  readonly typeIcons: Record<string, string> = {
    video: 'M23 7l-7 5 7 5V7z M1 5h15v14H1z',
    document: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
    quiz: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4 M12 17h.01 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    devoir: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
    tp: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    td: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
  };

  readonly totalVideos = computed(() =>
    this.chapters().reduce((n, c) => n + c.sequences.filter((s) => s.type === 'video').length, 0),
  );

  readonly totalQuizzes = computed(() =>
    this.chapters().reduce((n, c) => n + c.sequences.filter((s) => s.type === 'quiz').length, 0),
  );

  readonly totalAssignments = computed(() =>
    this.chapters().reduce(
      (n, c) => n + c.sequences.filter((s) => ['devoir', 'tp', 'td'].includes(s.type)).length,
      0,
    ),
  );

  readonly totalSequences = computed(() =>
    this.chapters().reduce((n, c) => n + c.sequences.length, 0),
  );

  /**
   * Compétences visées : construites à partir des titres de chapitres
   * tant qu'aucun champ dédié n'existe côté backend.
   * TODO (Salomon) : remplacer par un vrai champ `learning_outcomes` (JSON)
   * éditable dans Filament, une fois ajouté au modèle Course.
   */
  readonly learningOutcomes = computed(() =>
    this.chapters().map((c) => c.title).filter(Boolean),
  );

  certificateLabel(course: ApiCourse): string {
    if (!course.hasCertificate) return 'Attestation de suivi';
    return course.diploma === 'attestation' ? 'Attestation délivrée' : 'Certificat délivré';
  }

  initials(name: string | undefined): string {
    if (!name) return 'K';
    return name.charAt(0).toUpperCase();
  }
}