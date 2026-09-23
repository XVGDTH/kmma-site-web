// import {
//   ChangeDetectionStrategy, Component, computed, inject, signal,
// } from '@angular/core';
// import { ActivatedRoute, RouterLink } from '@angular/router';

// import {
//   ChapterDto,
//   extractApiError,
//   FormateurContentService,
//   QuizQuestion,
//   SequenceDto,
//   SequencePayload,
//   SequenceType,
//   toAbsoluteUrl,
//   WeekDto,    
// } from '../../../shared/formateur-content.service';

// // ============================================================
// // BROUILLON DE FORMULAIRE
// // ============================================================

// interface QuizQuestionDraft {
//   question: string;
//   type: 'qcm' | 'texte';
//   options: string[];
//   correctIndex: number;
//   expectedAnswer: string;
// }

// interface SequenceDraft {
//   title: string;
//   type: SequenceType;
//   duration: string;
//   videoUrl: string;
//   videoFile: File | null;
//   documentUrl: string;
//   documentFile: File | null;
//   instructions: string;
//   quizQuestions: QuizQuestionDraft[];
// }

// function emptyDraft(): SequenceDraft {
//   return {
//     title: '', type: 'video', duration: '',
//     videoUrl: '', videoFile: null,
//     documentUrl: '', documentFile: null,
//     instructions: '', quizQuestions: [],
    
//   };
// }

// const SEQUENCE_TYPES: { id: SequenceType; label: string; icon: string }[] = [
//   { id: 'video',    label: 'Vidéo',    icon: '🎬' },
//   { id: 'document', label: 'Document', icon: '📄' },
//   { id: 'td',       label: 'TD',       icon: '✍️' },
//   { id: 'tp',       label: 'TP',       icon: '🛠️' },
//   { id: 'devoir',   label: 'Devoir',   icon: '📝' },
//   { id: 'quiz',     label: 'Quiz',     icon: '❓' },
// ];

// @Component({
//   selector: 'app-importer-cours',
//   standalone: true,
//   imports: [RouterLink],
//   templateUrl: './importer-cours.html',
//   styleUrl: './importer-cours.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class ImporterCours {

//   private readonly route = inject(ActivatedRoute);
//   private readonly contentService = inject(FormateurContentService);

//   /** ID SQL du cours (numérique, fourni par le dashboard). */
//   readonly courseId = Number(this.route.snapshot.paramMap.get('courseId'));

//   // ----------------------------------------------------------
//   // CONTENU VENANT DE L'API
//   // ----------------------------------------------------------

//   readonly content = this.contentService.content;
//   readonly loading = this.contentService.loading;
//   readonly loadError = this.contentService.error;

//   readonly course = computed(() => this.content()?.course ?? null);
//   readonly chapters = computed(() => this.content()?.chapters ?? []);

//   // ----------------------------------------------------------
//   // CHAPITRES
//   // ----------------------------------------------------------

//   readonly newChapterTitle = signal('');
//   readonly creatingChapter = signal(false);
//   readonly editingChapterId = signal<number | null>(null);
//   readonly editingChapterTitle = signal('');
//   readonly deletingChapterId = signal<number | null>(null);

//     // ----------------------------------------------------------
//   // SEMAINES
//   // ----------------------------------------------------------

//   readonly newWeekTitle     = signal('');
//   readonly creatingWeek     = signal(false);
//   readonly editingWeekId    = signal<number | null>(null);
//   readonly editingWeekTitle = signal('');
//   readonly deletingWeekId   = signal<number | null>(null);

//   /** Le service expose weeks() directement */
//   readonly weeks = this.contentService.weeks;

//   // ----------------------------------------------------------
//   // SÉQUENCE
//   // ----------------------------------------------------------

//   readonly draft = signal<SequenceDraft>(emptyDraft());
//   readonly draftChapterId = signal<number | null>(null);   // ajout
//   readonly editingSequenceId = signal<number | null>(null); // modification
//   readonly saving = signal(false);
//   readonly saveError = signal<string | null>(null);
//   readonly deletingSequenceId = signal<number | null>(null);
//   readonly message = signal<string | null>(null);

//   readonly sequenceTypes = SEQUENCE_TYPES;
//   readonly documentTypes: SequenceType[] = ['document', 'td', 'tp', 'devoir'];

//   // readonly editingSequence = computed<SequenceDto | null>(() => {
//   //   const id = this.editingSequenceId();
//   //   if (id == null) return null;

//   //   for (const chapter of this.chapters()) {
//   //     const found = chapter.sequences.find((s) => s.id === id);
//   //     if (found) return found;
//   //   }
//   //   return null;
//   // });

//     readonly editingSequence = computed<SequenceDto | null>(() => {
//     const id = this.editingSequenceId();
//     if (id == null) return null;

//     // 1) Chapitres hors semaine
//     for (const chapter of this.chapters()) {
//       const found = chapter.sequences.find((s) => s.id === id);
//       if (found) return found;
//     }

//     // 2) Chapitres dans les semaines
//     for (const week of this.weeks()) {
//       for (const chapter of week.chapters) {
//         const found = chapter.sequences.find((s) => s.id === id);
//         if (found) return found;
//       }
//     }
//     return null;
//   });

//   // readonly canSave = computed(() => {
//   //   const d = this.draft();
//   //   if (!d.title.trim()) return false;

