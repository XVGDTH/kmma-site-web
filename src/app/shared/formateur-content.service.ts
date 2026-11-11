import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

// ============================================================
// CONFIGURATION
// ============================================================

export const API_URL     = 'http://127.0.0.1:8000/api';
export const LARAVEL_URL = 'http://127.0.0.1:8000';

// ============================================================
// TYPES
// ============================================================

export interface QuizQuestion {
  question: string;
  type: 'qcm' | 'texte';
  options: string[];
  correctIndex: number;
  expectedAnswer?: string;
}

export type SequenceType =
  | 'video'
  | 'document'
  | 'tp'
  | 'td'
  | 'cas_pratique'
  | 'quiz';

/**
 * ⚠ï¸ CONVENTION DE NOMMAGE
 * ─────────────────────────────────────────────
 * Base de données (Laravel)   →   Interface (Angular)
 * ─────────────────────────────────────────────
 * Module                      →   Module
 * Chapter                     →   Chapitre
 * Sequence                    →   Séquence
 * ─────────────────────────────────────────────
 * Structure : Cours → Module → Chapitre (Semaine N) → Séquence
 */

export interface SequenceDto {
  id: number;
  chapterId: number | null;
  moduleId: number | null;
  courseId: number | null;
  title: string;
  type: SequenceType;
  duration: string | null;
  videoUrl: string | null;
  documentUrl: string | null;
  quizQuestions: QuizQuestion[] | null;
  instructions: string | null;
  passingScore: number | null;
  isBlocking: boolean;
  isFinal: boolean;
  deadline: string | null;
  allowFileUpload: boolean;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChapterDto {
  id: number;
  courseId: number;
  moduleId: number | null;
  title: string;
  weekNumber: number | null;
  position: number;
  sequences: SequenceDto[];
}

export interface ModuleDto {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  position: number;
  chapters: ChapterDto[];
  moduleQuiz: SequenceDto | null;
}

// export interface CourseContentDto {
//   course: { id: number; slug: string; title: string };
//   modules: ModuleDto[];
//   chapters: ChapterDto[];
//   finalExam: SequenceDto | null;
// }
export interface CourseContentDto {
  course: {
    id: number;
    slug: string;
    title: string;
    // ✅ AJOUTER CES CHAMPS
    type?: 'individual' | 'enterprise';
    price?: number;
    enterpriseBasePrice?: number;
    deliveryMode?: 'en_ligne' | 'presentiel' | 'mixte';
    hoursPerWeek?: string;
  };
  modules: ModuleDto[];
  chapters: ChapterDto[];
  finalExam: SequenceDto | null;
}

export interface CreatedCourseDto {
  id: number;
  slug: string;
  title: string;
  [key: string]: unknown;
}

export interface CoursePayload {
  title: string;
  subject?: string;
  category?: string;
  level?: string;
  diploma?: string;
  durationFull?: string;
  durationAlternance?: string;
  description?: string;
  image?: File | null;
  type?: 'individual' | 'enterprise';
  price?: number;                  //  cours individuel
  enterpriseBasePrice?: number;    //  cours entreprise
  deliveryMode?: 'en_ligne' | 'presentiel' | 'mixte'; // 
  hoursPerWeek?: string;           // 
}

export interface SequencePayload {
  title: string;
  type: SequenceType;
  duration?: string | null;
  videoUrl?: string | null;
  videoFile?: File | null;
  documentUrl?: string | null;
  documentFile?: File | null;
  quizQuestions?: QuizQuestion[] | null;
  instructions?: string | null;
  passingScore?: number | null;
  isBlocking?: boolean;
  deadline?: string | null;
  allowFileUpload?: boolean;
}

// ============================================================
// HELPERS
// ============================================================

// export function toAbsoluteUrl(url: string | null | undefined): string | null {
//   if (!url) return null;
//   if (url.startsWith('http')) return url;
//   return `${LARAVEL_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }
export function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // ✅ Si c'est déjà une URL absolue
  if (url.startsWith('http')) return url;
  
  // ✅ Si le chemin commence par /storage/, on ajoute juste le domaine
  if (url.startsWith('/storage/')) {
    return `${LARAVEL_URL}${url}`;
  }
  
  // ✅ Sinon (ex: "avatars/xyz.jpg"), on ajoute /storage/
  return `${LARAVEL_URL}/storage/${url.replace(/^\/+/, '')}`;
}

