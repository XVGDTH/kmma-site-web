// import { HttpClient } from '@angular/common/http';
// import { Injectable, inject, signal } from '@angular/core';
// import { Observable } from 'rxjs';

// export const API_URL = 'http://127.0.0.1:8000/api';
// export const LARAVEL_URL = 'http://127.0.0.1:8000';

// // ============================================================
// // TYPES
// // ============================================================

// // export interface QuizQuestion {
// //   question: string;
// //   options: string[];
// //   correctIndex: number;
// // }

// export interface QuizQuestion {
//   question: string;
//   type: 'qcm' | 'texte';
//   options: string[];
//   correctIndex: number;
//   expectedAnswer?: string;
// }

// export type SequenceType = 'video' | 'quiz' | 'devoir' | 'tp' | 'td' | 'document';

// export interface SequenceDto {
//   id: number;
//   chapterId: number;
//   title: string;
//   type: SequenceType;
//   duration: string | null;
//   videoUrl: string | null;
//   documentUrl: string | null;
//   quizQuestions: QuizQuestion[] | null;
//   instructions: string | null;
//   position: number;
// }
// // â¬‡ï¸â¬‡ï¸ AJOUTE ICI le nouveau type
// export interface WeekDto {
//   id: number;
//   number: number;
//   title: string;
//   chapters: ChapterDto[];
// }

// export interface ChapterDto {
//   id: number;
//   courseId: number;
//   title: string;
//   position: number;
//   sequences: SequenceDto[];
// }

// export interface CourseContentDto {
//   course: { id: number; slug: string; title: string };
//   chapters: ChapterDto[];
//   weeks: WeekDto[];     
// }

// export interface CreatedCourseDto {
//   id: number;
//   slug: string;
//   title: string;
//   [key: string]: unknown;
// }

// export interface CoursePayload {
//   title: string;
//   subject?: string;
//   category?: string;
//   level?: string;
//   diploma?: string;
//   durationFull?: string;
//   durationAlternance?: string;
//   description?: string;
//   image?: File | null;
// }

// export interface SequencePayload {
//   title: string;
//   type: SequenceType;
//   duration?: string | null;
//   videoUrl?: string | null;
//   videoFile?: File | null;
//   documentUrl?: string | null;
//   documentFile?: File | null;
//   quizQuestions?: QuizQuestion[] | null;
//   instructions?: string | null;
// }

// // ============================================================
// // HELPERS
// // ============================================================

// /** Laravel peut renvoyer "/storage/..." â†’ URL absolue pour Angular. */
// export function toAbsoluteUrl(url: string | null | undefined): string | null {
//   if (!url) return null;
//   if (url.startsWith('http')) return url;
//   return `${LARAVEL_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// /** Message lisible depuis une erreur Laravel (403/422...). */
// export function extractApiError(err: any): string {
//   const body = err?.error;

//   if (body?.errors) {
//     const messages = Object.values(body.errors).flat() as string[];
//     if (messages.length > 0) return messages.join(' ');
//   }

//   return body?.message ?? err?.message ?? 'Une erreur est survenue.';
// }


// // ============================================================
// // SERVICE
// // ============================================================

// @Injectable({ providedIn: 'root' })
// export class FormateurContentService {

//   private readonly http = inject(HttpClient);

//   // Ã‰tat du cours actuellement gÃ©rÃ©
//   readonly content = signal<CourseContentDto | null>(null);
//   readonly loading = signal(false);
//   readonly error = signal<string | null>(null);

//     // â¬‡ï¸â¬‡ï¸ AJOUTE ICI le nouveau signal type pour les cours en lignes
//   readonly weeks    = signal<WeekDto[]>([]);


//   // ----------------------------------------------------------
//   // COURS (crÃ©ation par le formateur)
//   // ----------------------------------------------------------

//   createCourse(payload: CoursePayload): Observable<{ data: CreatedCourseDto }> {
//     const fd = new FormData();
//     fd.append('title', payload.title);

//     (
//       [
//         'subject', 'category', 'level', 'diploma',
//         'durationFull', 'durationAlternance', 'description',
//       ] as const
//     ).forEach((key) => {
//       const value = payload[key];
//       if (value) fd.append(key, value);
//     });