//   //   if (d.type === 'quiz') {
//   //     return d.quizQuestions.some(
//   //       (q) => q.question.trim() !== '' && q.options.some((o) => o.trim() !== '')
//   //     );
//   //   }
//   //   return true;
//   // });

//     readonly canSave = computed(() => {
//     const d = this.draft();
//     if (!d.title.trim()) return false;

//     if (d.type === 'quiz') {
//       const questions = d.quizQuestions.filter((q) => q.question.trim() !== '');

//       if (questions.length === 0) return false;

//       // ✅ CHAQUE question doit être complète :
//       // QCM → au moins 2 options non vides
//       // Texte → une réponse attendue
//       return questions.every((q) => {
//         if (q.type === 'texte') {
//           return (q.expectedAnswer ?? '').trim() !== '';
//         }
//         const validOptions = q.options.filter((o) => o.trim() !== '');
//         return validOptions.length >= 2;
//       });
//     }
//     return true;
//   });

//   constructor() {
//     if (Number.isFinite(this.courseId) && this.courseId > 0) {
//       this.contentService.loadCourse(this.courseId);
//     }
//   }

//   // ==========================================================
//   // CHAPITRES
//   // ==========================================================

//   // createChapter(): void {
//   //   const title = this.newChapterTitle().trim();
//   //   if (!title || this.creatingChapter()) return;

//   //   this.creatingChapter.set(true);
//   //   this.saveError.set(null);

//   //   this.contentService.createChapter(this.courseId, title).subscribe({
//   //     next: (res) => {
//   //       this.contentService.appendChapter(res.data);
//   //       this.newChapterTitle.set('');
//   //       this.creatingChapter.set(false);
//   //       this.flash('Chapitre créé avec succès.');
//   //     },
//   //     error: (err) => {
//   //       this.creatingChapter.set(false);
//   //       this.saveError.set(extractApiError(err));
//   //     },
//   //   });
//   // }


//     createChapterIn(weekId: number, title: string): void {
//     const t = title.trim();
//     if (!t || this.creatingChapter()) return;

//     this.creatingChapter.set(true);
//     this.saveError.set(null);

//     this.contentService.createChapter(this.courseId, weekId, t).subscribe({
//       next: (res) => {
//         this.contentService.appendChapterToWeek(weekId, res.data);
//         this.newChapterTitle.set('');
//         this.creatingChapter.set(false);
//         this.flash('Module créé.');
//       },
//       error: (err) => {
//         this.creatingChapter.set(false);
//         this.saveError.set(extractApiError(err));
//       },
//     });
//   }

//   // ----------------------------------------------------------
//   // SEMAINES
//   // ----------------------------------------------------------

//   createWeek(): void {
//     const title = this.newWeekTitle().trim();
//     if (!title || this.creatingWeek()) return;

//     this.creatingWeek.set(true);
//     this.saveError.set(null);

//     this.contentService.createWeek(this.courseId, title).subscribe({
//       next: (res) => {
//         this.contentService.appendWeek(res.data);
//         this.newWeekTitle.set('');
//         this.creatingWeek.set(false);
//         this.flash(`Semaine « ${res.data.title} » créée.`);
//       },
//       error: (err) => {
//         this.creatingWeek.set(false);
//         this.saveError.set(extractApiError(err));
//       },
//     });
//   }

//   startRenameWeek(week: WeekDto): void {
//     this.editingWeekId.set(week.id);
//     this.editingWeekTitle.set(week.title);
//   }

//   renameWeek(): void {
//     const id = this.editingWeekId();
//     const title = this.editingWeekTitle().trim();
//     if (id == null || !title) return;

//     this.contentService.renameWeek(id, title).subscribe({
//       next: (res) => {
//         this.contentService.replaceWeek(res.data);
//         this.editingWeekId.set(null);
//       },
//       error: (err) => this.saveError.set(extractApiError(err)),
//     });
//   }

//   deleteWeek(week: WeekDto): void {
//     if (!confirm(`Supprimer « ${week.title} » ? Ses modules seront conservés (sans semaine).`)) return;

//     this.deletingWeekId.set(week.id);
//     this.contentService.deleteWeek(week.id).subscribe({
//       next: () => {
//         this.contentService.removeWeek(week.id);
//         this.deletingWeekId.set(null);
//         this.flash('Semaine supprimée.');
//       },
//       error: (err) => {
//         this.deletingWeekId.set(null);
//         this.saveError.set(extractApiError(err));
//       },
//     });
//   }




//   // fin create chapters


//   startRenameChapter(chapter: ChapterDto): void {
//     this.editingChapterId.set(chapter.id);
//     this.editingChapterTitle.set(chapter.title);
//   }

//   cancelRenameChapter(): void {
//     this.editingChapterId.set(null);
//     this.editingChapterTitle.set('');
//   }

//   renameChapter(): void {
//     const id = this.editingChapterId();
//     const title = this.editingChapterTitle().trim();
//     if (id == null || !title) return;

//     this.contentService.renameChapter(id, title).subscribe({
//       next: (res) => {
//         this.contentService.replaceChapter(res.data);
//         this.cancelRenameChapter();
//       },
//       error: (err) => this.saveError.set(extractApiError(err)),
//     });
//   }

//   deleteChapter(chapter: ChapterDto): void {
//     if (!confirm(`Supprimer « ${chapter.title} » et TOUTES ses séquences ?`)) return;

//     this.deletingChapterId.set(chapter.id);

