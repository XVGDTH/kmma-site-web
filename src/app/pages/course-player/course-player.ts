import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { UpperCasePipe, DecimalPipe, CommonModule} from '@angular/common';

import {
  CURRICULA,
  fallbackCurriculum,
} from '../../data/curriculum';

import type {
  CourseSequence,
  CourseCurriculum,
  CourseChapter,
} from '../../data/curriculum';

import { LiveSessionService } from '../../shared/live-session.service';

import {
  fallbackSchedule,
  LIVE_SCHEDULES,
} from '../../data/live-session';

import { CourseForum } from '../../shared/course-forum/course-forum';

import { CourseContentService } from '../../shared/course-content.service';

import { VideoStorageService } from '../../shared/video-storage.service';


import { CoursesApiService } from '../../shared/courses-api.service';
import { HttpClient } from '@angular/common/http';
import { CourseAccessService } from '../../shared/course-access.service';

// en haut, dans les imports depuis '../../data/Course builder.model '
import type {
  CourseWeek,
  UploadedVideoMeta,
  WeekAssignment,
} from '../../data/Course builder.model ';
import { computeWeekDuration } from '../../data/Course builder.model '; // ðŸ†•






// ============================================================
// TYPE DU COURS RETOURNÃ‰ PAR L'API
// ============================================================



type CourseFromApi = {
  id: string | number;
  instructor?: string;
  instructorRole?: string;

  chapters?: CourseChapter[];       // ancien systÃ¨me
  modules?: Array<{                 // ðŸ†• nouveau systÃ¨me HEC
    id: number;
    title: string;
    description?: string | null;
    position: number;
    chapters: Array<{
      id: string;
      title: string;
      weekNumber?: number | null;
      position: number;
      sequences: CourseSequence[];
    }>;
    moduleQuiz?: CourseSequence | null;
  }>;
  finalExam?: CourseSequence | null; // ðŸ†•

  [key: string]: unknown;
};


// ============================================================
// COMPOSANT
// ============================================================