//     if (payload.image) fd.append('image', payload.image);

//     return this.http.post<{ data: CreatedCourseDto }>(
//       `${API_URL}/formateur/courses`,
//       fd
//     );
//   }

//   // ----------------------------------------------------------
//   // CHARGEMENT DU CONTENU
//   // ----------------------------------------------------------

//   loadCourse(courseId: number | string): void {
//     this.loading.set(true);
//     this.error.set(null);

//     this.http
//       .get<{ data: CourseContentDto }>(
//         `${API_URL}/formateur/courses/${courseId}/content`
//       )
//       .subscribe({
//         next: (res) => {
//           this.content.set(res.data);
//           this.weeks.set(res.data.weeks ?? []);   // â¬…ï¸ AJOUT
//           this.loading.set(false);
//         },
//         error: (err) => {
//           this.content.set(null);
//           this.loading.set(false);
//           this.error.set(extractApiError(err));
//         },
        
//       });
      
//   }

//   // ----------------------------------------------------------
//   // CHAPITRES
//   // ----------------------------------------------------------

//   // createChapter(courseId: number, title: string): Observable<{ data: ChapterDto }> {
//   //   return this.http.post<{ data: ChapterDto }>(
//   //     `${API_URL}/formateur/courses/${courseId}/chapters`,
//   //     { title }
//   //   );
//   // }

//     createChapter(
//     courseId: number,
//     weekId: number,
//     title: string,
//   ): Observable<{ data: ChapterDto }> {
//     return this.http.post<{ data: ChapterDto }>(
//       `${API_URL}/formateur/courses/${courseId}/chapters`,
//       { title, week_id: weekId }
//     );
//   }


//     // ----------------------------------------------------------
//   // SEMAINES des cours
//   // ----------------------------------------------------------

//   createWeek(courseId: number, title: string): Observable<{ data: WeekDto }> {
//     return this.http.post<{ data: WeekDto }>(
//       `${API_URL}/formateur/courses/${courseId}/weeks`,
//       { title }
//     );
//   }

//   renameWeek(weekId: number, title: string): Observable<{ data: WeekDto }> {
//     return this.http.put<{ data: WeekDto }>(
//       `${API_URL}/formateur/weeks/${weekId}`,
//       { title }
//     );
//   }

//   deleteWeek(weekId: number): Observable<{ message: string }> {
//     return this.http.delete<{ message: string }>(
//       `${API_URL}/formateur/weeks/${weekId}`
//     );
//   }

//   appendWeek(w: WeekDto): void {
//     this.weeks.update((list) => [...list, w]);
//   }

//   replaceWeek(w: WeekDto): void {
//     this.weeks.update((list) => list.map((x) => (x.id === w.id ? w : x)));
//   }

//   removeWeek(weekId: number): void {
//     this.weeks.update((list) => list.filter((x) => x.id !== weekId));
//   }

//   appendChapterToWeek(weekId: number, chapter: ChapterDto): void {
//     this.weeks.update((list) =>
//       list.map((w) =>
//         w.id === weekId
//           ? { ...w, chapters: [...w.chapters, { ...chapter, sequences: chapter.sequences ?? [] }] }
//           : w
//       )
//     );
//   }

//   renameChapter(chapterId: number, title: string): Observable<{ data: ChapterDto }> {
//     return this.http.patch<{ data: ChapterDto }>(
//       `${API_URL}/formateur/chapters/${chapterId}`,
//       { title }
//     );
//   }

//   deleteChapter(chapterId: number): Observable<{ message: string }> {
//     return this.http.delete<{ message: string }>(
//       `${API_URL}/formateur/chapters/${chapterId}`
//     );
//   }

//   // ----------------------------------------------------------
//   // SÃ‰QUENCES
//   // ----------------------------------------------------------

//   createSequence(chapterId: number, payload: SequencePayload): Observable<{ data: SequenceDto }> {
//     return this.http.post<{ data: SequenceDto }>(
//       `${API_URL}/formateur/chapters/${chapterId}/sequences`,
//       this.buildSequenceForm(payload)
//     );
//   }

