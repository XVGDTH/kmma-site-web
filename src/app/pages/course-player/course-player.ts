import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  OnDestroy,
} from '@angular/core';

import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { CommonModule } from '@angular/common';

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
import { computeWeekDuration } from '../../data/Course builder.model '; // 
// 🆕 Import du composant vidéo + transcript
// import { VideoTranscriptComponent } from '../../shared/video-transcript/video-transcript.component';
import { DEMO_TRANSCRIPT } from '../../shared/video-transcript/video-transcript.types';
import { AuthService } from '../../shared/auth.service';
import { API_URL } from '../../shared/formateur-content.service';







// ============================================================
// TYPE DU COURS RETOURNÉ PAR L'API
// ============================================================



type CourseFromApi = {
  id: string | number;
  instructor?: string;
  instructorRole?: string;
  
  // ✅ Champs d'affichage manquants
  title?: string;
  description?: string;
  category?: string;
  subject?: string;
  level?: string;
  diploma?: string;
  durationFull?: string;
  image?: string | null;
  imageAlt?: string | null;

  chapters?: CourseChapter[];
  modules?: Array<{
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
  finalExam?: CourseSequence | null;

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
    CommonModule,
  ],

  templateUrl: './course-player.html',

  styleUrl: './course-player.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursePlayer implements OnDestroy {
    private livePollingInterval: any;

  // ============================================================
  // SERVICES
  // ============================================================

  private readonly route =
    inject(ActivatedRoute);
    

// Dans la classe CoursePlayer
private readonly authService = inject(AuthService);

// Computed pour l'utilisateur actuel
readonly currentUser = computed(() => this.authService.currentUser());


  private readonly router =
    inject(Router);

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

    // ✅ Signaux pour les notifications
  readonly notificationMessage = signal<string | null>(null);
  readonly notificationType = signal<'success' | 'error'>('success');
  readonly schedules = signal<any[]>([]);

  // Méthode pour afficher une notification
  showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    this.notificationMessage.set(message);
    this.notificationType.set(type);
    setTimeout(() => this.notificationMessage.set(null), 5000);
  }


  // ============================================================
  // COURS CHARGÉ DEPUIS LARAVEL a recommenter pour activer afin d'initialiser le cours depuis l'API Laravel
  // ============================================================

  // ============================================================