//     this.contentService.deleteChapter(chapter.id).subscribe({
//       next: () => {
//         this.contentService.removeChapter(chapter.id);
//         this.deletingChapterId.set(null);
//         this.flash('Chapitre supprimé.');
//       },
//       error: (err) => {
//         this.deletingChapterId.set(null);
//         this.saveError.set(extractApiError(err));
//       },
//     });
//   }

//   // ==========================================================
//   // FORMULAIRE DE SÉQUENCE
//   // ==========================================================

//   openSequenceForm(chapter: ChapterDto): void {
//     this.draftChapterId.set(chapter.id);
//     this.editingSequenceId.set(null);
//     this.draft.set(emptyDraft());
//     this.saveError.set(null);
//   }

//   openSequenceEdit(sequence: SequenceDto): void {
//     this.draftChapterId.set(null);
//     this.editingSequenceId.set(sequence.id);

//     this.draft.set({
//       title: sequence.title,
//       type: sequence.type,
//       duration: sequence.duration ?? '',
//       // Sans nouveau fichier, Laravel conserve les fichiers existants
//       videoUrl: '', videoFile: null,
//       documentUrl: '', documentFile: null,
//       instructions: sequence.instructions ?? '',
//       quizQuestions: (sequence.quizQuestions ?? []).map((q: any) => ({
//         question: q.question ?? '',
//         type: (q.type === 'texte' ? 'texte' : 'qcm') as 'qcm' | 'texte',
//         options: q.type === 'texte' ? [] : [...(q.options ?? [])],
//         correctIndex: q.correctIndex ?? 0,
//         expectedAnswer: q.expectedAnswer ?? '',
//       })),
//     });

//     this.saveError.set(null);
//   }

//   closeSequenceForm(): void {
//     this.draftChapterId.set(null);
//     this.editingSequenceId.set(null);
//     this.draft.set(emptyDraft());
//     this.saveError.set(null);
//   }

//   sequenceFormOpenFor(chapter: ChapterDto): boolean {
//     if (this.draftChapterId() === chapter.id) return true;

//     const editing = this.editingSequence();
//     return editing != null && editing.chapterId === chapter.id;
//   }

//   updateDraft(key: keyof SequenceDraft, value: string): void {
//     this.draft.update((d) => ({ ...d, [key]: value }));
//   }

//   setDraftType(type: SequenceType): void {
//     this.draft.update((d) => ({ ...d, type }));
//   }

//   // realisation des qcm
//     setQuestionType(index: number, type: 'qcm' | 'texte'): void {
//     this.draft.update((d) => ({
//       ...d,
//       quizQuestions: d.quizQuestions.map((q, i) =>
//         i === index ? { ...q, type } : q
//       ),
//     }));
//   }

//   updateExpectedAnswer(index: number, value: string): void {
//     this.draft.update((d) => ({
//       ...d,
//       quizQuestions: d.quizQuestions.map((q, i) =>
//         i === index ? { ...q, expectedAnswer: value } : q
//       ),
//     }));
//   }

//   onVideoSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     this.draft.update((d) => ({ ...d, videoFile: input.files?.[0] ?? null }));
//   }

//   onDocumentSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     this.draft.update((d) => ({ ...d, documentFile: input.files?.[0] ?? null }));
//   }

//   needsDocument(): boolean {
//     return this.documentTypes.includes(this.draft().type);
//   }

//   // ----------------------------------------------------------
//   // QUIZ DU BROUILLON
//   // ----------------------------------------------------------

 
//     addBlankQuestion(): void {
//     this.draft.update((d) => ({
//       ...d,
//       quizQuestions: [...d.quizQuestions, {
//         question: '',
//         type: 'qcm' as const,
//         options: ['', '', '', ''],
//         correctIndex: 0,
//         expectedAnswer: '',
//       }],
//     }));
//   }

//   addManyBlankQuestions(count: number): void {
//     if (count <= 0) return;

//     // const additions = Array.from({ length: count }, () => ({
//     //   question: '', options: ['', '', ''], correctIndex: 0,
//     // }));
//         const additions = Array.from({ length: count }, () => ({
//       question: '',
//       type: 'qcm' as const,
//       options: ['', '', '', ''],
//       correctIndex: 0,
//       expectedAnswer: '',
//     }));

//     this.draft.update((d) => ({ ...d, quizQuestions: [...d.quizQuestions, ...additions] }));
//   }

//   removeQuestion(index: number): void {
//     this.draft.update((d) => ({
//       ...d,
//       quizQuestions: d.quizQuestions.filter((_, i) => i !== index),
//     }));
//   }

//   updateQuestionText(index: number, value: string): void {
//     this.draft.update((d) => ({
//       ...d,
//       quizQuestions: d.quizQuestions.map((q, i) =>
//         i === index ? { ...q, question: value } : q
//       ),
//     }));
//   }

//   updateOptionText(qIndex: number, oIndex: number, value: string): void {
//     this.draft.update((d) => ({
//       ...d,
//       quizQuestions: d.quizQuestions.map((q, i) => {
//         if (i !== qIndex) return q;
//         const options = [...q.options];
//         options[oIndex] = value;
//         return { ...q, options };
//       }),
//     }));
//   }

//   addOption(qIndex: number): void {
//     this.draft.update((d) => ({
//       ...d,
//       quizQuestions: d.quizQuestions.map((q, i) =>
//         i === qIndex ? { ...q, options: [...q.options, ''] } : q
//       ),
//     }));
//   }

