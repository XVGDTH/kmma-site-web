import { inject, Injectable, signal } from '@angular/core';
import {
  CourseWeek,
  ProgramLength,
  QuizQuestionDraft,
  SegmentDurationMinutes,
  StudentWeekProgress,
  UploadedVideoMeta,
  WeekAssignment,
} from '../data/Course builder.model ';
import { VideoStorageService } from './video-storage.service';

const WEEKS_STORAGE_KEY = 'kmma_course_weeks_v1';
const PROGRESS_STORAGE_KEY = 'kmma_student_progress_v1';

/**
 * "Base locale" en attendant le vrai backend.
 *
 * Stocke le programme construit par le formateur (semaines/jours, vidéos,
 * TD/TP, quiz) et la progression de l'apprenant dans le `localStorage` du
 * navigateur. Quand le backend existera, il suffira de remplacer les
 * méthodes `save*`/`load*` par de vrais appels HTTP — la forme des données
 * (les interfaces dans `course-builder.model.ts`) est pensée pour
 * correspondre à ce que des endpoints REST renverraient.
 *
 * LIMITES CONNUES (normal à ce stade du projet) :
 * - Les vidéos importées ne sont PAS uploadées quelque part : elles restent
 *   sous forme d'aperçu local (`URL.createObjectURL`), valable uniquement
 *   dans l'onglet du navigateur qui a fait l'import, et perdu au rechargement.
 * - Ces données sont propres à CE navigateur : un formateur qui importe un
 *   cours sur son ordinateur ne le rend pas visible sur celui d'un apprenant
 *   tant que le vrai backend ne centralise pas le stockage.
 */
@Injectable({ providedIn: 'root' })
export class CourseContentService {
  private readonly weeksSignal = signal<CourseWeek[]>(this.loadWeeks());
  private readonly progressSignal = signal<StudentWeekProgress[]>(this.loadProgress());

  //videos avec index db
  private readonly videoStorage = inject(VideoStorageService);

constructor() {
  void this.hydrateVideoUrls();
}

private async hydrateVideoUrls(): Promise<void> {
  const weeks = structuredClone(this.weeksSignal());
  let changed = false;

  for (const week of weeks) {
    for (const video of week.videos) {
      const url = await this.videoStorage.getVideoUrl(video.id);
      if (url) {
        video.videoObjectUrl = url;
        changed = true;
      }
    }
  }

  if (changed) {
    this.weeksSignal.set(weeks);
  }
}
  readonly weeks = this.weeksSignal.asReadonly();
  readonly progress = this.progressSignal.asReadonly();

  // ---------------------------------------------------------------------
  // Lecture
  // ---------------------------------------------------------------------

  weeksForCourse(courseId: string): CourseWeek[] {
    return this.weeksSignal()
      .filter((w) => w.courseId === courseId)
      .sort((a, b) => a.index - b.index);
  }

  progressFor(courseId: string, weekId: string): StudentWeekProgress {
    const found = this.progressSignal().find(
      (p) => p.courseId === courseId && p.weekId === weekId,
    );
    return (
      found ?? {
        courseId,
        weekId,
        videosWatched: [],
        assignmentsSubmitted: [],
        quizPassed: false,
      }
    );
  }

  /**
   * Une semaine est débloquée si c'est la première, ou si le quiz de la
   * semaine précédente a été validé (score >= seuil de réussite).
   */
  isWeekUnlocked(courseId: string, week: CourseWeek): boolean {
    const weeks = this.weeksForCourse(courseId);
    const position = weeks.findIndex((w) => w.id === week.id);
    if (position <= 0) return true;

    const previous = weeks[position - 1];
    if (!previous.quiz) return true; // pas de quiz = pas de verrou

    return this.progressFor(courseId, previous.id).quizPassed;
  }

  // ---------------------------------------------------------------------
  // Écriture — côté formateur
  // ---------------------------------------------------------------------