//  cours chargé en local avec  API
//  :
// 
//  
// ============================================================
readonly courseDetail = toSignal(
  this.route.paramMap.pipe(
    map((params): string => params.get('id') ?? params.get('courseId') ?? ''),
    switchMap((id: string) => {
      if (!id) return of(null);
      return this.coursesApi.getCourseDetail(id).pipe(
        catchError((err) => {
          console.error('Erreur chargement cours :', err);
          return of(null);
        })
      );
    })
  ),
  { initialValue: null }
);


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
    // 🆕 PRIORITÉ 1 : Structure HEC (modules → chapters → séquences)
    // ============================================================

    if (Array.isArray(course.modules) && course.modules.length > 0) {

      const flatChapters: CourseChapter[] = [];

      // for (const module of course.modules) {
      //   // ✅ On sécurise : si chapters est null/undefined, on utilise []
      //   const moduleChapters = module.chapters || []; 

      //   for (const chapter of moduleChapters) {
      //     // ✅ On sécurise aussi les séquences
      //     const chapterSequences = chapter.sequences || [];

      //     flatChapters.push({
      //       id: String(chapter.id),
      //       title: chapter.title || 'Chapitre sans titre',
      //       position: chapter.position || 1,
      //       weekNumber: chapter.weekNumber ?? null,

      //       // métadonnées du module parent
      //       moduleId: module.id,
      //       moduleTitle: module.title,
      //       modulePosition: module.position,
      //       moduleQuiz: module.moduleQuiz ?? null,

      //       sequences: chapterSequences.map((seq) => ({
      //         id: String(seq.id),
      //         title: seq.title || 'Séquence',
      //         type: seq.type,
      //         duration: seq.duration,
      //         videoUrl: seq.videoUrl,
      //         documentUrl: seq.documentUrl,
      //         quizQuestions: seq.quizQuestions,
      //         instructions: seq.instructions,
      //         completed: seq.completed ?? false,
      //         position: seq.position || 1,
      //       })),
      //     });
      //   }
      // }

      for (const module of course.modules) {
  const moduleChapters = module.chapters || [];

  // Quiz de module normalisé UNE SEULE fois (même objet pour tous les chapitres)
  const moduleQuiz = module.moduleQuiz
    ? {
        ...module.moduleQuiz,
        id: String(module.moduleQuiz.id),
        completed: module.moduleQuiz.completed ?? false,
      }
    : null;

  for (const chapter of moduleChapters) {
    const chapterSequences = chapter.sequences || [];

    flatChapters.push({
      id: String(chapter.id),
      title: chapter.title || 'Chapitre sans titre',
      position: chapter.position || 1,
      weekNumber: chapter.weekNumber ?? null,
      moduleId: module.id,
      moduleTitle: module.title,
      modulePosition: module.position,
      moduleQuiz,
      sequences: chapterSequences.map((seq) => ({
        ...seq,                       // ✅ garde passingScore, deadline, etc.
        id: String(seq.id),
        title: seq.title || 'Séquence',
        completed: seq.completed ?? false,
        position: seq.position || 1,
      })),
    });
  }
}

      return {
        courseId: String(course.id),
        instructor: course.instructor ?? 'Équipe pédagogique KMAA',
        instructorRole: course.instructorRole ?? 'Formateurs experts du domaine',
        chapters: flatChapters,
      };
    }

    // ============================================================
    // PRIORITÉ 2 : Ancien système (chapters directs)
    // ============================================================

    const chapters = course.chapters;

    if (Array.isArray(chapters) && chapters.length > 0) {
      return {
        courseId: String(course.id),
        instructor: course.instructor ?? 'Équipe pédagogique KMAA',
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
    // PRIORITÉ 3 : Fallback statique
    // ============================================================

    return (
      CURRICULA[this.courseId()] ??
      fallbackCurriculum(this.courseId())
    );
  });


  /** 🆕 Examen final (isFinal=true) renvoyé par l'API */
  
readonly finalExam = computed<CourseSequence | null>(() => {
  const course = this.courseDetail() as CourseFromApi | null;
  const exam = course?.finalExam;
  if (!exam) return null;
  return { ...exam, id: String(exam.id), completed: exam.completed ?? false };
});

/** 🆕 Nombre de modules (pour l'affichage) */
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
  // 🏆 MES ÉVALUATIONS (panneau latéral)
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

  /** Clic sur une éval → ouvre la séquence correspondante. */
  goToEvaluation(sequenceId: string): void {
    this.selectSequence(sequenceId);
  }


  // ============================================================
  // CONTENU PUBLIÉ
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
  // ÉTAT DE L'INTERFACE
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
  // SÉQUENCE ACTIVE
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
    video: 'video', 
    document: 'document', 
    quiz: 'quiz', 
    devoir: 'examen final', 
    tp: 'tp', 
    td: 'td',
    cas_pratique: 'cas pratique',
  };
  return map[type] ?? 'document';
}



    // nouveau design pour le style hec paris

    // nouveau design pour le style hec paris

// ============================================================
// 🆕 ONGLETS HORIZONTAUX (façon HEC : Cours / Discussion / Progression...)
// ============================================================



// ============================================================
// 🆕 ONGLETS (mis à jour avec 'replays')
// ============================================================
// readonly activeTab = signal<
//   'cours' | 'discussion' | 'progression' | 'evaluations' | 'calendrier'
//   | 'formule' | 'live' | 'manuels' | 'reglements' | 'replays' | 'ressources'
// >('cours');
readonly activeTab = signal<
  'cours' | 'discussion' | 'progression' | 'evaluations' | 'calendrier'
  | 'formule' | 'live' | 'manuels' | 'reglements' | 'replays' | 'ressources'
  | 'videos' 
>('cours');