//   updateSequence(sequenceId: number, payload: SequencePayload): Observable<{ data: SequenceDto }> {
//     /*
//      * PHP ne parse PAS le corps multipart en PATCH :
//      * on envoie POST + _method=PATCH (Laravel le convertit en PATCH).
//      */
//     return this.http.post<{ data: SequenceDto }>(
//       `${API_URL}/formateur/sequences/${sequenceId}`,
//       this.buildSequenceForm(payload, true)
//     );
//   }

//   deleteSequence(sequenceId: number): Observable<{ message: string }> {
//     return this.http.delete<{ message: string }>(
//       `${API_URL}/formateur/sequences/${sequenceId}`
//     );
//   }

//   // ----------------------------------------------------------
//   // MISE Ã€ JOUR LOCALE DE L'Ã‰TAT (aprÃ¨s mutation rÃ©ussie)
//   // ----------------------------------------------------------

//   // appendChapter(chapter: ChapterDto): void {
//   //   this.content.update((c) =>
//   //     c
//   //       ? { ...c, chapters: [...c.chapters, { ...chapter, sequences: chapter.sequences ?? [] }] }
//   //       : c
//   //   );
//   // }

//     appendChapter(chapter: ChapterDto, weekId?: number | null): void {
//     // Cas 1 : le chapitre appartient Ã  une semaine â†’ on met Ã  jour weeks
//     if (weekId != null) {
//       this.appendChapterToWeek(weekId, chapter);
//       return;
//     }

//     // Cas 2 : chapitre "orphelin" â†’ ancien comportement
//     this.content.update((c) =>
//       c
//         ? { ...c, chapters: [...c.chapters, { ...chapter, sequences: chapter.sequences ?? [] }] }
//         : c
//     );
//   }

//   // replaceChapter(chapter: ChapterDto): void {
//   //   this.content.update((c) =>
//   //     c
//   //       ? {
//   //           ...c,
//   //           chapters: c.chapters.map((ch) =>
//   //             ch.id === chapter.id
//   //               ? { ...ch, title: chapter.title, position: chapter.position }
//   //               : ch
//   //           ),
//   //         }
//   //       : c
//   //   );
//   // }

//   replaceChapter(chapter: ChapterDto): void {
//     // Met Ã  jour dans content.chapters
//     this.content.update((c) =>
//       c
//         ? {
//             ...c,
//             chapters: c.chapters.map((ch) =>
//               ch.id === chapter.id
//                 ? { ...ch, title: chapter.title, position: chapter.position }
//                 : ch
//             ),
//           }
//         : c
//     );

//     // Met Ã  jour dans weeks[].chapters
//     this.weeks.update((list) =>
//       list.map((w) => ({
//         ...w,
//         chapters: w.chapters.map((ch) =>
//           ch.id === chapter.id
//             ? { ...ch, title: chapter.title, position: chapter.position }
//             : ch
//         ),
//       }))
//     );
//   }

//   // removeChapter(chapterId: number): void {
//   //   this.content.update((c) =>
//   //     c ? { ...c, chapters: c.chapters.filter((ch) => ch.id !== chapterId) } : c
//   //   );
//   // }
//     removeChapter(chapterId: number): void {
//     this.content.update((c) =>
//       c ? { ...c, chapters: c.chapters.filter((ch) => ch.id !== chapterId) } : c
//     );

//     this.weeks.update((list) =>
//       list.map((w) => ({
//         ...w,
//         chapters: w.chapters.filter((ch) => ch.id !== chapterId),
//       }))
//     );
//   }

//   // upsertSequence(sequence: SequenceDto): void {
//   //   this.content.update((c) =>
//   //     c
//   //       ? {
//   //           ...c,
//   //           chapters: c.chapters.map((ch) => {
//   //             if (ch.id !== sequence.chapterId) return ch;

//   //             const exists = ch.sequences.some((s) => s.id === sequence.id);

//   //             return {
//   //               ...ch,
//   //               sequences: exists
//   //                 ? ch.sequences.map((s) => (s.id === sequence.id ? sequence : s))
//   //                 : [...ch.sequences, sequence],
//   //             };
//   //           }),
//   //         }
//   //       : c
//   //   );
//   // }