//   removeOption(qIndex: number, oIndex: number): void {
//     this.draft.update((d) => ({
//       ...d,
//       quizQuestions: d.quizQuestions.map((q, i) => {
//         if (i !== qIndex) return q;
//         return { ...q, options: q.options.filter((_, oi) => oi !== oIndex) };
//       }),
//     }));
//   }

//   setCorrectIndex(qIndex: number, correctIndex: number): void {
//     this.draft.update((d) => ({
//       ...d,
//       quizQuestions: d.quizQuestions.map((q, i) =>
//         i === qIndex ? { ...q, correctIndex } : q
//       ),
//     }));
//   }

//   // ----------------------------------------------------------
//   // ENREGISTRER (CRÉATION OU MODIFICATION)
//   // ----------------------------------------------------------

//   saveSequence(): void {
//     const d = this.draft();

//     if (!d.title.trim() || this.saving()) return;

//     const editingId = this.editingSequenceId();
//     const chapterId = this.draftChapterId();

//     if (editingId == null && chapterId == null) return;

    
//         const quizQuestions: QuizQuestion[] =
//       d.type === 'quiz'
//         ? d.quizQuestions
//             .filter((q) => q.question.trim() !== '')
//             .map((q) => ({
//               question: q.question.trim(),
//               type: q.type,
//               options: q.options.filter((o) => o.trim() !== ''),
//               correctIndex: q.correctIndex,
//               expectedAnswer: q.expectedAnswer ?? '',
//             }))
//         : [];

        
//             // 🆕 VALIDATION BLOQUANTE : chaque question doit être complète
//     const invalidQuestion = quizQuestions.findIndex((q) =>
//       (q.type ?? 'qcm') === 'qcm'
//         ? (q.options?.length ?? 0) < 2
//         : (q.expectedAnswer ?? '').trim() === ''
//     );

//     if (invalidQuestion !== -1) {
//       this.saveError.set(
//         `Question ${invalidQuestion + 1} incomplète : ` +
//         ((quizQuestions[invalidQuestion].type ?? 'qcm') === 'qcm'
//           ? 'un QCM doit avoir au moins 2 options.'
//           : 'une question « réponse libre » doit avoir une réponse attendue.')
//       );
//       return;
//     }

//     const payload: SequencePayload = {
//       title: d.title.trim(),
//       type: d.type,
//       duration: d.duration.trim() || null,
//       videoUrl: d.videoUrl.trim() || null,
//       videoFile: d.videoFile,
//       documentUrl: d.documentUrl.trim() || null,
//       documentFile: d.documentFile,
//       instructions: d.instructions.trim() || null,
//       quizQuestions: d.type === 'quiz' ? quizQuestions : null,
//     };

    

//     this.saving.set(true);
//     this.saveError.set(null);

//     const request$ =
//       editingId != null
//         ? this.contentService.updateSequence(editingId, payload)
//         : this.contentService.createSequence(chapterId!, payload);

//     request$.subscribe({
//       next: (res) => {
//         this.contentService.upsertSequence(res.data);
//         this.saving.set(false);
//         this.closeSequenceForm();
//         this.flash(
//           editingId != null
//             ? 'Séquence modifiée avec succès.'
//             : 'Séquence ajoutée avec succès.'
//         );
//       },
//       error: (err) => {
//         this.saving.set(false);
//         this.saveError.set(extractApiError(err));
//       },
//     });
//   }

//   deleteSequence(sequence: SequenceDto): void {
//     if (!confirm(`Supprimer « ${sequence.title} » ?`)) return;

//     this.deletingSequenceId.set(sequence.id);

//     this.contentService.deleteSequence(sequence.id).subscribe({
//       next: () => {
//         this.contentService.removeSequence(sequence);
//         this.deletingSequenceId.set(null);
//         this.flash('Séquence supprimée.');
//       },
//       error: (err) => {
//         this.deletingSequenceId.set(null);
//         this.saveError.set(extractApiError(err));
//       },
//     });
//   }

//   // ----------------------------------------------------------
//   // HELPERS TEMPLATE
//   // ----------------------------------------------------------

//   assetUrl(url: string | null | undefined): string | null {
//     return toAbsoluteUrl(url);
//   }

//   typeIcon(type: SequenceType): string {
//     return SEQUENCE_TYPES.find((t) => t.id === type)?.icon ?? '📄';
//   }

//   typeLabel(type: SequenceType): string {
//     return SEQUENCE_TYPES.find((t) => t.id === type)?.label ?? type;
//   }

//   private flash(msg: string): void {
//     this.message.set(msg);
//     setTimeout(() => this.message.set(null), 4000);
//   }
// }


import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChapterDto,
  extractApiError,
  FormateurContentService,
  ModuleDto,
  QuizQuestion,
  SequenceDto,
  SequencePayload,
  SequenceType,
  toAbsoluteUrl,
} from '../../../shared/formateur-content.service';

// ============================================================
// BROUILLONS
// ============================================================

interface QuizQuestionDraft {
  question: string;
  type: 'qcm' | 'texte';
  options: string[];
  correctIndex: number;
  expectedAnswer: string;
}