  publishWeek(input: {
    courseId: string;
    label: string;
    programLength: ProgramLength;
    videos: UploadedVideoMeta[];
    assignments: WeekAssignment[];
    quizQuestions: QuizQuestionDraft[];
    passingScore: number;
  }): CourseWeek {
    const existing = this.weeksForCourse(input.courseId);
    const nextIndex = existing.length + 1;

    const week: CourseWeek = {
      id: `week-${input.courseId}-${Date.now()}`,
      courseId: input.courseId,
      index: nextIndex,
      label: input.label,
      programLength: input.programLength,
      videos: input.videos,
      assignments: input.assignments,
      quiz:
        input.quizQuestions.length > 0
          ? {
              questions: input.quizQuestions,
              passingScore: input.passingScore,
              totalPoints: input.quizQuestions.length,
            }
          : undefined,
      publishedAt: new Date().toISOString(),
    };

    this.weeksSignal.update((all) => [...all, week]);
    this.persistWeeks();
    return week;
  }

  deleteWeek(weekId: string): void {
    this.weeksSignal.update((all) => all.filter((w) => w.id !== weekId));
    this.persistWeeks();
  }

  // ---------------------------------------------------------------------
  // Écriture — côté apprenant
  // ---------------------------------------------------------------------

  markVideoWatched(courseId: string, weekId: string, videoId: string): void {
    this.updateProgress(courseId, weekId, (p) => ({
      ...p,
      videosWatched: p.videosWatched.includes(videoId)
        ? p.videosWatched
        : [...p.videosWatched, videoId],
    }));
  }

  submitAssignment(courseId: string, weekId: string, assignmentTitle: string): void {
    // TODO (backend) : envoyer le vrai fichier déposé par l'apprenant vers le serveur.
    this.updateProgress(courseId, weekId, (p) => ({
      ...p,
      assignmentsSubmitted: p.assignmentsSubmitted.includes(assignmentTitle)
        ? p.assignmentsSubmitted
        : [...p.assignmentsSubmitted, assignmentTitle],
    }));
  }

  submitQuiz(courseId: string, week: CourseWeek, score: number): boolean {
    const passed = !!week.quiz && score >= week.quiz.passingScore;
    this.updateProgress(courseId, week.id, (p) => ({
      ...p,
      quizScore: score,
      quizPassed: passed,
    }));
    return passed;
  }

  // ---------------------------------------------------------------------
  // Persistance interne
  // ---------------------------------------------------------------------

  private updateProgress(
    courseId: string,
    weekId: string,
    updater: (current: StudentWeekProgress) => StudentWeekProgress,
  ): void {
    this.progressSignal.update((all) => {
      const index = all.findIndex((p) => p.courseId === courseId && p.weekId === weekId);
      const current = this.progressFor(courseId, weekId);
      const updated = updater(current);

      if (index === -1) return [...all, updated];

      const copy = [...all];
      copy[index] = updated;
      return copy;
    });
    this.persistProgress();
  }

  private loadWeeks(): CourseWeek[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(WEEKS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CourseWeek[]) : [];
    } catch {
      return [];
    }
  }

  private loadProgress(): StudentWeekProgress[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StudentWeekProgress[]) : [];
    } catch {
      return [];
    }
  }

  private persistWeeks(): void {
    if (typeof localStorage === 'undefined') return;
    // Note : les URLs vidéo (videoObjectUrl) sont sauvegardées telles quelles
    // mais deviennent invalides après un rechargement de page (voir doc en tête
    // de fichier) — c'est attendu tant que le vrai stockage vidéo n'existe pas.
    localStorage.setItem(WEEKS_STORAGE_KEY, JSON.stringify(this.weeksSignal()));
  }

  private persistProgress(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(this.progressSignal()));
  }
}

export { SEGMENT_DURATION_OPTIONS, PROGRAM_LENGTH_OPTIONS } from '../data/Course builder.model ';
export type { SegmentDurationMinutes };