setTab(tab:
  'cours' | 'discussion' | 'progression' | 'evaluations' | 'calendrier'
  | 'formule' | 'live' | 'manuels' | 'reglements' | 'replays' | 'ressources'
  | 'videos' 
): void {
  this.activeTab.set(tab);
}
// ✅ Computed : Toutes les vidéos du cours
readonly allVideos = computed(() => {
  const chapters = this.curriculum()?.chapters ?? [];
  return chapters
    .flatMap(c => c.sequences)
    .filter(s => s.type === 'video' && (s.videoUrl || s.documentUrl));
});


// ============================================================
// 🆕 DONNÉES des  Manuels
// ============================================================

// readonly apiManuals = computed(() => {
//   const chapters = this.curriculum()?.chapters ?? [];
//   return chapters
//     .flatMap(c => c.sequences)
//     .filter(s => s.type === 'document' || s.type === 'tp' || s.type === 'td');
// });

//  Tous les documents (Manuels, TD, TP, cas pratiques, devoirs)
readonly apiManuals = computed(() => {
  const chapters = this.curriculum()?.chapters ?? [];
  return chapters
    .flatMap(c => c.sequences)
    .filter(s => 
      s.type === 'document' || 
      s.type === 'tp' || 
      s.type === 'td' || 
      s.type === 'cas_pratique' || 
      s.type === 'devoir'
    );
});

// ============================================================
// 🆕 DONNÉES du Calendrier
// ============================================================
readonly calFilter = signal<'all' | 'live' | 'devoir' | 'quiz' | 'exam'>('all');