export function extractApiError(err: any): string {
  const body = err?.error;

  if (body?.errors) {
    const messages = Object.values(body.errors).flat() as string[];
    if (messages.length > 0) return messages.join(' ');
  }

  return body?.message ?? err?.message ?? 'Une erreur est survenue.';
}

// ============================================================
// SERVICE
// ============================================================

@Injectable({ providedIn: 'root' })
export class FormateurContentService {

  private readonly http = inject(HttpClient);

  readonly content = signal<CourseContentDto | null>(null);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  // ----------------------------------------------------------
  // COURS
  // ----------------------------------------------------------

createCourse(payload: CoursePayload): Observable<{ data: CreatedCourseDto }> {
  const fd = new FormData();
  fd.append('title', payload.title);

  (
    ['subject', 'category', 'level', 'diploma',
     'durationFull', 'durationAlternance', 'description',
     'type'] as const
  ).forEach((key) => {
    const value = payload[key];
    if (value !== undefined && value !== null && value !== '') {
      fd.append(key, String(value));
    }
  });

  // ✅ Champs spécifiques selon le type
  if (payload.type === 'individual') {
    if (payload.price !== undefined) fd.append('price', String(payload.price));
  } else if (payload.type === 'enterprise') {
    if (payload.enterpriseBasePrice !== undefined) {
      fd.append('enterprise_base_price', String(payload.enterpriseBasePrice));
    }
    if (payload.deliveryMode) fd.append('delivery_mode', payload.deliveryMode);
    if (payload.hoursPerWeek) fd.append('hours_per_week', payload.hoursPerWeek);
  }

  if (payload.image) fd.append('image', payload.image);

  return this.http.post<{ data: CreatedCourseDto }>(
    `${API_URL}/formateur/courses`,
    fd
  );
}

  // ----------------------------------------------------------
  // CHARGEMENT DU CONTENU
  // ----------------------------------------------------------

