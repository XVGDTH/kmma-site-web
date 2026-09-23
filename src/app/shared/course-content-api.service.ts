import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { API_URL, extractApiError } from './formateur-content.service';

// ============================================================
// TYPES — Côté apprenant (structure HEC)
// ============================================================

export type SequenceType =
  | 'video' | 'document' | 'tp' | 'td' | 'cas_pratique' | 'quiz';

export interface QuizQuestion {
  question: string;
  type: 'qcm' | 'texte';
  options: string[];
  correctIndex: number;
  expectedAnswer?: string;
}

export interface LearnerSequenceDto {
  id: string;
  title: string;
  type: SequenceType;
  duration: string | null;
  videoUrl: string | null;
  documentUrl: string | null;
  instructions: string | null;
  quizQuestions: QuizQuestion[] | null;
  passingScore: number | null;
  isBlocking: boolean;
  isFinal: boolean;
  deadline: string | null;
  allowFileUpload: boolean;
  position: number;
}

export interface LearnerChapterDto {
  id: string;
  title: string;
  weekNumber: number | null;
  position: number;
  sequences: LearnerSequenceDto[];
}

export interface LearnerModuleDto {
  id: number;
  title: string;
  description: string | null;
  position: number;
  chapters: LearnerChapterDto[];
  moduleQuiz: LearnerSequenceDto | null;
}

export interface CourseDetailDto {
  id: string;
  courseId: number;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  subject: string | null;
  level: string | null;
  image: string | null;
  imageAlt: string | null;
  instructor: string;
  instructorRole: string;
  durationFull: string | null;
  durationAlternance: string | null;
  modules: LearnerModuleDto[];
  chapters: LearnerChapterDto[];
  finalExam: LearnerSequenceDto | null;
}

// ============================================================
// SERVICE
// ============================================================

@Injectable({ providedIn: 'root' })
export class CourseContentApiService {

  private readonly http = inject(HttpClient);

  readonly course  = signal<CourseDetailDto | null>(null);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  loadCourse(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<{ data: CourseDetailDto }>(`${API_URL}/courses/${slug}`)
      .subscribe({
        next: (res) => {
          this.course.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.course.set(null);
          this.loading.set(false);
          this.error.set(extractApiError(err));
        },
      });
  }
}