setCalFilter(filter: 'all' | 'live' | 'devoir' | 'quiz' | 'exam'): void {
  this.calFilter.set(filter);
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
// fonction pour afficher le type de séquence dans le panneau latéral (ex: "Vidéo", "Support de cours", "Exercice (TD)", etc.)
// ============================================================

typeLabel(type: string): string {
  const map: Record<string, string> = {
    video: 'Vidéo',
    document: 'Support de cours',
    td: 'Exercice (TD)',
    tp: 'Travaux pratiques',
    cas_pratique: 'Cas pratique',
    devoir: 'Devoir',
    quiz: 'Quiz',
  };
  return map[type] ?? type;
}



  // ============================================================
  // lectures des videos depuis l'espace videos 
  // ============================================================

openVideoFromGrid(sequenceId: string): void {
  // 1. On sélectionne la séquence
  this.selectSequence(sequenceId);
  
  // 2. On bascule sur l'onglet "Cours" pour voir le lecteur
  this.setTab('cours');
}


// ✅ Voir une vidéo dans l'onglet Vidéos (sans changer d'onglet)
previewVideo(sequenceId: string): void {
  // On sélectionne la séquence mais on reste sur l'onglet Vidéos
  this.activeSequenceId.set(sequenceId);
  
  // On cherche la séquence pour vérifier si c'est une vidéo
  const sequence = this.findSequenceById(sequenceId);
  if (sequence?.type === 'video' && sequence.videoUrl) {
    this.activeVideoUrl.set(this.resolveMediaUrl(sequence.videoUrl));
  } else {
    this.activeVideoUrl.set(null);
  }
}

// ✅ Télécharger une vidéo
downloadVideo(video: any): void {
  const url = this.resolveMediaUrl(video.videoUrl);
  if (url) {
    window.open(url, '_blank');
  } else {
    alert('Vidéo non disponible au téléchargement.');
  }
}

// ✅ Voir un document dans l'onglet Manuels (sans changer d'onglet)
previewDocument(sequenceId: string): void {
  this.activeSequenceId.set(sequenceId);
}

// ✅ Télécharger un document
downloadDocument(doc: any): void {
  const url = this.resolveMediaUrl(doc.documentUrl);
  if (url) {
    window.open(url, '_blank');
  } else {
    alert('Document non disponible au téléchargement.');
  }
}
  
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

    this.http.post(`${this.apiBaseUrl}/api/sequences/${seq.id}/feedback`, {
      comment: this.feedbackText(),
      rating: this.feedbackRating(),
    }).subscribe({
      next: () => {
        this.feedbackSent.set(true);
        this.showNotification("Merci ! Votre avis a bien été enregistré.");
        this.feedbackText.set('');
        this.feedbackRating.set(null);
      },
      error: (err) => {
        console.error('Erreur feedback', err);
        this.showNotification("Impossible d'envoyer votre avis.", 'error');
      },
    });
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
  // 🎯 QUIZ LARAVEL — moteur de scoring (QCM + texte)
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
    readonly isInstructorPreview = signal<boolean>(false);

    readonly laravelQuizThreshold = signal<number>(0);


  // ============================================================
  // INITIALISATION
  // ============================================================



    constructor() {
          // Mode aperçu formateur
    this.isInstructorPreview.set(
      this.router.url.includes('/formateur/cours/')
    );


    this.liveService.getSchedules(this.courseId()).subscribe({
  next: (schedules) => this.schedules.set(schedules)
});

    let loadedCourseId = '';

    // ----------------------------------------------------------
    // 1. PROGRESSION SERVEUR (inchangé)
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

this.loadProgress();
this.accessService.loadAccess(courseId);

      }

    });




    // ----------------------------------------------------------
    // 2. SÉANCE EN DIRECT : état initial (✅ effect de PREMIER niveau)
    // ----------------------------------------------------------


    // ----------------------------------------------------------
    // 4. OUVERTURE PAR DÉFAUT (curriculum / semaines)
    // ----------------------------------------------------------
    

    effect(() => {

      const curriculum =
        this.curriculum();

      const weeks =
        this.publishedWeeks();

              // ----------------------------------------------------------
      // ✅ PRIORITÉ : ?seq=... (lien « Reprendre » du dashboard)
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


      // SEMAINES PUBLIÉES

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


      // PREMIÈRE SÉQUENCE

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
      // ✅ POLLING POUR LES SESSIONS LIVE
  effect(() => {
    const courseId = this.courseId();
    if (!courseId) return;
        //  Charger les replays
      this.loadReplays();
      

    // Vérification immédiate
    this.liveService.refreshFromServer(courseId);

    // Puis toutes les 10 secondes
    if (this.livePollingInterval) clearInterval(this.livePollingInterval);
    this.livePollingInterval = setInterval(() => {
      this.liveService.refreshFromServer(courseId);
    }, 10000);
  });

  }
    ngOnDestroy(): void {
    if (this.livePollingInterval) clearInterval(this.livePollingInterval);
  }

    // ============================================================
  // ✅ Charger les replays depuis l'API
  // ============================================================
  loadReplays(): void {
    const courseId = this.courseId();
    if (!courseId) return;
    
    // On charge les programmations du cours (qui contiennent les replays)
    this.http.get<{ data: any[] }>(`http://127.0.0.1:8000/api/live-sessions/${courseId}/schedules`)
      .subscribe({
        next: (res) => {
          // On ne garde que les séances passées qui ont un replay_url
          const replays = res.data.filter((s: any) => s.replay_url);
          this.apiReplays.set(replays);
        },
        error: () => this.apiReplays.set([])
      });
  }
  


  // ============================================================
  // SEMAINES PUBLIÉES
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
  // VIDÉO PUBLIÉE
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
  // DEVOIR PUBLIÉ
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
  // QUIZ PUBLIÉ
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
  // FIN DE VIDÉO PUBLIÉE
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
  // FORMAT DURÉE
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

// 🆕 méthode à ajouter dans la classe CoursePlayer, n'importe où après formatDuration()
weekEstimatedDuration(week: CourseWeek): string {
  const minutes = computeWeekDuration(week);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

// 🆕 signal pour afficher/masquer le transcript sous la vidéo
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


  /** Reprendre : ouvre la première séquence non terminée du cours */
goToFirstIncomplete(): void {
  for (const chapter of this.curriculum().chapters) {
    for (const seq of chapter.sequences) {
      if (!seq.completed) {
        // Ouvre le chapitre parent + sélectionne la séquence
        this.openChapterId.set(chapter.id);
        this.selectSequence(seq.id);
        return;
      }
    }
  }

  // Si tout est terminé, ouvre la première séquence
  const first = this.curriculum().chapters[0]?.sequences[0];
  if (first) {
    this.openChapterId.set(this.curriculum().chapters[0].id);
    this.selectSequence(first.id);
  }
}


  // ============================================================
  // SÉLECTIONNER UNE SÉQUENCE
  // ============================================================

    // ============================================================
  // SÉLECTIONNER UNE SÉQUENCE
  // ============================================================

  selectSequence(
    sequenceId: string
  ): void {

    this.activeSequenceId.set(
      sequenceId
    );
    this.laravelQuizPassed.set(false);


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

        // 🎯 Reset du quiz Laravel
    this.laravelQuizAnswers.set({});
    this.laravelQuizSubmitted.set(false);
    this.laravelQuizScore.set(null);


    const sequence =
      this.findSequenceById(
        sequenceId
      );


    // ----------------------------------------------------------
    // VIDÉO
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
    // ✅ DEVOIR : charger la soumission existante
    //    (statut, note, feedback du formateur)
    // ----------------------------------------------------------

    if (sequence && ['devoir', 'tp', 'td', 'cas_pratique'].includes(sequence.type)) {
  this.loadSubmission(sequence.id);
}

  }

  // ============================================================
  // TROUVER UNE SeQUENCE
  // ============================================================

private findSequenceById(sequenceId: string): CourseSequence | undefined {
  const target = String(sequenceId);

  for (const chapter of this.curriculum().chapters) {
    const found = chapter.sequences.find((s) => String(s.id) === target);
    if (found) return found;

    if (chapter.moduleQuiz && String(chapter.moduleQuiz.id) === target) {
      return chapter.moduleQuiz;          // ✅ quiz de fin de module
    }
  }

  const exam = this.finalExam();
  if (exam && String(exam.id) === target) return exam;   // ✅ examen final

  return undefined;
}




  // ============================================================
  // Le quiz de module était affiché sous chaque chapitre du module. 
  // Cette méthode permet de ne l’afficher qu’après le dernier.
  // ============================================================

  isLastChapterOfModule(chapter: CourseChapter): boolean {
  const same = this.curriculum().chapters.filter((c) => c.moduleId === chapter.moduleId);
  return same[same.length - 1]?.id === chapter.id;
}
  

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
  // un ID YouTube normal contient uniquement ces caractères.

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
// PDF D'UN DEVOIR PUBLIÉ
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
        'URL média invalide :',
        url,
        error
      );

    }


    return null;

  }


  // ============================================================
  // SÉQUENCE ACTIVE
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
  // NOMBRE TOTAL DE SÉQUENCES
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
  // NOMBRE DE SÉQUENCES TERMINÉES
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