@Component({
  selector: 'app-course-player',

  standalone: true,

  imports: [
    RouterLink,
    CourseForum,
    UpperCasePipe,
    DecimalPipe,   
    CommonModule,       
  ],

  templateUrl: './course-player.html',

  styleUrl: './course-player.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursePlayer {

  // ============================================================
  // SERVICES
  // ============================================================

  private readonly route =
    inject(ActivatedRoute);

    private readonly http =
  inject(HttpClient);

  private readonly liveService =
    inject(LiveSessionService);

  private readonly contentService =
    inject(CourseContentService);

  private readonly videoStorage =
    inject(VideoStorageService);

  private readonly coursesApi =
    inject(CoursesApiService);

  private readonly sanitizer =
  inject(DomSanitizer);
  readonly accessService =
    inject(CourseAccessService);
  


  // ============================================================
  // CONFIGURATION API LARAVEL
  // ============================================================

  private readonly apiBaseUrl =
    'http://127.0.0.1:8000';


  // ============================================================
  // ID DU COURS
  // ============================================================

  readonly courseId = toSignal(
    this.route.paramMap.pipe(
      map(
        (params): string =>
          params.get('id') ??
          params.get('courseId') ??
          ''
      )
    ),
    {
      initialValue: '',
    }
  );


  // ============================================================
  // COURS CHARGÃ‰ DEPUIS LARAVEL a recommenter pour activer afin d'initialiser le cours depuis l'API Laravel
  // ============================================================

  // readonly courseDetail = toSignal(
  //   this.route.paramMap.pipe(

  //     map(
  //       (params): string =>
  //         params.get('id') ??
  //         params.get('courseId') ??
  //         ''
  //     ),

  //     switchMap(
  //       (id: string) => {

  //         if (!id) {
  //           return of(null);
  //         }

  //         return this.coursesApi
  //           .getCourseDetail(id)
  //           .pipe(

  //             catchError((error) => {

  //               console.error(
  //                 'Erreur lors du chargement du cours depuis Laravel :',
  //                 error
  //               );

  //               return of(null);
  //             })

  //           );
  //       }
  //     )

  //   ),

  //   {
  //     initialValue: null,
  //   }
  // );

  // ============================================================
// ✅ SIMULATION : cours chargé en local (sans API)
// Pour rebrancher l'API plus tard :
//   - décommente le bloc au-dessus avec Ctrl+/
//   - supprime ce bloc simulé
// ============================================================
readonly courseDetail = toSignal(
  this.route.paramMap.pipe(
    map((params): string => params.get('id') ?? params.get('courseId') ?? ''),
    switchMap((id: string) => {
      if (!id) return of(null);
      return of(this.buildMockCourse(id));
    })
  ),
  { initialValue: null }
);

// ✅ Cours simulé pour tester le parcours sans backend
private buildMockCourse(id: string): any {
  return {
    id,
    title: 'Fondamentaux de l\'audit interne et gestion des risques',
    description: 'Maîtrisez les techniques d\'audit interne pour identifier, évaluer et gérer les risques.',
    category: 'Audit & Contrôle',
    subject: 'Audit & Contrôle',
    level: 'Intermédiaire',
    durationFull: '6 semaines',
    diploma: 'Certificat KMAA',
    instructor: 'Expert YAOGO',
    instructorRole: 'Formateur & Consultant',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',

    modules: [
      {
        id: 1,
        title: 'Introduction à l\'audit interne',
        description: 'Découvrez les fondamentaux du métier.',
        position: 0,
        chapters: [
          {
            id: 'ch-1-1',
            title: 'Rôle et mission de l\'auditeur',
            weekNumber: 1,
            position: 0,
            sequences: [
              {
                id: 'seq-1-1-1',
                title: 'Bienvenue dans le cours',
                type: 'video',
                duration: '8 min',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                position: 0,
                completed: false,
              },
              {
                id: 'seq-1-1-2',
                title: 'Le cadre légal au Burkina Faso',
                type: 'document',
                duration: '15 min',
                documentUrl: null,
                position: 1,
                completed: false,
              },
              {
                id: 'seq-1-1-3',
                title: 'Quiz : les bases',
                type: 'quiz',
                duration: '5 min',
                position: 2,
                completed: false,
                passingScore: 70,
                quizQuestions: [
                  {
                    id: 1,
                    type: 'qcm',
                    question: 'Quel est le rôle principal de l\'audit interne ?',
                    options: [
                      'Contrôler les employés',
                      'Évaluer et améliorer les processus de gestion des risques',
                      'Remplacer la direction',
                      'Gérer la comptabilité',
                    ],
                    correctIndex: 1,
                  },
                  {
                    id: 2,
                    type: 'qcm',
                    question: 'Que signifie IIA ?',
                    options: [
                      'Institut International de l\'Audit',
                      'Institute of Internal Auditors',
                      'International Internal Association',
                      'Aucune de ces réponses',
                    ],
                    correctIndex: 1,
                  },
                ],
              },
            ],
          },
        ],
        moduleQuiz: null,
      },
      {
        id: 2,
        title: 'Techniques d\'audit',
        description: 'Maîtrisez les outils du métier.',
        position: 1,
        chapters: [
          {
            id: 'ch-2-1',
            title: 'Entretiens et questionnaires',
            weekNumber: 2,
            position: 0,
            sequences: [
              {
                id: 'seq-2-1-1',
                title: 'Conduire un entretien d\'audit',
                type: 'video',
                duration: '12 min',
                videoUrl: null,
                position: 0,
                completed: false,
              },
              {
                id: 'seq-2-1-2',
                title: 'Devoir : analyse de cas',
                type: 'devoir',
                duration: '30 min',
                documentUrl: null,
                instructions: 'Analysez le cas présenté et rédigez un rapport de 2 pages.',
                position: 1,
                completed: false,
              },
            ],
          },
        ],
        moduleQuiz: null,
      },
    ],
    finalExam: null,
  };
}


// fin de parcours de la partie simulée


  // ============================================================
  // COURS ACTUEL
  // ============================================================

  readonly course = computed(() => {

    return this.courseDetail() ?? undefined;

  });


  // ============================================================
  // CURRICULUM
  // ============================================================


  readonly curriculum =
  computed<CourseCurriculum>(() => {

    const course =
      this.courseDetail() as CourseFromApi | null;

    if (!course) {
      return (
        CURRICULA[this.courseId()] ??
        fallbackCurriculum(this.courseId())
      );
    }

    // ============================================================
    // ðŸ†• PRIORITÃ‰ 1 : Structure HEC (modules â†’ chapters â†’ sÃ©quences)
    // ============================================================

    if (Array.isArray(course.modules) && course.modules.length > 0) {

      const flatChapters: CourseChapter[] = [];

      for (const module of course.modules) {
        for (const chapter of module.chapters) {

          flatChapters.push({
            id: String(chapter.id),
            title: chapter.title,
            position: chapter.position,
            weekNumber: chapter.weekNumber ?? null,

            // ðŸ†• mÃ©tadonnÃ©es du module parent (pour l'affichage groupÃ©)
            moduleId: module.id,
            moduleTitle: module.title,
            modulePosition: module.position,
            moduleQuiz: module.moduleQuiz ?? null,

            sequences: (chapter.sequences ?? []).map((seq) => ({
              id: String(seq.id),
              title: seq.title,
              type: seq.type,
              duration: seq.duration,
              videoUrl: seq.videoUrl,
              documentUrl: seq.documentUrl,
              quizQuestions: seq.quizQuestions,
              instructions: seq.instructions,
              completed: seq.completed ?? false,
              position: seq.position,
            })),
          });
        }
      }

      return {
        courseId: String(course.id),
        instructor: course.instructor ?? 'Ã‰quipe pÃ©dagogique KMAA',
        instructorRole: course.instructorRole ?? 'Formateurs experts du domaine',
        chapters: flatChapters,
      };
    }

    // ============================================================
    // PRIORITÃ‰ 2 : Ancien systÃ¨me (chapters directs)
    // ============================================================

    const chapters = course.chapters;

    if (Array.isArray(chapters) && chapters.length > 0) {
      return {
        courseId: String(course.id),
        instructor: course.instructor ?? 'Ã‰quipe pÃ©dagogique KMAA',
        instructorRole: course.instructorRole ?? 'Formateurs experts du domaine',
        chapters: chapters.map((chapter: CourseChapter) => ({
          id: String(chapter.id),
          title: chapter.title,
          position: chapter.position,
          sequences: (chapter.sequences ?? []).map((sequence: CourseSequence) => ({
            id: String(sequence.id),
            title: sequence.title,
            type: sequence.type,
            duration: sequence.duration,
            videoUrl: sequence.videoUrl,
            documentUrl: sequence.documentUrl,
            quizQuestions: sequence.quizQuestions,
            instructions: sequence.instructions,
            completed: sequence.completed ?? false,
            position: sequence.position,
          })),
        })),
      };
    }

    // ============================================================
    // PRIORITÃ‰ 3 : Fallback statique
    // ============================================================

    return (
      CURRICULA[this.courseId()] ??
      fallbackCurriculum(this.courseId())
    );
  });


  /** ðŸ†• Examen final (isFinal=true) renvoyÃ© par l'API */
readonly finalExam = computed<CourseSequence | null>(() => {
  const course = this.courseDetail() as CourseFromApi | null;
  const exam = course?.finalExam;
  if (!exam) return null;
  return {
    id: String(exam.id),
    title: exam.title,
    type: exam.type,
    duration: exam.duration,
    videoUrl: exam.videoUrl,
    documentUrl: exam.documentUrl,
    quizQuestions: exam.quizQuestions,
    instructions: exam.instructions,
    completed: exam.completed ?? false,
    position: exam.position,
  };
});

/** ðŸ†• Nombre de modules (pour l'affichage) */
readonly modulesCount = computed(() => {
  const course = this.courseDetail() as CourseFromApi | null;
  return course?.modules?.length ?? 0;
});


  // ============================================================
  // SESSION LIVE
  // ============================================================

  readonly liveSchedule =
    computed(() => {

      return (

        LIVE_SCHEDULES[
          this.courseId()
        ] ??

        fallbackSchedule(
          this.courseId()
        )

      );

    });


  readonly liveSession =
    computed(() => {

      return this.liveService.getSession(
        this.courseId()
      );

    });

      // ============================================================
  // ðŸ† MES Ã‰VALUATIONS (panneau latÃ©ral)
  // ============================================================

  readonly evalFilter = signal<'tous' | 'corrige' | 'attente'>('tous');

  readonly filteredEvaluations = computed(() => {
    const filter = this.evalFilter();
    const list = this.accessService.evaluations();

    if (filter === 'tous') return list;
    if (filter === 'corrige') return list.filter((e) => e.status === 'corrige' || e.status === 'reussi');
    return list.filter((e) => e.status === 'soumis' || e.status === 'retourne');
  });

  setEvalFilter(f: 'tous' | 'corrige' | 'attente'): void {
    this.evalFilter.set(f);
  }

  /** Clic sur une Ã©val â†’ ouvre la sÃ©quence correspondante. */
  goToEvaluation(sequenceId: string): void {
    this.selectSequence(sequenceId);
  }


  // ============================================================
  // CONTENU PUBLIÃ‰
  // ============================================================

  readonly publishedWeeks =
    computed(() => {

      return this.contentService.weeksForCourse(
        this.courseId()
      );

    });


  readonly hasPublishedContent =
    computed(() => {

      return this.publishedWeeks().length > 0;

    });


  // ============================================================
  // Ã‰TAT DE L'INTERFACE
  // ============================================================

  readonly expandedWeekId =
    signal<string | null>(null);

  readonly activeVideoUrl =
    signal<string | null>(null);

  readonly selectedPublishedVideo =
    signal<UploadedVideoMeta | null>(null);

  readonly selectedWeek =
    signal<CourseWeek | null>(null);

  readonly selectedAssignment =
    signal<WeekAssignment | null>(null);

  readonly selectedQuizWeek =
    signal<CourseWeek | null>(null);

  readonly progressTick =
    signal(0);


  // ============================================================
  // CHAPITRE OUVERT
  // ============================================================

  readonly openChapterId =
    signal<string | null>(null);


  // ============================================================
  // SÃ‰QUENCE ACTIVE
  // ============================================================

  readonly activeSequenceId =
    signal<string | null>(null);


  // ============================================================
  // STATISTIQUES
  // ============================================================

  readonly stats =
    signal({

      totalEnrolled: 47,

      currentlyOnline: 6,

      videoViewers: 3,

      completionRate: 62,

    });



    // ============================================================
// 🆕 PANNEAU DE NAVIGATION À CÔTÉ DE LA VIDÉO (façon HEC)
// ============================================================

/** Trouve le chapitre qui contient une séquence donnée. */
private findChapterForSequence(sequenceId: string): CourseChapter | undefined {
  for (const chapter of this.curriculum().chapters) {
    if (chapter.sequences.some((s) => String(s.id) === String(sequenceId))) {
      return chapter;
    }
  }
  return undefined;
}

/** Les autres séquences du même chapitre que la séquence active — pour le panneau latéral. */
readonly activeChapterSequences = computed<CourseSequence[]>(() => {
  const id = this.activeSequenceId();
  if (!id) return [];
  const chapter = this.findChapterForSequence(id);
  return chapter?.sequences ?? [];
});

/** Icône courte selon le type de séquence, pour le panneau de navigation. */
typeIconFor(type: string): string {
  const map: Record<string, string> = {
    video: '🎬', document: '📄', quiz: '❓', devoir: '📝', tp: '🛠️', td: '✍️',
  };
  return map[type] ?? '📄';
}



    // nouveau design pour le style hec paris

    // nouveau design pour le style hec paris

// ============================================================
// 🆕 ONGLETS HORIZONTAUX (façon HEC : Cours / Discussion / Progression...)
// ============================================================



// ============================================================
// 🆕 ONGLETS (mis à jour avec 'replays')
// ============================================================
readonly activeTab = signal<
  'cours' | 'discussion' | 'progression' | 'evaluations' | 'calendrier'
  | 'formule' | 'live' | 'manuels' | 'reglements' | 'replays'
>('cours');

setTab(tab:
  'cours' | 'discussion' | 'progression' | 'evaluations' | 'calendrier'
  | 'formule' | 'live' | 'manuels' | 'reglements' | 'replays'
): void {
  this.activeTab.set(tab);
}

// ============================================================
// 🆕 DONNÉES SIMULÉES — Manuels
// ============================================================
readonly mockManuals = [
  {
    id: 'm1',
    title: 'Manuel principal — Français',
    description: 'Support officiel du cours couvrant l\'ensemble du programme.',
    category: 'Cours principal',
    type: 'pdf' as 'pdf' | 'doc' | 'xls' | 'zip',
    updatedAt: '12 Oct 2026',
    size: '4,2 Mo',
    pages: 186,
  },
  {
    id: 'm2',
    title: 'Manuel principal — English version',
    description: 'English version of the official course material.',
    category: 'Cours principal',
    type: 'pdf' as 'pdf' | 'doc' | 'xls' | 'zip',
    updatedAt: '12 Oct 2026',
    size: '4,1 Mo',
    pages: 186,
  },
  {
    id: 'm3',
    title: 'Cas pratiques & exercices',
    description: 'Recueil d\'exercices progressifs pour s\'entraîner.',
    category: 'Exercices',
    type: 'pdf' as 'pdf' | 'doc' | 'xls' | 'zip',
    updatedAt: '08 Oct 2026',
    size: '2,8 Mo',
    pages: 92,
  },
  {
    id: 'm4',
    title: 'Modèles Excel — Tableaux d\'analyse',
    description: 'Templates prêts à l\'emploi pour vos missions.',
    category: 'Outils',
    type: 'xls' as 'pdf' | 'doc' | 'xls' | 'zip',
    updatedAt: '05 Oct 2026',
    size: '1,5 Mo',
    pages: 0,
  },
  {
    id: 'm5',
    title: 'Fiches de synthèse',
    description: 'Résumés des points clés pour réviser rapidement.',
    category: 'Révision',
    type: 'pdf' as 'pdf' | 'doc' | 'xls' | 'zip',
    updatedAt: '01 Oct 2026',
    size: '890 Ko',
    pages: 24,
  },
  {
    id: 'm6',
    title: 'Pack ressources complémentaires',
    description: 'Articles, normes et textes de référence.',
    category: 'Ressources',
    type: 'zip' as 'pdf' | 'doc' | 'xls' | 'zip',
    updatedAt: '28 Sep 2026',
    size: '12,3 Mo',
    pages: 0,
  },
];

previewManual(manual: any): void {
  alert(`📖 Aperçu du manuel : ${manual.title}\n\n` +
    `(En attente de connexion.)`);
}

downloadManual(manual: any): void {
  alert(`⬇ Téléchargeme : ${manual.title}\n\n` +
    `(En attente de connexion.)`);
}

// ============================================================
// 🆕 DONNÉES SIMULÉES — Calendrier
// ============================================================
readonly calFilter = signal<'all' | 'live' | 'devoir' | 'quiz' | 'exam'>('all');

setCalFilter(filter: 'all' | 'live' | 'devoir' | 'quiz' | 'exam'): void {
  this.calFilter.set(filter);
}

readonly mockCalendarEvents = [
  {
    id: 'ev1',
    type: 'live' as const,
    day: '15',
    month: 'Jan',
    title: 'Séance live — Introduction',
    description: 'Première session en direct avec le formateur pour lancer le cours.',
    time: '18h00 — 20h00',
    duration: '2h',
    instructor: 'Expert YAOGO',
    status: 'past' as const,
  },
  {
    id: 'ev2',
    type: 'devoir' as const,
    day: '22',
    month: 'Jan',
    title: 'Remise du devoir n°1',
    description: 'Date limite pour rendre le premier devoir noté.',
    time: 'Avant 23h59',
    duration: null,
    instructor: null,
    status: 'today' as const,
  },
  {
    id: 'ev3',
    type: 'quiz' as const,
    day: '05',
    month: 'Fév',
    title: 'Quiz de validation Module 1',
    description: 'Quiz obligatoire pour valider le premier module du cours.',
    time: 'Disponible 24h',
    duration: '20 min',
    instructor: null,
    status: 'upcoming' as const,
  },
  {
    id: 'ev4',
    type: 'live' as const,
    day: '12',
    month: 'Fév',
    title: 'Séance live — Cas pratiques',
    description: 'Analyse de cas réels avec le formateur.',
    time: '18h00 — 19h30',
    duration: '1h30',
    instructor: 'Expert YAOGO',
    status: 'upcoming' as const,
  },
  {
    id: 'ev5',
    type: 'exam' as const,
    day: '28',
    month: 'Fév',
    title: 'Examen final',
    description: 'Évaluation finale du cours. Score minimum requis : 70%.',
    time: '9h00 — 12h00',
    duration: '3h',
    instructor: null,
    status: 'upcoming' as const,
  },
];

readonly filteredCalendarEvents = computed(() => {
  const filter = this.calFilter();
  if (filter === 'all') return this.mockCalendarEvents;
  return this.mockCalendarEvents.filter((e) => e.type === filter);
});

// ============================================================
// 🆕 DONNÉES SIMULÉES — Replays
// ============================================================
readonly mockLiveReplays = [
  {
    id: 'r1',
    title: 'Séance d\'introduction — Présentation du cours',
    description: 'Vue d\'ensemble du programme, des objectifs et de la méthode pédagogique.',
    date: '10 Jan 2026',
    duration: '1h 48min',
    instructor: 'Expert YAOGO',
    views: 234,
    isNew: false,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=60',
    resources: [
      { label: 'Slides de présentation' },
      { label: 'Programme détaillé' },
    ],
  },
  {
    id: 'r2',
    title: 'Cas pratique — Analyse d\'un audit interne',
    description: 'Étude de cas complète menée en direct avec les apprenants.',
    date: '24 Jan 2026',
    duration: '2h 12min',
    instructor: 'Expert YAOGO',
    views: 187,
    isNew: true,
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60',
    resources: [
      { label: 'Étude de cas PDF' },
      { label: 'Corrigé détaillé' },
    ],
  },
  {
    id: 'r3',
    title: 'Masterclass — Les normes IIA en pratique',
    description: 'Approfondissement des normes internationales d\'audit interne.',
    date: '07 Fév 2026',
    duration: '1h 30min',
    instructor: 'Expert YAOGO',
    views: 156,
    isNew: true,
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=60',
    resources: [
      { label: 'Slides masterclass' },
    ],
  },
  {
    id: 'r4',
    title: 'Q&A — Session de questions/réponses',
    description: 'Réponses aux questions les plus posées par les apprenants.',
    date: '21 Fév 2026',
    duration: '45min',
    instructor: 'Expert YAOGO',
    views: 98,
    isNew: false,
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=60',
    resources: [],
  },
];

playReplay(replay: any): void {
  alert(`▶ Lecture du replay : ${replay.title}\n\n` +
    `(En attente de connexion.)`
  );
}

downloadReplay(replay: any): void {
  alert(`⬇ Téléchargement : ${replay.title}\n\n` +
    `(En attente de la connexion.)`);
}

// ============================================================
// 🆕 ACCORDÉON MULTI-NIVEAU (plusieurs sections ouvertes à la fois)
// ============================================================

readonly expandedNodeIds = signal<Set<string>>(new Set());

toggleNode(nodeId: string): void {
  this.expandedNodeIds.update((current) => {
    const next = new Set(current);
    next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
    return next;
  });
}

isNodeExpanded(nodeId: string): boolean {
  return this.expandedNodeIds().has(nodeId);
}

// ============================================================
// 🆕 FAVORIS (bookmark d'une séquence)
// ============================================================

  // ============================================================
  // 🆕 SIDEBAR RÉTRACTABLE (façon HEC)
  // ============================================================

  readonly isSidebarOpen = signal<boolean>(true);

  toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  // ============================================================
  // 🆕 FAVORIS (bookmark d'une séquence)
  // ============================================================

  readonly bookmarkedIds = signal<Set<string>>(new Set());

toggleBookmark(sequenceId: string): void {
  this.bookmarkedIds.update((current) => {
    const next = new Set(current);
    next.has(sequenceId) ? next.delete(sequenceId) : next.add(sequenceId);
    return next;
  });
}

// ============================================================
// 🆕 AVIS DE FIN DE SECTION (texte + émoji)
// ============================================================

readonly feedbackText = signal('');
readonly feedbackRating = signal<number | null>(null);
readonly feedbackSent = signal(false);

setFeedbackRating(rating: number): void {
  this.feedbackRating.set(rating);
}

submitFeedback(): void {
  const seq = this.activeSequence;
  if (!seq) return;

  // this.http.post(`${this.apiBaseUrl}/api/sequences/${seq.id}/feedback`, {
  //   comment: this.feedbackText(),
  //   rating: this.feedbackRating(),
  // }).subscribe({
  //   next: () => {
  //     this.feedbackSent.set(true);
  //     this.feedbackText.set('');
  //     this.feedbackRating.set(null);
  //   },
  //   error: () => alert("Impossible d'envoyer votre avis pour le moment."),
  // });

   this.feedbackSent.set(true);
  this.feedbackText.set('');
  this.feedbackRating.set(null);
}


    // fin du design
    


  // ============================================================
  // QUIZ
  // ============================================================

  readonly quizAnswers =
    signal<Record<number, number>>({});

  readonly quizSubmitted =
    signal(false);

      // ============================================================
  // ðŸŽ¯ QUIZ LARAVEL â€” moteur de scoring (QCM + texte)
  // ============================================================

  readonly laravelQuizAnswers =
    signal<Record<number, string>>({});

  readonly laravelQuizSubmitted =
    signal(false);
      readonly laravelQuizSubmitting =
    signal(false);

  readonly laravelQuizPassed =
    signal(false);

  readonly laravelQuizScore =
    signal<{ score: number; total: number } | null>(null);


  // ============================================================
  // INITIALISATION
  // ============================================================



    constructor() {

    let loadedCourseId = '';

    // ----------------------------------------------------------
    // 1. PROGRESSION SERVEUR (inchangÃ©)
    // ----------------------------------------------------------

    effect(() => {

      const courseId =
        this.courseId();

      if (
        courseId &&
        courseId !== loadedCourseId
      ) {

          loadedCourseId =
          courseId;

        // this.loadProgress();
        // this.accessService.loadAccess(courseId);   // âœ… droits d'accÃ¨s

      }

    });


    // ----------------------------------------------------------
    // 2. SÃ‰ANCE EN DIRECT : Ã©tat initial (âœ… effect de PREMIER niveau)
    // ----------------------------------------------------------

    // effect(() => {

    //   const id = this.courseId();

    //   if (id) {
    //     this.liveService.refreshFromServer(id);
    //   }

    // });

    // ----------------------------------------------------------
    // 3. POLLING toutes les 15 s (âœ… HORS effect : une seule fois)
    // ----------------------------------------------------------

    // setInterval(() => {

    //   const id = this.courseId();

    //   if (id) {
    //     this.liveService.refreshFromServer(id);
    //   }

    // }, 15000);


    // ----------------------------------------------------------
    // 4. OUVERTURE PAR DÃ‰FAUT (curriculum / semaines)
    // ----------------------------------------------------------

    effect(() => {

      const curriculum =
        this.curriculum();

      const weeks =
        this.publishedWeeks();

              // ----------------------------------------------------------
      // âœ… PRIORITÃ‰ : ?seq=... (lien Â« Reprendre Â» du dashboard)
      // ----------------------------------------------------------

      const seqParam =
        new URLSearchParams(
          window.location.search
        ).get('seq');


      if (seqParam) {

        this.activeSequenceId.set(
          seqParam
        );

        return;

      }


      // SEMAINES PUBLIÃ‰ES

      if (weeks.length > 0) {

        if (!this.expandedWeekId()) {

          this.expandedWeekId.set(
            weeks[0].id
          );

        }

      }


      // PREMIER CHAPITRE

      const firstChapter =
        curriculum.chapters[0];


      if (!firstChapter) {
        return;
      }


      if (!this.openChapterId()) {

        this.openChapterId.set(
          String(firstChapter.id)
        );

      }


      // PREMIÃˆRE SÃ‰QUENCE

      if (!this.activeSequenceId()) {

        const firstSequence =
          firstChapter.sequences[0];


        if (firstSequence) {

          this.activeSequenceId.set(
            String(firstSequence.id)
          );

        }

      }

    });

  }


  // ============================================================
  // SEMAINES PUBLIÃ‰ES
  // ============================================================

  togglePublishedWeek(
    weekId: string
  ): void {

    this.expandedWeekId.set(

      this.expandedWeekId() === weekId
        ? null
        : weekId

    );

  }


  isWeekUnlocked(
    week: CourseWeek
  ): boolean {

    return this.contentService.isWeekUnlocked(
      this.courseId(),
      week
    );

  }


  progressFor(
    week: CourseWeek
  ) {

    this.progressTick();

    return this.contentService.progressFor(
      this.courseId(),
      week.id
    );

  }


  // ============================================================
  // VIDÃ‰O PUBLIÃ‰E
  // ============================================================

  async selectPublishedVideo(
    week: CourseWeek,
    video: UploadedVideoMeta
  ): Promise<void> {

    if (!this.isWeekUnlocked(week)) {
      return;
    }


    this.selectedWeek.set(
      week
    );

    this.selectedPublishedVideo.set(
      video
    );

    this.selectedAssignment.set(
      null
    );

    this.selectedQuizWeek.set(
      null
    );

    this.activeSequenceId.set(
      null
    );

    this.activeVideoUrl.set(
      null
    );


    const url =
      await this.videoStorage.getVideoUrl(
        video.id
      );


    this.activeVideoUrl.set(

      url ??
      video.videoObjectUrl ??
      null

    );

  }


  // ============================================================
  // DEVOIR PUBLIÃ‰
  // ============================================================

  selectPublishedAssignment(
    week: CourseWeek,
    assignment: WeekAssignment
  ): void {

    if (!this.isWeekUnlocked(week)) {
      return;
    }


    this.selectedWeek.set(
      week
    );

    this.selectedAssignment.set(
      assignment
    );

    this.selectedPublishedVideo.set(
      null
    );

    this.selectedQuizWeek.set(
      null
    );

    this.activeSequenceId.set(
      null
    );

    this.activeVideoUrl.set(
      null
    );

  }


  // ============================================================
  // QUIZ PUBLIÃ‰
  // ============================================================

  selectPublishedQuiz(
    week: CourseWeek
  ): void {

    if (!this.isWeekUnlocked(week)) {
      return;
    }


    this.selectedWeek.set(
      week
    );

    this.selectedQuizWeek.set(
      week
    );

    this.selectedPublishedVideo.set(
      null
    );

    this.selectedAssignment.set(
      null
    );

    this.activeSequenceId.set(
      null
    );

    this.activeVideoUrl.set(
      null
    );


    this.quizAnswers.set({});

    this.quizSubmitted.set(
      false
    );

  }


  // ============================================================
  // FIN DE VIDÃ‰O PUBLIÃ‰E
  // ============================================================

  onPublishedVideoEnded(
    week: CourseWeek,
    video: UploadedVideoMeta
  ): void {

    this.contentService.markVideoWatched(
      this.courseId(),
      week.id,
      video.id
    );


    this.progressTick.update(
      (value) => value + 1
    );

  }


  // ============================================================
  // FORMAT DURÃ‰E
  // ============================================================

  formatDuration(
    seconds: number
  ): string {

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;


    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;

  }

    /**
   * Nettoie le titre d'une séquence pour n'afficher que le texte utile.
   * Ex: "sequence 1: Veuillez suivre cette videos" → "Veuillez suivre cette videos"
   */
  cleanSequenceTitle(title: string): string {
    if (!title) return '';
    // Retire le préfixe "sequence X:" / "séquence X :" (insensible à la casse)
    return title.replace(/^\s*s[ée]quence\s*\d+\s*[:\-–]\s*/i, '').trim();
  }


    // ============================================================
  // modele de cours comme hec paris
  // ============================================================

// ðŸ†• mÃ©thode Ã  ajouter dans la classe CoursePlayer, n'importe oÃ¹ aprÃ¨s formatDuration()
weekEstimatedDuration(week: CourseWeek): string {
  const minutes = computeWeekDuration(week);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

// ðŸ†• signal pour afficher/masquer le transcript sous la vidÃ©o
readonly transcriptOpen = signal(false);
toggleTranscript(): void { this.transcriptOpen.update(v => !v); }


  // ============================================================
  // OUVRIR / FERMER UN CHAPITRE
  // ============================================================

  toggleChapter(
    chapterId: string
  ): void {

    this.openChapterId.set(

      this.openChapterId() === chapterId
        ? null
        : chapterId

    );

  }


  /** Reprendre : ouvre la premiÃ¨re sÃ©quence non terminÃ©e du cours */
goToFirstIncomplete(): void {
  for (const chapter of this.curriculum().chapters) {
    for (const seq of chapter.sequences) {
      if (!seq.completed) {
        // Ouvre le chapitre parent + sÃ©lectionne la sÃ©quence
        this.openChapterId.set(chapter.id);
        this.selectSequence(seq.id);
        return;
      }
    }
  }

  // Si tout est terminÃ©, ouvre la premiÃ¨re sÃ©quence
  const first = this.curriculum().chapters[0]?.sequences[0];
  if (first) {
    this.openChapterId.set(this.curriculum().chapters[0].id);
    this.selectSequence(first.id);
  }
}


  // ============================================================
  // SÃ‰LECTIONNER UNE SÃ‰QUENCE
  // ============================================================

    // ============================================================
  // SÃ‰LECTIONNER UNE SÃ‰QUENCE
  // ============================================================

  selectSequence(
    sequenceId: string
  ): void {

    this.activeSequenceId.set(
      sequenceId
    );


    this.selectedPublishedVideo.set(
      null
    );

    this.selectedAssignment.set(
      null
    );

    this.selectedQuizWeek.set(
      null
    );


    this.quizAnswers.set({});

    this.quizSubmitted.set(
      false
    );

        // ðŸŽ¯ Reset du quiz Laravel
    this.laravelQuizAnswers.set({});
    this.laravelQuizSubmitted.set(false);
    this.laravelQuizScore.set(null);


    const sequence =
      this.findSequenceById(
        sequenceId
      );


    // ----------------------------------------------------------
    // VIDÃ‰O
    // ----------------------------------------------------------

    if (
      sequence?.type === 'video' &&
      sequence.videoUrl
    ) {

      const mediaUrl =
        this.resolveMediaUrl(
          sequence.videoUrl
        );


      this.activeVideoUrl.set(
        mediaUrl
      );

    } else {

      this.activeVideoUrl.set(
        null
      );

    }


    // ----------------------------------------------------------
    // âœ… DEVOIR : charger la soumission existante
    //    (statut, note, feedback du formateur)
    // ----------------------------------------------------------

    if (sequence?.type === 'devoir') {

      this.loadSubmission(
        sequence.id
      );

    }

  }

  // ============================================================
  // TROUVER UNE SÃ‰QUENCE
  // ============================================================

  private findSequenceById(
    sequenceId: string
  ): CourseSequence | undefined {

    for (
      const chapter
      of this.curriculum().chapters
    ) {

      const found =
        chapter.sequences.find(
          (sequence) =>
            String(sequence.id) ===
            String(sequenceId)
        );


      if (found) {
        return found;
      }

    }


    return undefined;

  }


  // ============================================================
  // TRANSFORMER UNE URL MÃ‰DIA
  // ============================================================

  
  

// ============================================================
// URL API LARAVEL
// ============================================================



// ============================================================
// TRANSFORMER UN CHEMIN LARAVEL EN URL
// ============================================================

resolveMediaUrl(
  url: string | null | undefined
): string | null {

  if (!url) {
    return null;
  }

  const value =
    url.trim();

  if (!value) {
    return null;
  }


  // ----------------------------------------------------------
  // URL absolue
  // ----------------------------------------------------------

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:')
  ) {
    return value;
  }


  // ----------------------------------------------------------
  // /storage/...
  // ----------------------------------------------------------

  if (
    value.startsWith('/storage/')
  ) {

    return `${this.apiBaseUrl}${value}`;

  }


  // ----------------------------------------------------------
  // storage/...
  // ----------------------------------------------------------

  if (
    value.startsWith('storage/')
  ) {

    return `${this.apiBaseUrl}/${value}`;

  }


  // ----------------------------------------------------------
  // Chemin relatif Laravel
  //
  // Exemple :
  // sequences-documents/fichier.pdf
  //
  // devient :
  // http://127.0.0.1:8000/storage/sequences-documents/fichier.pdf
  // ----------------------------------------------------------

  const path =
    value.replace(/^\/+/, '');

  return `${this.apiBaseUrl}/storage/${path}`;
}


// ============================================================
// SAVOIR SI UNE URL EST YOUTUBE
// ============================================================

isYoutubeUrl(
  url: string | null | undefined
): boolean {

  if (!url) {
    return false;
  }

  try {

    const parsed =
      new URL(url);

    const hostname =
      parsed.hostname.toLowerCase();

    return (
      hostname === 'youtu.be' ||
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname.endsWith('.youtube.com')
    );

  } catch {

    return false;

  }
}


// ============================================================
// EXTRAIRE L'ID YOUTUBE
// ============================================================

private getYoutubeVideoId(
  url: string
): string | null {

  try {

    const parsed =
      new URL(url);

    const hostname =
      parsed.hostname.toLowerCase();


    // ----------------------------------------------------------
    // https://youtu.be/PaMMnEJZUBk
    // ----------------------------------------------------------

    if (
      hostname === 'youtu.be'
    ) {

      const id =
        parsed.pathname
          .replace(/^\/+/, '')
          .split('/')[0];

      return id || null;
    }


    // ----------------------------------------------------------
    // https://www.youtube.com/watch?v=PaMMnEJZUBk
    // ----------------------------------------------------------

    if (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'm.youtube.com'
    ) {

      if (
        parsed.pathname === '/watch'
      ) {

        return (
          parsed.searchParams.get('v') ??
          null
        );

      }


      // --------------------------------------------------------
      // https://www.youtube.com/embed/PaMMnEJZUBk
      // --------------------------------------------------------

      if (
        parsed.pathname.startsWith('/embed/')
      ) {

        const id =
          parsed.pathname
            .split('/')[2];

        return id || null;

      }


      // --------------------------------------------------------
      // https://www.youtube.com/shorts/PaMMnEJZUBk
      // --------------------------------------------------------

      if (
        parsed.pathname.startsWith('/shorts/')
      ) {

        const id =
          parsed.pathname
            .split('/')[2];

        return id || null;

      }

    }

  } catch {

    return null;

  }


  return null;
}


// ============================================================
// URL YOUTUBE POUR IFRAME
// ============================================================

getYoutubeEmbedUrl(
  url: string | null | undefined
): SafeResourceUrl | null {

  if (!url) {
    return null;
  }

  const videoId =
    this.getYoutubeVideoId(url);

  if (!videoId) {
    return null;
  }


  // Protection minimale :
  // un ID YouTube normal contient uniquement ces caractÃ¨res.

  if (
    !/^[A-Za-z0-9_-]{6,}$/.test(videoId)
  ) {
    return null;
  }


  const embedUrl =
    `https://www.youtube.com/embed/${videoId}`;


  return this.sanitizer
    .bypassSecurityTrustResourceUrl(
      embedUrl
    );
}


// ============================================================
// URL RESOURCE POUR PDF / IFRAME
// ============================================================

getPdfResourceUrl(
  url: string | null | undefined
): SafeResourceUrl | null {

  const mediaUrl =
    this.resolveMediaUrl(url);

  if (!mediaUrl) {
    return null;
  }


  try {

    const parsed =
      new URL(mediaUrl);


    // --------------------------------------------------------
    // On accepte uniquement le serveur Laravel
    // pour les documents locaux.
    // --------------------------------------------------------

    if (
      parsed.origin !==
      this.apiBaseUrl
    ) {

      return null;

    }


    return this.sanitizer
      .bypassSecurityTrustResourceUrl(
        mediaUrl
      );

  } catch {

    return null;

  }
}


// ============================================================
// PDF D'UN DEVOIR PUBLIÃ‰
// ============================================================

safePdfUrl():
  SafeResourceUrl | null {

  const assignment =
    this.selectedAssignment();

  if (!assignment?.attachmentUrl) {
    return null;
  }

  return this.getPdfResourceUrl(
    assignment.attachmentUrl
  );
};



  // ============================================================
  // CONVERTIR UNE URL YOUTUBE EN URL EMBED
  // ============================================================

  private convertYouTubeToEmbedUrl(
    url: string
  ): string | null {

    try {

      const parsedUrl =
        new URL(url);


      const hostname =
        parsedUrl.hostname
          .toLowerCase();


      // --------------------------------------------------------
      // youtu.be/VIDEO_ID
      // --------------------------------------------------------

      if (
        hostname === 'youtu.be'
      ) {

        const videoId =
          parsedUrl.pathname
            .replace(/^\/+/, '')
            .split('/')[0];


        if (videoId) {

          return `https://www.youtube.com/embed/${videoId}`;

        }

      }


      // --------------------------------------------------------
      // youtube.com/watch?v=VIDEO_ID
      // --------------------------------------------------------

      if (
        hostname === 'youtube.com' ||
        hostname === 'www.youtube.com' ||
        hostname === 'm.youtube.com'
      ) {

        if (
          parsedUrl.pathname ===
          '/watch'
        ) {

          const videoId =
            parsedUrl.searchParams.get(
              'v'
            );


          if (videoId) {

            return `https://www.youtube.com/embed/${videoId}`;

          }

        }


        // ------------------------------------------------------
        // youtube.com/embed/VIDEO_ID
        // ------------------------------------------------------

        if (
          parsedUrl.pathname.startsWith(
            '/embed/'
          )
        ) {

          return url;

        }

      }

    } catch (error) {

      console.warn(
        'URL mÃ©dia invalide :',
        url,
        error
      );

    }


    return null;

  }


  // ============================================================
  // SÃ‰QUENCE ACTIVE
  // ============================================================

  get activeSequence():
    CourseSequence | undefined {

    const id =
      this.activeSequenceId();


    if (!id) {
      return undefined;
    }


    return this.findSequenceById(
      id
    );

  }


  // ============================================================
  // NOMBRE TOTAL DE SÃ‰QUENCES
  // ============================================================

  get totalSequences(): number {

    return this.curriculum()
      .chapters
      .reduce(

        (total, chapter) =>
          total +
          chapter.sequences.length,

        0

      );

  }


  // ============================================================
  // NOMBRE DE SÃ‰QUENCES TERMINÃ‰ES
  // ============================================================

  get completedSequences(): number {

    return this.curriculum()
      .chapters
      .reduce(

        (total, chapter) =>
          total +

          chapter.sequences.filter(
            (sequence) =>
              sequence.completed
          ).length,

        0

      );

  }

  // ============================================================
// PROGRESSION SERVEUR LARAVEL
// ============================================================

readonly serverProgress =
  signal(0);

private loadProgress(): void {

  const courseId =
    this.courseId();

  if (!courseId) {
    return;
  }

  // this.http
  //   .get<{ data: { progressPercent: number } }>(
  //     `${this.apiBaseUrl}/api/courses/${courseId}/enrollment-progress`
  //   )
  //   .subscribe({

  //     next: (res) => {

  //       this.serverProgress.set(
  //         Number(
  //           res.data?.progressPercent ?? 0
  //         )
  //       );

  //     },

  //     error: (error) => {

  //       console.error(
  //         'Erreur lors du chargement de la progression :',
  //         error
  //       );

  //     },

  //   });

}


  // ============================================================
  // POURCENTAGE DE PROGRESSION
  // ============================================================


  get progressPercent(): number {
  return this.serverProgress();
}


  // ============================================================
  // RÃ‰PONSE AU QUIZ
  // ============================================================

  selectQuizAnswer(
    questionIndex: number,
    optionIndex: number
  ): void {

    this.quizAnswers.update(
      (current) => ({

        ...current,

        [questionIndex]:
          optionIndex,

      })
    );

  }


  // ============================================================
  // SOUMETTRE LE QUIZ
  // ============================================================

  submitQuiz(): void {

    this.quizSubmitted.set(
      true
    );

  }


  // ============================================================
  // VÃ‰RIFIER UNE RÃ‰PONSE
  // ============================================================

  isCorrectAnswer(
    questionIndex: number,
    optionIndex: number
  ): boolean {

    const sequence =
      this.activeSequence;


      


    // ----------------------------------------------------------
    // QUIZ D'UNE SÃ‰QUENCE LARAVEL
    // ----------------------------------------------------------

    if (
      sequence?.quizQuestions
    ) {

      return (

        sequence
          .quizQuestions[
            questionIndex
          ]
          ?.correctIndex ===
        optionIndex

      );

    }


    // ----------------------------------------------------------
    // QUIZ PUBLIÃ‰ FORMATEUR
    // ----------------------------------------------------------

    const week =
      this.selectedQuizWeek();


    return (

      week
        ?.quiz
        ?.questions[
          questionIndex
        ]
        ?.correctIndex ===
      optionIndex

    );
    

  }


    // ============================================================
  // ðŸŽ¯ QUIZ LARAVEL â€” sÃ©lection, scoring, reset
  // ============================================================
  // ============================================================
  // ðŸŽ¯ QUIZ LARAVEL â€” sÃ©lection, scoring, reset
  // ============================================================

  /**
   * QCM (oi = number) OU texte (value = string).
   * âœ… Toutes les rÃ©ponses sont stockÃ©es en STRING
   *    pour Ã©viter les conflits de typage dans le template.
   */
  selectLaravelQuizAnswer(index: number, value: string | number): void {
    this.laravelQuizAnswers.update((current) => ({
      ...current,
      [index]: String(value),
    }));
  }

  /** QCM : cette option est-elle sÃ©lectionnÃ©e ? (helper template) */
  isQcmSelected(index: number, optionIndex: number): boolean {
    return this.laravelQuizAnswers()[index] === String(optionIndex);
  }

  /** Nombre de questions ayant reÃ§u une rÃ©ponse. (helper template) */
  laravelAnsweredCount(): number {
    return Object.keys(this.laravelQuizAnswers()).length;
  }
    /** Une sÃ©quence est dÃ©verrouillÃ©e si toutes les PRÃ‰CÃ‰DENTES sont complÃ©tÃ©es. */
  /** 
   * Une séquence est déverrouillée :
   * - TOUJOURS pour les vidéos, documents, devoirs, TP, TD
   * - UNIQUEMENT si le quiz précédent est réussi, pour les quiz
   */
  isSequenceUnlocked(sequenceId: string): boolean {
    const chapters = this.curriculum().chapters;

    // On cherche la séquence cible
    for (const chapter of chapters) {
      for (const seq of chapter.sequences) {
        if (String(seq.id) === String(sequenceId)) {
          // Si c'est un quiz, on vérifie que la séquence PRÉCÉDENTE est complétée
          if (seq.type === 'quiz') {
            return this.isPreviousSequenceCompleted(sequenceId);
          }
          // Pour tous les autres types, on autorise toujours
          return true;
        }
      }
    }
    return true; // Par défaut, on autorise (sécurité)
  }

  /** Vérifie si la séquence précédant `sequenceId` est complétée. */
  private isPreviousSequenceCompleted(sequenceId: string): boolean {
    const chapters = this.curriculum().chapters;
    let previousSeq: CourseSequence | null = null;

    for (const chapter of chapters) {
      for (const seq of chapter.sequences) {
        if (String(seq.id) === String(sequenceId)) {
          // Si on a trouvé la cible, on regarde la précédente
          if (previousSeq === null) {
            return true; // C'est la première séquence, pas de blocage
          }
          return previousSeq.completed === true;
        }
        previousSeq = seq;
      }
    }
    return true;
  }

  /** Valide et calcule le score instantanÃ©ment. */

    submitLaravelQuiz(): void {
    const seq = this.activeSequence;
    if (!seq?.quizQuestions?.length) return;

    // VÃ©rifie que chaque question a une rÃ©ponse
    if (this.laravelAnsweredCount() < seq.quizQuestions.length) {
      return;
    }

    this.laravelQuizSubmitting.set(true);

    // âœ… Envoie les rÃ©ponses BRUTES â†’ le backend corrige et note
    // this.http
    //   .post<{ data: { scorePercent: number; passed: boolean; threshold: number } }>(
    //     `${this.apiBaseUrl}/api/sequences/${seq.id}/complete`,
    //     { answers: this.laravelQuizAnswers() }
    //   )
    //   .subscribe({
    //     next: (res) => {
    //       this.laravelQuizSubmitting.set(false);
    //       this.laravelQuizSubmitted.set(true);
    //       this.laravelQuizPassed.set(res.data.passed);
    //       this.laravelQuizScore.set({
    //         score: res.data.scorePercent,
    //         total: 100,
    //       });
    //       this.loadProgress();   // la progression n'avance que si passed
    //     },
    //     error: (err) => {
    //       this.laravelQuizSubmitting.set(false);
    //       alert(err?.error?.message ?? 'Erreur lors de la validation du quiz.');
    //     },
    //   });
  }

  /** Refaire le quiz. */
  resetLaravelQuiz(): void {
    this.laravelQuizAnswers.set({});
    this.laravelQuizSubmitted.set(false);
    this.laravelQuizScore.set(null);
  }

  /** VÃ©rifie une rÃ©ponse donnÃ©e (pour la coloration aprÃ¨s validation). */
  isLaravelAnswerCorrect(index: number, given: string): boolean {
    const q = this.activeSequence?.quizQuestions?.[index];
    if (!q) return false;

    if (q.type === 'texte' || !q.options?.length) {
      return (q.expectedAnswer ?? '').trim().toLowerCase() === (given ?? '').trim().toLowerCase();
    }
    return Number(q.correctIndex) === Number(given);
  }
  


    // ============================================================
  // REJOINDRE LA SÃ‰ANCE EN DIRECT (gated : formule Standard+)
  // ============================================================



  joinLive(): void {
  this.liveService.getJoinUrl(
    this.courseId(),
    (joinUrl, password) => {
      window.open(joinUrl, '_blank', 'noopener,noreferrer');

      if (password) {
        alert(`ðŸ” Mot de passe de la rÃ©union : ${password}`);
      }
    },
    (msg) => alert(msg),   // ex : "incluses dÃ¨s la formule Standard" si Basique
  );
}


  


  // ============================================================
  // TERMINER UNE SÃ‰QUENCE
  // ============================================================


  // ============================================================
// TERMINER UNE SÃ‰QUENCE
// ============================================================

markSequenceDone(): void {

  const sequence =
    this.activeSequence;

  if (!sequence) {
    return;
  }

  const sequenceId =
    Number(sequence.id);

  if (!sequenceId) {
    return;
  }

  // this.http
  //   .post<{ data?: unknown }>(
  //     `${this.apiBaseUrl}/api/sequences/${sequenceId}/complete`,
  //     {}
  //   )
  //   .subscribe({

  //     next: () => {

  //       /*
  //        * Mise Ã  jour visuelle immÃ©diate.
  //        */
  //       sequence.completed = true;

  //       /*
  //        * On force le recalcul de l'interface.
  //        */
  //       this.progressTick.update(
  //         value => value + 1
  //       );

  //       /*
  //        * On recharge la progression rÃ©elle
  //        * depuis Laravel.
  //        */
  //       this.loadProgress();

  //     },

  //     error: (error) => {

  //       console.error(
  //         'Erreur lors de la validation de la sÃ©quence :',
  //         error
  //       );

  //       alert(
  //         error?.error?.message ??
  //         'Impossible de valider cette sÃ©quence.'
  //       );

  //     },

  //   });

  sequence.completed = true;
  this.progressTick.update((v) => v + 1);
  this.serverProgress.update((p) => Math.min(p + 10, 100));


}

//
//
//
  // ============================================================
  // SOUMISSION DE DEVOIRS (gated : formule Standard+)
  // ============================================================

  readonly submissionFile = signal<File | null>(null);
  readonly submissionComment = signal('');
  readonly submitting = signal(false);
  readonly submitSuccess = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);
  readonly currentSubmission = signal<any>(null);

  onSubmissionFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.submissionFile.set(input.files?.[0] ?? null);
  }

  onSubmissionCommentInput(value: string): void {
    this.submissionComment.set(value);
  }

  /** Charge la soumission existante (statut, note, feedback) d'une sÃ©quence. */
  loadSubmission(sequenceId: string): void {
    this.currentSubmission.set(null);
    this.submitSuccess.set(null);
    this.submitError.set(null);
    this.submissionFile.set(null);
    this.submissionComment.set('');

    // this.http
    //   .get<{ data: any }>(
    //     `${this.apiBaseUrl}/api/sequences/${sequenceId}/submission`
    //   )
    //   .subscribe({
    //     next: (res) => this.currentSubmission.set(res.data ?? null),
    //     error: () => {},   // pas encore de soumission : silence
    //   });
  }

    /** URL absolue du fichier de soumission (via LARAVEL, pas Angular). */
  submissionFileUrl(sub: any): string | null {
    if (!sub?.fileUrl) return null;
    if (sub.fileUrl.startsWith('http')) return sub.fileUrl;
    return `${this.apiBaseUrl}${sub.fileUrl}`;
  }

  /** Envoie (ou re-envoie) le devoir â€” upsert cÃ´tÃ© backend. */
  submitAssignmentWork(): void {
    const seq = this.activeSequence;
    if (!seq || this.submitting()) return;

    if (!this.submissionFile()) {
      this.submitError.set('Joins ton fichier (PDF, Word ou ZIP) avant d\'envoyer.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const fd = new FormData();
    fd.append('file', this.submissionFile()!);
    fd.append('comment', this.submissionComment().trim());

    // this.http
    //   .post<{ message: string; data: any }>(
    //     `${this.apiBaseUrl}/api/sequences/${seq.id}/submission`,
    //     fd
    //   )
    //   .subscribe({
    //     next: (res) => {
    //       this.submitting.set(false);
    //       this.submitSuccess.set(res.message ?? 'Devoir soumis avec succÃ¨s !');
    //       this.currentSubmission.set(res.data);
    //       this.submissionFile.set(null);
    //       this.submissionComment.set('');
    //     },
    //     error: (err) => {
    //       this.submitting.set(false);
    //       this.submitError.set(
    //         err?.error?.message ?? "Impossible d'envoyer ton devoir."
    //       );
    //     },
    //   });

      setTimeout(() => {
    this.submitting.set(false);
    this.submitSuccess.set('Devoir soumis avec succès !');
    this.currentSubmission.set({
      status: 'soumis',
      submittedAt: new Date().toISOString(),
      fileUrl: null,
    });
    this.submissionFile.set(null);
    this.submissionComment.set('');
  }, 800);
}
  

// ============================================================
// TÃ‰LÃ‰CHARGER LE CERTIFICAT
// ============================================================



  // ============================================================
  // TÃ‰LÃ‰CHARGER LE CERTIFICAT
  // ============================================================

  downloadCertificate(): void {

    const courseId =
      this.courseId();

    if (!courseId) {
      return;
    }

    // this.http
    //   .post<{
    //       data: {
    //         uuid: string;
    //       };
    //     }>(
    //       `${this.apiBaseUrl}/api/courses/${courseId}/certificate`,
    //       {}
    //     )
    //   .subscribe({

    //     next: (res) => {

    //       const certificateUuid =
    //         res.data?.uuid;

    //       if (!certificateUuid) {

    //         alert(
    //           'Le certificat n\'a pas pu Ãªtre gÃ©nÃ©rÃ©.'
    //         );

    //         return;
    //       }

    //       // âœ… URL de tÃ©lÃ©chargement construite depuis le UUID â€”
    //       //    le endpoint /download gÃ©nÃ¨re le PDF Ã  la volÃ©e.
    //       window.open(
    //         `${this.apiBaseUrl}/api/certificates/${certificateUuid}/download`,
    //         '_blank'
    //       );

    //     },

    //     error: (error) => {

    //       console.error(
    //         'Erreur lors de la gÃ©nÃ©ration du certificat :',
    //         error
    //       );

    //       alert(
    //         error?.error?.message ??
    //         'Erreur lors de la gÃ©nÃ©ration du certificat.'
    //       );

    //     },

    //   });

    

  }
}