  loadCourse(courseId: number | string): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<{ data: CourseContentDto }>(
        `${API_URL}/formateur/courses/${courseId}/content`
      )
      .subscribe({
        next: (res) => {
          this.content.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.content.set(null);
          this.loading.set(false);
          this.error.set(extractApiError(err));
        },
      });
  }

  // ----------------------------------------------------------
  // MODULES
  // ----------------------------------------------------------

  createModule(
    courseId: number | string,
    title: string,
    description?: string | null,
  ): Observable<{ data: ModuleDto }> {
    return this.http.post<{ data: ModuleDto }>(
      `${API_URL}/formateur/courses/${courseId}/modules`,
      { title, description: description ?? null }
    );
  }

  renameModule(moduleId: number, title: string): Observable<{ data: ModuleDto }> {
    return this.http.patch<{ data: ModuleDto }>(
      `${API_URL}/formateur/modules/${moduleId}`,
      { title }
    );
  }

  deleteModule(moduleId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${API_URL}/formateur/modules/${moduleId}`
    );
  }

  // ----------------------------------------------------------
  // CHAPITRES
  // ----------------------------------------------------------

  createChapter(
    courseId: number | string,
    moduleId: number,
    title: string,
    weekNumber?: number | null,
  ): Observable<{ data: ChapterDto }> {
    return this.http.post<{ data: ChapterDto }>(
      `${API_URL}/formateur/courses/${courseId}/chapters`,
      {
        title,
        module_id:   moduleId,
        week_number: weekNumber ?? null,
      }
    );
  }

  renameChapter(chapterId: number, title: string): Observable<{ data: ChapterDto }> {
    return this.http.patch<{ data: ChapterDto }>(
      `${API_URL}/formateur/chapters/${chapterId}`,
      { title }
    );
  }

  updateChapter(
    chapterId: number,
    payload: { title?: string; weekNumber?: number | null; moduleId?: number | null },
  ): Observable<{ data: ChapterDto }> {
    const body: any = {};
    if (payload.title !== undefined) body.title = payload.title;
    if (payload.weekNumber !== undefined) body.week_number = payload.weekNumber;
    if (payload.moduleId !== undefined) body.module_id = payload.moduleId;

    return this.http.patch<{ data: ChapterDto }>(
      `${API_URL}/formateur/chapters/${chapterId}`,
      body
    );
  }

  deleteChapter(chapterId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${API_URL}/formateur/chapters/${chapterId}`
    );
  }

  // ----------------------------------------------------------
  // SÉQUENCES
  // ----------------------------------------------------------

  createSequence(chapterId: number, payload: SequencePayload): Observable<{ data: SequenceDto }> {
    return this.http.post<{ data: SequenceDto }>(
      `${API_URL}/formateur/chapters/${chapterId}/sequences`,
      this.buildSequenceForm(payload)
    );
  }

  updateSequence(sequenceId: number, payload: SequencePayload): Observable<{ data: SequenceDto }> {
    return this.http.post<{ data: SequenceDto }>(
      `${API_URL}/formateur/sequences/${sequenceId}`,
      this.buildSequenceForm(payload, true)
    );
  }

  deleteSequence(sequenceId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${API_URL}/formateur/sequences/${sequenceId}`
    );
  }

  // ----------------------------------------------------------
  // QUIZ DE MODULE / EXAMEN FINAL
  // ----------------------------------------------------------

  saveModuleQuiz(moduleId: number, payload: SequencePayload): Observable<{ data: SequenceDto }> {
    return this.http.post<{ data: SequenceDto }>(
      `${API_URL}/formateur/modules/${moduleId}/quiz`,
      this.buildSequenceForm(payload)
    );
  }

  saveFinalExam(courseId: number | string, payload: SequencePayload): Observable<{ data: SequenceDto }> {
    return this.http.post<{ data: SequenceDto }>(
      `${API_URL}/formateur/courses/${courseId}/final-exam`,
      this.buildSequenceForm(payload)
    );
  }

  // ----------------------------------------------------------
  // MUTATIONS LOCALES — MODULES
  // ----------------------------------------------------------

  appendModule(module: ModuleDto): void {
    this.content.update((c) =>
      c ? { ...c, modules: [...c.modules, { ...module, chapters: module.chapters ?? [] }] } : c
    );
  }

  replaceModule(module: ModuleDto): void {
    this.content.update((c) =>
      c
        ? {
            ...c,
            modules: c.modules.map((m) =>
              m.id === module.id ? { ...m, title: module.title, description: module.description } : m
            ),
          }
        : c
    );
  }

  removeModule(moduleId: number): void {
    this.content.update((c) =>
      c ? { ...c, modules: c.modules.filter((m) => m.id !== moduleId) } : c
    );
  }

  // ----------------------------------------------------------
  // MUTATIONS LOCALES — CHAPITRES
  // ----------------------------------------------------------

  appendChapterToModule(moduleId: number, chapter: ChapterDto): void {
    this.content.update((c) =>
      c
        ? {
            ...c,
            modules: c.modules.map((m) =>
              m.id === moduleId
                ? { ...m, chapters: [...m.chapters, { ...chapter, sequences: chapter.sequences ?? [] }] }
                : m
            ),
          }
        : c
    );
  }

  replaceChapter(chapter: ChapterDto): void {
    const patch = (ch: ChapterDto): ChapterDto =>
      ch.id === chapter.id
        ? { ...ch, title: chapter.title, weekNumber: chapter.weekNumber, position: chapter.position }
        : ch;

    this.content.update((c) =>
      c
        ? {
            ...c,
            chapters: c.chapters.map(patch),
            modules:  c.modules.map((m) => ({ ...m, chapters: m.chapters.map(patch) })),
          }
        : c
    );
  }

  removeChapter(chapterId: number): void {
    this.content.update((c) =>
      c
        ? {
            ...c,
            chapters: c.chapters.filter((ch) => ch.id !== chapterId),
            modules:  c.modules.map((m) => ({
              ...m,
              chapters: m.chapters.filter((ch) => ch.id !== chapterId),
            })),
          }
        : c
    );
  }

  // ----------------------------------------------------------
  // MUTATIONS LOCALES — SÉQUENCES
  // ----------------------------------------------------------

  upsertSequence(sequence: SequenceDto): void {
    const patch = (ch: ChapterDto): ChapterDto => {
      if (ch.id !== sequence.chapterId) return ch;
      const exists = ch.sequences.some((s) => s.id === sequence.id);
      return {
        ...ch,
        sequences: exists
          ? ch.sequences.map((s) => (s.id === sequence.id ? sequence : s))
          : [...ch.sequences, sequence],
      };
    };

    this.content.update((c) =>
      c
        ? {
            ...c,
            chapters: c.chapters.map(patch),
            modules:  c.modules.map((m) => ({ ...m, chapters: m.chapters.map(patch) })),
          }
        : c
    );
  }

  removeSequence(sequence: SequenceDto): void {
    const patch = (ch: ChapterDto): ChapterDto => ({
      ...ch,
      sequences: ch.sequences.filter((s) => s.id !== sequence.id),
    });

    this.content.update((c) =>
      c
        ? {
            ...c,
            chapters: c.chapters.map(patch),
            modules:  c.modules.map((m) => ({ ...m, chapters: m.chapters.map(patch) })),
          }
        : c
    );
  }

  // ----------------------------------------------------------
  // MUTATIONS LOCALES — QUIZ DE MODULE / EXAMEN FINAL
  // ----------------------------------------------------------

  setModuleQuiz(moduleId: number, quiz: SequenceDto): void {
    this.content.update((c) =>
      c
        ? {
            ...c,
            modules: c.modules.map((m) => (m.id === moduleId ? { ...m, moduleQuiz: quiz } : m)),
          }
        : c
    );
  }

  removeModuleQuiz(moduleId: number): void {
    this.content.update((c) =>
      c
        ? {
            ...c,
            modules: c.modules.map((m) => (m.id === moduleId ? { ...m, moduleQuiz: null } : m)),
          }
        : c
    );
  }

  setFinalExam(exam: SequenceDto): void {
    this.content.update((c) => (c ? { ...c, finalExam: exam } : c));
  }

  removeFinalExam(): void {
    this.content.update((c) => (c ? { ...c, finalExam: null } : c));
  }

  // ----------------------------------------------------------
  // FORM DATA
  // ----------------------------------------------------------

  private buildSequenceForm(payload: SequencePayload, isUpdate = false): FormData {
    const fd = new FormData();

    if (isUpdate) fd.append('_method', 'PATCH');

    fd.append('title', payload.title);
    fd.append('type',  payload.type);

    if (payload.duration)     fd.append('duration', payload.duration);
    if (payload.videoUrl)     fd.append('video_url', payload.videoUrl);
    if (payload.documentUrl)  fd.append('document_url', payload.documentUrl);
    if (payload.instructions) fd.append('instructions', payload.instructions);

    if (payload.quizQuestions?.length) {
      fd.append('quiz_questions', JSON.stringify(payload.quizQuestions));
    }

    if (payload.passingScore != null) {
      fd.append('passing_score', String(payload.passingScore));
    }
    if (payload.isBlocking != null) {
      fd.append('is_blocking', payload.isBlocking ? '1' : '0');
    }

    if (payload.deadline) {
      fd.append('deadline', payload.deadline);
    }
    if (payload.allowFileUpload != null) {
      fd.append('allow_file_upload', payload.allowFileUpload ? '1' : '0');
    }

    if (payload.videoFile)    fd.append('video',    payload.videoFile);
    if (payload.documentFile) fd.append('document', payload.documentFile);

    return fd;
  }



    // ============================================================
  // HELPER : pré-remplir la structure complète du cours
  // ============================================================
async createFullStructure(courseId: number | string): Promise<void> {
  const modules = [
    {
      title: 'Module 1 : Introduction',
      desc: 'Ce module pose les bases du cours.',
      chapters: [
        { title: 'Bienvenue dans le cours', week: 1 },
        { title: 'Objectifs et méthode', week: 1 },
      ],
    },
    {
      title: 'Module 2 : Approfondissement',
      desc: 'Approfondissez les concepts avec des cas pratiques.',
      chapters: [
        { title: 'Concepts fondamentaux', week: 2 },
        { title: 'Exercices pratiques', week: 2 },
        { title: 'Cas d\'étude', week: 3 },
      ],
    },
    {
      title: 'Module 3 : Application',
      desc: 'Mettez en pratique tout ce que vous avez appris.',
      chapters: [
        { title: 'Mise en situation professionnelle', week: 3 },
        { title: 'Projet final', week: 4 },
      ],
    },
    // ✅ MODULE RESSOURCES
    {
      title: 'Ressources & Manuels',
      desc: 'Manuels, fiches pratiques et documents de référence.',
      chapters: [
        { title: 'Manuel principal', week: 0 },
        { title: 'Fiches pratiques', week: 0 },
        { title: 'Annexes et modèles', week: 0 },
      ],
    },
  ];

  for (const m of modules) {
    const res = await this.createModule(courseId, m.title, m.desc).toPromise();
    if (!res) continue;
    for (const c of m.chapters) {
      await this.createChapter(courseId, res.data.id, c.title, c.week).toPromise();
    }
  }
}

// ============================================================
// ✅ Import d'un quiz via fichier (JSON/CSV) - backend Laravel
// ============================================================
importQuizFile(sequenceId: number, file: File): Observable<{ message: string }> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('_method', 'PATCH');
  return this.http.post<{ message: string }>(
    `${API_URL}/formateur/sequences/${sequenceId}/import-quiz`,
    fd
  );
}
}