readonly serverProgress = signal(0);
private loadProgress(): void {
    if (this.isInstructorPreview()) {
    this.serverProgress.set(0);
    return;
  }
  const courseId = this.courseId();
  if (!courseId) return;

  this.http
    .get<{ data: { progressPercent: number } }>(
      `${this.apiBaseUrl}/api/courses/${courseId}/enrollment-progress`
    )
    .subscribe({
      next: (res) => {
        this.serverProgress.set(Number(res.data?.progressPercent ?? 0));
      },
      error: (error) => {
        console.error('Erreur chargement progression :', error);
      },
    });
}


// ✅ Statistiques détaillées de progression
readonly progressStats = computed(() => {
  const chapters = this.curriculum()?.chapters ?? [];
  const total = chapters.reduce((sum, c) => sum + c.sequences.length, 0);
  const completed = chapters.reduce(
    (sum, c) => sum + c.sequences.filter(s => s.completed).length, 
    0
  );
  
  // ✅ On utilise le progressPercent de l'API comme source de vérité
  const percent = this.serverProgress(); // ← C'est ça la clé !
  
  // Les détails (complétées / restantes) sont calculés localement
  const remaining = total - completed;

  return { 
    total, 
    completed: Math.round((percent / 100) * total), // On recalcule pour cohérence
    remaining: total - Math.round((percent / 100) * total), 
    percent 
  };
});

// ✅ Progression par module (chapitre)
readonly moduleProgress = computed(() => {
  const chapters = this.curriculum()?.chapters ?? [];
  return chapters.map(chapter => {
    const total = chapter.sequences.length;
    const completed = chapter.sequences.filter(s => s.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      id: chapter.id,
      title: chapter.title,
      weekNumber: chapter.weekNumber,
      total,
      completed,
      percent,
    };
  });
});