//     upsertSequence(sequence: SequenceDto): void {
//     const patch = (ch: ChapterDto): ChapterDto => {
//       if (ch.id !== sequence.chapterId) return ch;
//       const exists = ch.sequences.some((s) => s.id === sequence.id);
//       return {
//         ...ch,
//         sequences: exists
//           ? ch.sequences.map((s) => (s.id === sequence.id ? sequence : s))
//           : [...ch.sequences, sequence],
//       };
//     };

//     // content.chapters
//     this.content.update((c) =>
//       c ? { ...c, chapters: c.chapters.map(patch) } : c
//     );

//     // weeks[].chapters
//     this.weeks.update((list) =>
//       list.map((w) => ({ ...w, chapters: w.chapters.map(patch) }))
//     );
//   }


//   // removeSequence(sequence: SequenceDto): void {
//   //   this.content.update((c) =>
//   //     c
//   //       ? {
//   //           ...c,
//   //           chapters: c.chapters.map((ch) => ({
//   //             ...ch,
//   //             sequences: ch.sequences.filter((s) => s.id !== sequence.id),
//   //           })),
//   //         }
//   //       : c
//   //   );
//   // }

//     removeSequence(sequence: SequenceDto): void {
//     const patch = (ch: ChapterDto): ChapterDto => ({
//       ...ch,
//       sequences: ch.sequences.filter((s) => s.id !== sequence.id),
//     });

//     this.content.update((c) =>
//       c ? { ...c, chapters: c.chapters.map(patch) } : c
//     );

//     this.weeks.update((list) =>
//       list.map((w) => ({ ...w, chapters: w.chapters.map(patch) }))
//     );
//   }

//   // ----------------------------------------------------------
//   // CONSTRUCTION DU FormData (fichiers + champs)
//   // ----------------------------------------------------------

//   private buildSequenceForm(payload: SequencePayload, isUpdate = false): FormData {
//     const fd = new FormData();

//     if (isUpdate) fd.append('_method', 'PATCH');

//     fd.append('title', payload.title);
//     fd.append('type', payload.type);

//     if (payload.duration) fd.append('duration', payload.duration);
//     if (payload.videoUrl) fd.append('video_url', payload.videoUrl);
//     if (payload.documentUrl) fd.append('document_url', payload.documentUrl);
//     if (payload.instructions) fd.append('instructions', payload.instructions);

//     if (payload.quizQuestions?.length) {
//       // Un FormData ne transporte pas d'objets â†’ JSON
//       // (dÃ©codÃ© par le patch Laravel 1.3)
//       fd.append('quiz_questions', JSON.stringify(payload.quizQuestions));
//     }

//     if (payload.videoFile) fd.append('video', payload.videoFile);
//     if (payload.documentFile) fd.append('document', payload.documentFile);

//     return fd;
//   }
// }


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
 * âš ï¸ CONVENTION DE NOMMAGE
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Base de donnÃ©es (Laravel)   â†’   Interface (Angular)
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Module                      â†’   Module
 * Chapter                     â†’   Chapitre
 * Sequence                    â†’   SÃ©quence
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Structure : Cours â†’ Module â†’ Chapitre (Semaine N) â†’ SÃ©quence
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

export interface CourseContentDto {
  course: { id: number; slug: string; title: string };
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

export function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${LARAVEL_URL}${url.startsWith('/') ? '' : '/'}${url}`;
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
      [
        'subject', 'category', 'level', 'diploma',
        'durationFull', 'durationAlternance', 'description',
      ] as const
    ).forEach((key) => {
      const value = payload[key];
      if (value) fd.append(key, value);
    });

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
  // SÃ‰QUENCES
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
  // MUTATIONS LOCALES â€” MODULES
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
  // MUTATIONS LOCALES â€” CHAPITRES
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
  // MUTATIONS LOCALES â€” SÃ‰QUENCES
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
  // MUTATIONS LOCALES â€” QUIZ DE MODULE / EXAMEN FINAL
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
}