interface SequenceDraft {
  title: string;
  type: SequenceType;
  duration: string;
  videoUrl: string;
  videoFile: File | null;
  documentUrl: string;
  documentFile: File | null;
  instructions: string;
  quizQuestions: QuizQuestionDraft[];
  // 🆕 Options quiz
  passingScore: number | null;
  isBlocking: boolean;
  // 🆕 Options cas pratique
  deadline: string;
  allowFileUpload: boolean;
}

function emptyDraft(): SequenceDraft {
  return {
    title: '', type: 'video', duration: '',
    videoUrl: '', videoFile: null,
    documentUrl: '', documentFile: null,
    instructions: '', quizQuestions: [],
    passingScore: null, isBlocking: false,
    deadline: '', allowFileUpload: false,
  };
}

const SEQUENCE_TYPES: { id: SequenceType; label: string; icon: string }[] = [
  { id: 'video',        label: 'Vidéo',           icon: '🎬' },
  { id: 'document',     label: 'Document',        icon: '📄' },
  { id: 'td',           label: 'Exercice (TD)',   icon: '✍️' },
  { id: 'tp',           label: 'Travaux pratiques', icon: '🛠️' },
  { id: 'cas_pratique', label: 'Cas pratique',    icon: '📝' },
  { id: 'quiz',         label: 'Quiz',            icon: '❓' },
];