// ✅ Nombre de séquences par type
readonly sequencesByType = computed(() => {
  const chapters = this.curriculum()?.chapters ?? [];
  const all = chapters.flatMap(c => c.sequences);
  return {
    videos: all.filter(s => s.type === 'video').length,
    documents: all.filter(s => ['document', 'td', 'tp', 'cas_pratique', 'devoir'].includes(s.type)).length,
    quizzes: all.filter(s => s.type === 'quiz').length,
  };
});


  // ============================================================
  // POURCENTAGE DE PROGRESSION
  // ============================================================


//   get progressPercent(): number {
//   return this.serverProgress();
// }

readonly progressPercent = this.serverProgress.asReadonly();


  // ============================================================
  // RÉPONSE AU QUIZ
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
  // VÉRIFIER UNE RÉPONSE
  // ============================================================

  isCorrectAnswer(
    questionIndex: number,
    optionIndex: number
  ): boolean {

    const sequence =
      this.activeSequence;


      


    // ----------------------------------------------------------
    // QUIZ D'UNE SÉQUENCE LARAVEL
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
    // QUIZ PUBLIÉ FORMATEUR
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
  // 🎯 QUIZ LARAVEL — sélection, scoring, reset
  // ============================================================
  // ============================================================
  // 🎯 QUIZ LARAVEL — sélection, scoring, reset
  // ============================================================

  /**
   * QCM (oi = number) OU texte (value = string).
   * ✅ Toutes les réponses sont stockées en STRING
   *    pour éviter les conflits de typage dans le template.
   */
  selectLaravelQuizAnswer(index: number, value: string | number): void {
    this.laravelQuizAnswers.update((current) => ({
      ...current,
      [index]: String(value),
    }));
  }

  /** QCM : cette option est-elle sélectionnée ? (helper template) */
  isQcmSelected(index: number, optionIndex: number): boolean {
    return this.laravelQuizAnswers()[index] === String(optionIndex);
  }

  /** Nombre de questions ayant reçu une réponse. (helper template) */
  laravelAnsweredCount(): number {
    return Object.keys(this.laravelQuizAnswers()).length;
  }
    /** Une séquence est déverrouillée si toutes les PRÉCÉDENTES sont complétées. */
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

  /** Valide et calcule le score instantanément. */

  submitLaravelQuiz(): void {
    const seq = this.activeSequence;
    if (!seq?.quizQuestions?.length) return;

    // Vérifie que l'apprenant a répondu à toutes les questions
    if (this.laravelAnsweredCount() < seq.quizQuestions.length) {
      return;
    }

    this.laravelQuizSubmitting.set(true);

    // ✅ APPEL API RÉEL : Le backend va corriger le quiz, enregistrer la note 
    // et faire avancer la progression si la note est suffisante.
    this.http
      .post<{ data: { scorePercent: number; passed: boolean; threshold: number } }>(
        `${this.apiBaseUrl}/api/sequences/${seq.id}/complete`,
        { answers: this.laravelQuizAnswers() }
      )
      .subscribe({
        // next: (res) => {
        //   this.laravelQuizSubmitting.set(false);
        //   this.laravelQuizSubmitted.set(true);
        //   this.laravelQuizPassed.set(res.data.passed);
        //   this.laravelQuizScore.set({
        //     score: res.data.scorePercent,
        //     total: 100,
        //   });
          
        //   // ✅ On rafraîchit la progression globale
        //   this.loadProgress(); 
        // },

      next: (res) => {
  this.laravelQuizSubmitting.set(false);
  this.laravelQuizSubmitted.set(true);
  this.laravelQuizPassed.set(res.data.passed);
  this.laravelQuizThreshold.set(res.data.threshold ?? seq.passingScore ?? 0);
  this.laravelQuizScore.set({ score: res.data.scorePercent, total: 100 });

  if (res.data.passed) {
    seq.completed = true;                       // débloque la suite
    this.progressTick.update((v) => v + 1);
  }
  this.loadProgress();
},
        error: (err) => {
          this.laravelQuizSubmitting.set(false);
          alert(err?.error?.message ?? 'Erreur lors de la validation du quiz.');
        },
      });
  }

  /** Refaire le quiz. */
  resetLaravelQuiz(): void {
    this.laravelQuizPassed.set(false);
    this.laravelQuizAnswers.set({});
    this.laravelQuizSubmitted.set(false);
    this.laravelQuizScore.set(null);
  }

  /** Vérifie une réponse donnée (pour la coloration après validation). */
  isLaravelAnswerCorrect(index: number, given: string): boolean {
    const q = this.activeSequence?.quizQuestions?.[index];
    if (!q) return false;

    if (q.type === 'texte' || !q.options?.length) {
      return (q.expectedAnswer ?? '').trim().toLowerCase() === (given ?? '').trim().toLowerCase();
    }
    return Number(q.correctIndex) === Number(given);
  }
  


    // ============================================================
  // REJOINDRE LA SÉANCE EN DIRECT (gated : formule Standard+)
  // ============================================================



  joinLive(): void {
  this.liveService.getJoinUrl(
    this.courseId(),
    (joinUrl, password) => {
      window.open(joinUrl, '_blank', 'noopener,noreferrer');

      if (password) {
        alert(`🔐 Mot de passe de la réunion : ${password}`);
      }
    },
    (msg) => alert(msg),   // ex : "incluses dès la formule Standard" si Basique
  );
}


  


  // ============================================================
  // TERMINER UNE SÉQUENCE
  // ============================================================


  // ============================================================
// TERMINER UNE SÉQUENCE
// ============================================================

markSequenceDone(): void {
  const sequence = this.activeSequence;
  if (!sequence) return;

  const sequenceId = Number(sequence.id);
  if (!sequenceId) return;

  this.http
    .post<{ data?: unknown }>(
      `${this.apiBaseUrl}/api/sequences/${sequenceId}/complete`,
      {}
    )
    .subscribe({
      next: () => {
        sequence.completed = true;
        this.progressTick.update((v) => v + 1);
        this.loadProgress();
      },
      error: (error) => {
        console.error('Erreur validation séquence :', error);
        alert(error?.error?.message ?? 'Impossible de valider cette séquence.');
      },
    });
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

  /** Charge la soumission existante (statut, note, feedback) d'une séquence. */
  /** Charge la soumission existante (statut, note, feedback) d'une séquence. */
  loadSubmission(sequenceId: string): void {
    this.currentSubmission.set(null);
    this.submitSuccess.set(null);
    this.submitError.set(null);
    this.submissionFile.set(null);
    this.submissionComment.set('');

    // ✅ APPEL API RÉEL : Récupère le devoir de l'apprenant pour cette séquence
    this.http
      .get<{ data: any }>(
        `${this.apiBaseUrl}/api/sequences/${sequenceId}/submission`
      )
      .subscribe({
        next: (res) => this.currentSubmission.set(res.data ?? null),
        error: () => {}, // Pas encore de soumission : on ignore silencieusement
      });
  }

    /** URL absolue du fichier de soumission (via LARAVEL, pas Angular). */
  submissionFileUrl(sub: any): string | null {
    if (!sub?.fileUrl) return null;
    if (sub.fileUrl.startsWith('http')) return sub.fileUrl;
    return `${this.apiBaseUrl}${sub.fileUrl}`;
  }

  /** Envoie (ou re-envoie) le devoir — upsert côté backend. */
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

    // ✅ APPEL API RÉEL : Envoie le fichier au backend (Laravel s'occupe de le stocker)
    this.http
      .post<{ message: string; data: any }>(
        `${this.apiBaseUrl}/api/sequences/${seq.id}/submission`,
        fd
      )
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.submitSuccess.set(res.message ?? 'Devoir soumis avec succès !');
          this.currentSubmission.set(res.data);
          this.submissionFile.set(null);
          this.submissionComment.set('');
          this.markSequenceDone();
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(
            err?.error?.message ?? "Impossible d'envoyer ton devoir."
          );
        },
      });
  }
  

// ============================================================
// TÉLÉCHARGER LE CERTIFICAT
// ============================================================



  // ============================================================
  // TÉLÉCHARGER LE CERTIFICAT
  // ============================================================

    downloadCertificate(): void {
    const courseId = this.courseId();
    if (!courseId) return;

    // ✅ APPEL API RÉEL : Demande au backend de générer (ou récupérer) le certificat
    this.http
      .post<{ data: { uuid: string } }>(
        `${this.apiBaseUrl}/api/courses/${courseId}/certificate`,
        {}
      )
      .subscribe({
        next: (res) => {
          const certificateUuid = res.data?.uuid;

          if (!certificateUuid) {
            alert('Le certificat n\'a pas pu être généré.');
            return;
          }

          // ✅ Ouvre le PDF généré par Laravel dans un nouvel onglet
          window.open(
            `${this.apiBaseUrl}/api/certificates/${certificateUuid}/download`,
            '_blank'
          );
        },
        error: (error) => {
          console.error('Erreur lors de la génération du certificat :', error);
          alert(
            error?.error?.message ??
            'Erreur lors de la génération du certificat.'
          );
        },
      });
  }

  // ============================================================
// 🆕 VIDÉO + TRANSCRIPT SYNCHRONISÉ
// ============================================================


  // ============================================================
  //
  // ============================================================

  // Replays (à connecter plus tard à une vraie API)