@Component({
  selector: 'app-importer-cours',
  standalone: true,
  imports: [RouterLink, CommonModule, NgTemplateOutlet],
  templateUrl: './importer-cours.html',
  styleUrl: './importer-cours.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImporterCours {

  private readonly route = inject(ActivatedRoute);
  readonly contentService = inject(FormateurContentService);

  readonly courseId = Number(this.route.snapshot.paramMap.get('courseId'));

  // ----------------------------------------------------------
  // CONTENU DE L'API
  // ----------------------------------------------------------

  readonly content   = this.contentService.content;
  readonly loading   = this.contentService.loading;
  readonly loadError = this.contentService.error;

  readonly course     = computed(() => this.content()?.course ?? null);
  readonly modules    = computed(() => this.content()?.modules ?? []);
  readonly chapters   = computed(() => this.content()?.chapters ?? []);
  readonly finalExam  = computed(() => this.content()?.finalExam ?? null);

  // ----------------------------------------------------------
  // MODULES
  // ----------------------------------------------------------

  readonly newModuleTitle    = signal('');
  readonly newModuleDesc     = signal('');
  readonly creatingModule    = signal(false);
  readonly editingModuleId   = signal<number | null>(null);
  readonly editingModuleTitle = signal('');
  readonly deletingModuleId  = signal<number | null>(null);

  // ----------------------------------------------------------
  // CHAPITRES
  // ----------------------------------------------------------

  readonly newChapterTitle    = signal('');
  readonly newChapterWeekNum  = signal<number | null>(null);
  readonly creatingChapter    = signal(false);
  readonly editingChapterId   = signal<number | null>(null);
  readonly editingChapterTitle = signal('');
  readonly deletingChapterId  = signal<number | null>(null);

  // ----------------------------------------------------------
  // SÉQUENCE (formulaire commun)
  // ----------------------------------------------------------

  readonly draft                 = signal<SequenceDraft>(emptyDraft());
  readonly draftChapterId        = signal<number | null>(null);
  readonly draftModuleQuizId     = signal<number | null>(null);   // quiz de module
  readonly draftFinalExam        = signal<boolean>(false);         // examen final
  readonly editingSequenceId     = signal<number | null>(null);
  readonly saving                = signal(false);
  readonly saveError             = signal<string | null>(null);
  readonly deletingSequenceId    = signal<number | null>(null);
  readonly message               = signal<string | null>(null);

  readonly sequenceTypes = SEQUENCE_TYPES;
  readonly documentTypes: SequenceType[] = ['document', 'td', 'tp', 'cas_pratique'];

  readonly editingSequence = computed<SequenceDto | null>(() => {
    const id = this.editingSequenceId();
    if (id == null) return null;

    for (const chapter of this.chapters()) {
      const found = chapter.sequences.find((s) => s.id === id);
      if (found) return found;
    }

    for (const module of this.modules()) {
      for (const chapter of module.chapters) {
        const found = chapter.sequences.find((s) => s.id === id);
        if (found) return found;
      }
    }
    return null;
  });

  readonly canSave = computed(() => {
    const d = this.draft();
    if (!d.title.trim()) return false;

    if (d.type === 'quiz') {
      const questions = d.quizQuestions.filter((q) => q.question.trim() !== '');
      if (questions.length === 0) return false;

      return questions.every((q) => {
        if (q.type === 'texte') return (q.expectedAnswer ?? '').trim() !== '';
        const validOptions = q.options.filter((o) => o.trim() !== '');
        return validOptions.length >= 2;
      });
    }
    return true;
  });

  constructor() {
    if (Number.isFinite(this.courseId) && this.courseId > 0) {
      this.contentService.loadCourse(this.courseId);
    }
  }

  // ==========================================================
  // MODULES
  // ==========================================================

  createModule(): void {
    const title = this.newModuleTitle().trim();
    if (!title || this.creatingModule()) return;

    this.creatingModule.set(true);
    this.saveError.set(null);

    const desc = this.newModuleDesc().trim() || null;

    this.contentService.createModule(this.courseId, title, desc).subscribe({
      next: (res) => {
        this.contentService.appendModule(res.data);
        this.newModuleTitle.set('');
        this.newModuleDesc.set('');
        this.creatingModule.set(false);
        this.flash(`Module « ${res.data.title} » créé.`);
      },
      error: (err) => {
        this.creatingModule.set(false);
        this.saveError.set(extractApiError(err));
      },
    });
  }

  startRenameModule(module: ModuleDto): void {
    this.editingModuleId.set(module.id);
    this.editingModuleTitle.set(module.title);
  }

  cancelRenameModule(): void {
    this.editingModuleId.set(null);
    this.editingModuleTitle.set('');
  }

  renameModule(): void {
    const id = this.editingModuleId();
    const title = this.editingModuleTitle().trim();
    if (id == null || !title) return;

    this.contentService.renameModule(id, title).subscribe({
      next: (res) => {
        this.contentService.replaceModule(res.data);
        this.cancelRenameModule();
      },
      error: (err) => this.saveError.set(extractApiError(err)),
    });
  }

  deleteModule(module: ModuleDto): void {
    if (!confirm(`Supprimer le module « ${module.title} » ? Les chapitres seront détachés (non supprimés).`)) return;

    this.deletingModuleId.set(module.id);
    this.contentService.deleteModule(module.id).subscribe({
      next: () => {
        this.contentService.removeModule(module.id);
        this.deletingModuleId.set(null);
        this.flash('Module supprimé.');
      },
      error: (err) => {
        this.deletingModuleId.set(null);
        this.saveError.set(extractApiError(err));
      },
    });
  }

  // ==========================================================
  // CHAPITRES
  // ==========================================================

  createChapterIn(moduleId: number): void {
    const title = this.newChapterTitle().trim();
    if (!title || this.creatingChapter()) return;

    this.creatingChapter.set(true);
    this.saveError.set(null);

    const weekNumber = this.newChapterWeekNum();

    this.contentService.createChapter(this.courseId, moduleId, title, weekNumber).subscribe({
      next: (res) => {
        this.contentService.appendChapterToModule(moduleId, res.data);
        this.newChapterTitle.set('');
        this.newChapterWeekNum.set(null);
        this.creatingChapter.set(false);
        this.flash('Chapitre créé.');
      },
      error: (err) => {
        this.creatingChapter.set(false);
        this.saveError.set(extractApiError(err));
      },
    });
  }

  startRenameChapter(chapter: ChapterDto): void {
    this.editingChapterId.set(chapter.id);
    this.editingChapterTitle.set(chapter.title);
  }

  cancelRenameChapter(): void {
    this.editingChapterId.set(null);
    this.editingChapterTitle.set('');
  }

  renameChapter(): void {
    const id = this.editingChapterId();
    const title = this.editingChapterTitle().trim();
    if (id == null || !title) return;

    this.contentService.renameChapter(id, title).subscribe({
      next: (res) => {
        this.contentService.replaceChapter(res.data);
        this.cancelRenameChapter();
      },
      error: (err) => this.saveError.set(extractApiError(err)),
    });
  }

  deleteChapter(chapter: ChapterDto): void {
    if (!confirm(`Supprimer « ${chapter.title} » et TOUTES ses séquences ?`)) return;

    this.deletingChapterId.set(chapter.id);

    this.contentService.deleteChapter(chapter.id).subscribe({
      next: () => {
        this.contentService.removeChapter(chapter.id);
        this.deletingChapterId.set(null);
        this.flash('Chapitre supprimé.');
      },
      error: (err) => {
        this.deletingChapterId.set(null);
        this.saveError.set(extractApiError(err));
      },
    });
  }

  // ==========================================================
  // FORMULAIRE DE SÉQUENCE
  // ==========================================================

  openSequenceForm(chapter: ChapterDto): void {
    this.draftChapterId.set(chapter.id);
    this.draftModuleQuizId.set(null);
    this.draftFinalExam.set(false);
    this.editingSequenceId.set(null);
    this.draft.set(emptyDraft());
    this.saveError.set(null);
  }

  openModuleQuizForm(module: ModuleDto): void {
    this.draftChapterId.set(null);
    this.draftModuleQuizId.set(module.id);
    this.draftFinalExam.set(false);
    this.editingSequenceId.set(null);

    if (module.moduleQuiz) {
      // édition
      this.editingSequenceId.set(module.moduleQuiz.id);
      this.draft.set(this.sequenceToDraft(module.moduleQuiz));
    } else {
      this.draft.set({ ...emptyDraft(), type: 'quiz', isBlocking: true, passingScore: 85 });
    }
    this.saveError.set(null);
  }

  openFinalExamForm(): void {
    this.draftChapterId.set(null);
    this.draftModuleQuizId.set(null);
    this.draftFinalExam.set(true);
    this.editingSequenceId.set(null);

    const existing = this.finalExam();
    if (existing) {
      this.editingSequenceId.set(existing.id);
      this.draft.set(this.sequenceToDraft(existing));
    } else {
      this.draft.set({ ...emptyDraft(), type: 'quiz', isBlocking: true, passingScore: 70 });
    }
    this.saveError.set(null);
  }

  openSequenceEdit(sequence: SequenceDto): void {
    this.draftChapterId.set(null);
    this.draftModuleQuizId.set(null);
    this.draftFinalExam.set(false);
    this.editingSequenceId.set(sequence.id);
    this.draft.set(this.sequenceToDraft(sequence));
    this.saveError.set(null);
  }

  private sequenceToDraft(sequence: SequenceDto): SequenceDraft {
    return {
      title: sequence.title,
      type: sequence.type,
      duration: sequence.duration ?? '',
      videoUrl: '', videoFile: null,
      documentUrl: '', documentFile: null,
      instructions: sequence.instructions ?? '',
      quizQuestions: (sequence.quizQuestions ?? []).map((q: any) => ({
        question: q.question ?? '',
        type: (q.type === 'texte' ? 'texte' : 'qcm') as 'qcm' | 'texte',
        options: q.type === 'texte' ? [] : [...(q.options ?? [])],
        correctIndex: q.correctIndex ?? 0,
        expectedAnswer: q.expectedAnswer ?? '',
      })),
      passingScore: sequence.passingScore,
      isBlocking: sequence.isBlocking ?? false,
      deadline: sequence.deadline ? sequence.deadline.slice(0, 16) : '',  // format datetime-local
      allowFileUpload: sequence.allowFileUpload ?? false,
    };
  }

  closeSequenceForm(): void {
    this.draftChapterId.set(null);
    this.draftModuleQuizId.set(null);
    this.draftFinalExam.set(false);
    this.editingSequenceId.set(null);
    this.draft.set(emptyDraft());
    this.saveError.set(null);
  }

  sequenceFormOpenFor(chapter: ChapterDto): boolean {
    if (this.draftChapterId() === chapter.id) return true;
    const editing = this.editingSequence();
    return editing != null && editing.chapterId === chapter.id;
  }

  moduleQuizFormOpenFor(module: ModuleDto): boolean {
    if (this.draftModuleQuizId() === module.id) return true;
    const editing = this.editingSequence();
    return editing != null && editing.moduleId === module.id && editing.chapterId === null && !editing.isFinal;
  }

  finalExamFormOpen(): boolean {
    if (this.draftFinalExam()) return true;
    const editing = this.editingSequence();
    return editing != null && editing.isFinal === true;
  }

  updateDraft(key: keyof SequenceDraft, value: string): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  updateDraftNumber(key: 'passingScore', value: number | null): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  updateDraftBool(key: 'isBlocking' | 'allowFileUpload', value: boolean): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  setDraftType(type: SequenceType): void {
    this.draft.update((d) => ({ ...d, type }));
  }

  setQuestionType(index: number, type: 'qcm' | 'texte'): void {
    this.draft.update((d) => ({
      ...d,
      quizQuestions: d.quizQuestions.map((q, i) =>
        i === index ? { ...q, type } : q
      ),
    }));
  }

  updateExpectedAnswer(index: number, value: string): void {
    this.draft.update((d) => ({
      ...d,
      quizQuestions: d.quizQuestions.map((q, i) =>
        i === index ? { ...q, expectedAnswer: value } : q
      ),
    }));
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.draft.update((d) => ({ ...d, videoFile: input.files?.[0] ?? null }));
  }

  onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.draft.update((d) => ({ ...d, documentFile: input.files?.[0] ?? null }));
  }

  needsDocument(): boolean {
    return this.documentTypes.includes(this.draft().type);
  }

  needsQuizOptions(): boolean {
    return this.draft().type === 'quiz';
  }

  needsDeadline(): boolean {
    return this.draft().type === 'cas_pratique';
  }

  // ----------------------------------------------------------
  // QUIZ — questions du brouillon
  // ----------------------------------------------------------

  addBlankQuestion(): void {
    this.draft.update((d) => ({
      ...d,
      quizQuestions: [...d.quizQuestions, {
        question: '',
        type: 'qcm' as const,
        options: ['', '', '', ''],
        correctIndex: 0,
        expectedAnswer: '',
      }],
    }));
  }

  addManyBlankQuestions(count: number): void {
    if (count <= 0) return;
    const additions = Array.from({ length: count }, () => ({
      question: '',
      type: 'qcm' as const,
      options: ['', '', '', ''],
      correctIndex: 0,
      expectedAnswer: '',
    }));
    this.draft.update((d) => ({ ...d, quizQuestions: [...d.quizQuestions, ...additions] }));
  }

  removeQuestion(index: number): void {
    this.draft.update((d) => ({
      ...d,
      quizQuestions: d.quizQuestions.filter((_, i) => i !== index),
    }));
  }

  updateQuestionText(index: number, value: string): void {
    this.draft.update((d) => ({
      ...d,
      quizQuestions: d.quizQuestions.map((q, i) =>
        i === index ? { ...q, question: value } : q
      ),
    }));
  }

  updateOptionText(qIndex: number, oIndex: number, value: string): void {
    this.draft.update((d) => ({
      ...d,
      quizQuestions: d.quizQuestions.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[oIndex] = value;
        return { ...q, options };
      }),
    }));
  }

  addOption(qIndex: number): void {
    this.draft.update((d) => ({
      ...d,
      quizQuestions: d.quizQuestions.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, ''] } : q
      ),
    }));
  }

  removeOption(qIndex: number, oIndex: number): void {
    this.draft.update((d) => ({
      ...d,
      quizQuestions: d.quizQuestions.map((q, i) => {
        if (i !== qIndex) return q;
        return { ...q, options: q.options.filter((_, oi) => oi !== oIndex) };
      }),
    }));
  }

  setCorrectIndex(qIndex: number, correctIndex: number): void {
    this.draft.update((d) => ({
      ...d,
      quizQuestions: d.quizQuestions.map((q, i) =>
        i === qIndex ? { ...q, correctIndex } : q
      ),
    }));
  }

  // ----------------------------------------------------------
  // ENREGISTREMENT
  // ----------------------------------------------------------

  saveSequence(): void {
    const d = this.draft();

    if (!d.title.trim() || this.saving()) return;

    const editingId      = this.editingSequenceId();
    const chapterId      = this.draftChapterId();
    const moduleQuizId   = this.draftModuleQuizId();
    const isFinalExam    = this.draftFinalExam();

    if (editingId == null && chapterId == null && moduleQuizId == null && !isFinalExam) return;

    const quizQuestions: QuizQuestion[] =
      d.type === 'quiz'
        ? d.quizQuestions
            .filter((q) => q.question.trim() !== '')
            .map((q) => ({
              question: q.question.trim(),
              type: q.type,
              options: q.options.filter((o) => o.trim() !== ''),
              correctIndex: q.correctIndex,
              expectedAnswer: q.expectedAnswer ?? '',
            }))
        : [];

    const invalidQuestion = quizQuestions.findIndex((q) =>
      (q.type ?? 'qcm') === 'qcm'
        ? (q.options?.length ?? 0) < 2
        : (q.expectedAnswer ?? '').trim() === ''
    );

    if (invalidQuestion !== -1) {
      this.saveError.set(
        `Question ${invalidQuestion + 1} incomplète : ` +
        ((quizQuestions[invalidQuestion].type ?? 'qcm') === 'qcm'
          ? 'un QCM doit avoir au moins 2 options.'
          : 'une question « réponse libre » doit avoir une réponse attendue.')
      );
      return;
    }

    const payload: SequencePayload = {
      title: d.title.trim(),
      type: d.type,
      duration: d.duration.trim() || null,
      videoUrl: d.videoUrl.trim() || null,
      videoFile: d.videoFile,
      documentUrl: d.documentUrl.trim() || null,
      documentFile: d.documentFile,
      instructions: d.instructions.trim() || null,
      quizQuestions: d.type === 'quiz' ? quizQuestions : null,
      passingScore: d.type === 'quiz' ? d.passingScore : null,
      isBlocking: d.type === 'quiz' ? d.isBlocking : false,
      deadline: d.type === 'cas_pratique' && d.deadline ? d.deadline : null,
      allowFileUpload: d.type === 'cas_pratique' ? d.allowFileUpload : false,
    };

    this.saving.set(true);
    this.saveError.set(null);

    let request$;

    if (editingId != null) {
      request$ = this.contentService.updateSequence(editingId, payload);
    } else if (moduleQuizId != null) {
      request$ = this.contentService.saveModuleQuiz(moduleQuizId, payload);
    } else if (isFinalExam) {
      request$ = this.contentService.saveFinalExam(this.courseId, payload);
    } else {
      request$ = this.contentService.createSequence(chapterId!, payload);
    }

    request$.subscribe({
      next: (res) => {
        // Mise à jour locale
        if (moduleQuizId != null) {
          this.contentService.setModuleQuiz(moduleQuizId, res.data);
        } else if (isFinalExam) {
          this.contentService.setFinalExam(res.data);
        } else {
          this.contentService.upsertSequence(res.data);
        }

        this.saving.set(false);
        this.closeSequenceForm();
        this.flash(editingId != null ? 'Modifié avec succès.' : 'Ajouté avec succès.');
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(extractApiError(err));
      },
    });
  }

  deleteSequence(sequence: SequenceDto): void {
    if (!confirm(`Supprimer « ${sequence.title} » ?`)) return;

    this.deletingSequenceId.set(sequence.id);

    this.contentService.deleteSequence(sequence.id).subscribe({
      next: () => {
        this.contentService.removeSequence(sequence);
        this.deletingSequenceId.set(null);
        this.flash('Séquence supprimée.');
      },
      error: (err) => {
        this.deletingSequenceId.set(null);
        this.saveError.set(extractApiError(err));
      },
    });
  }

  deleteModuleQuiz(module: ModuleDto): void {
    if (!module.moduleQuiz) return;
    if (!confirm(`Supprimer le quiz de fin du module « ${module.title} » ?`)) return;

    this.contentService.deleteSequence(module.moduleQuiz.id).subscribe({
      next: () => {
        this.contentService.removeModuleQuiz(module.id);
        this.flash('Quiz de module supprimé.');
      },
      error: (err) => this.saveError.set(extractApiError(err)),
    });
  }

  deleteFinalExam(): void {
    const exam = this.finalExam();
    if (!exam) return;
    if (!confirm(`Supprimer l'examen final ?`)) return;

    this.contentService.deleteSequence(exam.id).subscribe({
      next: () => {
        this.contentService.removeFinalExam();
        this.flash('Examen final supprimé.');
      },
      error: (err) => this.saveError.set(extractApiError(err)),
    });
  }

  // ----------------------------------------------------------
  // HELPERS TEMPLATE
  // ----------------------------------------------------------

  assetUrl(url: string | null | undefined): string | null {
    return toAbsoluteUrl(url);
  }

  typeIcon(type: SequenceType): string {
    return SEQUENCE_TYPES.find((t) => t.id === type)?.icon ?? '📄';
  }

  typeLabel(type: SequenceType): string {
    return SEQUENCE_TYPES.find((t) => t.id === type)?.label ?? type;
  }

  private flash(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(null), 4000);
  }
}