readonly filteredCalendarEvents = computed(() => {
  const chapters = this.curriculum()?.chapters ?? [];
  const events: any[] = [];

  // 1. Devoirs et cas pratiques avec deadline
  chapters.forEach((chapter: any) => {
    chapter.sequences.forEach((seq: any) => {
      if (seq.deadline && (seq.type === 'devoir' || seq.type === 'cas_pratique')) {
        events.push({
          id: seq.id,
          type: 'devoir',
          day: new Date(seq.deadline).getDate().toString(),
          month: new Date(seq.deadline).toLocaleString('fr-FR', { month: 'short' }),
          title: seq.title,
          description: 'Date limite de rendu',
          time: 'Avant 23h59',
          status: new Date(seq.deadline) < new Date() ? 'past' : 'upcoming'
        });
      }
    });
  });

  // 2. Quiz de fin de chapitre
  chapters.forEach((chapter: any) => {
    chapter.sequences.forEach((seq: any) => {
      if (seq.type === 'quiz') {
        events.push({
          id: seq.id,
          type: 'quiz',
          day: '—',
          month: '',
          title: seq.title,
          description: 'Quiz de validation',
          time: 'À tout moment',
          status: 'upcoming'
        });
      }
    });
  });

  // 3. Quiz de fin de module
  chapters.forEach((chapter: any) => {
    if (chapter.moduleQuiz) {
      events.push({
        id: chapter.moduleQuiz.id,
        type: 'quiz',
        day: '—',
        month: '',
        title: chapter.moduleQuiz.title,
        description: 'Quiz de fin de module',
        time: 'À tout moment',
        status: 'upcoming'
      });
    }
  });

  // 4. Examen final
  const exam = this.finalExam();
  if (exam) {
    events.push({
      id: exam.id,
      type: 'exam',
      day: '—',
      month: '',
      title: exam.title,
      description: 'Examen final du cours',
      time: 'Score requis : ' + (exam.passingScore ?? 70) + '%',
      status: 'upcoming'
    });
  }

  // 5. Sessions en direct programmées
  this.schedules().forEach((schedule: any) => {
    events.push({
      id: 'live-' + schedule.id,
      type: 'live',
      day: new Date(schedule.scheduled_at).getDate().toString(),
      month: new Date(schedule.scheduled_at).toLocaleString('fr-FR', { month: 'short' }),
      title: 'Session en direct programmée',
      description: 'Rejoignez la visioconférence',
      time: new Date(schedule.scheduled_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: new Date(schedule.scheduled_at) < new Date() ? 'past' : 'upcoming'
    });
  });

  // 6. Appliquer le filtre
  const filter = this.calFilter();
  if (filter === 'all') return events;
  return events.filter(e => e.type === filter);
});
readonly apiReplays = signal<any[]>([]);


  

}
