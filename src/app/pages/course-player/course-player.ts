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

// import type {
//   CourseWeek,
//   UploadedVideoMeta,
//   WeekAssignment,
// } from '../../data/Course builder.model ';

import { CoursesApiService } from '../../shared/courses-api.service';
import { HttpClient } from '@angular/common/http';
import { CourseAccessService } from '../../shared/course-access.service';

// en haut, dans les imports depuis '../../data/Course builder.model '
import type {
  CourseWeek,
  UploadedVideoMeta,
  WeekAssignment,
} from '../../data/Course builder.model ';
import { computeWeekDuration } from '../../data/Course builder.model '; // 🆕






// ============================================================
// TYPE DU COURS RETOURNÉ PAR L'API
// ============================================================

// type CourseFromApi = {
//   id: string | number;

//   instructor?: string;

//   instructorRole?: string;

//   chapters?: CourseChapter[];

//   [key: string]: unknown;
// };

type CourseFromApi = {
  id: string | number;
  instructor?: string;
  instructorRole?: string;

  chapters?: CourseChapter[];       // ancien système
  modules?: Array<{                 // 🆕 nouveau système HEC
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
  finalExam?: CourseSequence | null; // 🆕

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
  // COURS CHARGÉ DEPUIS LARAVEL
  // ============================================================

  readonly courseDetail = toSignal(
    this.route.paramMap.pipe(

      map(
        (params): string =>
          params.get('id') ??
          params.get('courseId') ??
          ''
      ),

      switchMap(
        (id: string) => {

          if (!id) {
            return of(null);
          }

          return this.coursesApi
            .getCourseDetail(id)
            .pipe(

              catchError((error) => {

                console.error(
                  'Erreur lors du chargement du cours depuis Laravel :',
                  error
                );

                return of(null);
              })

            );
        }
      )

    ),

    {
      initialValue: null,
    }
  );


  // ============================================================
  // COURS ACTUEL
  // ============================================================

  readonly course = computed(() => {

    return this.courseDetail() ?? undefined;

  });


  // ============================================================
  // CURRICULUM
  // ============================================================

  // readonly curriculum =
  //   computed<CourseCurriculum>(() => {

  //     const course =
  //       this.courseDetail() as CourseFromApi | null;

  //     const chapters =
  //       course?.chapters;


  //     // ----------------------------------------------------------
  //     // CURRICULUM LARAVEL
  //     // ----------------------------------------------------------

  //     if (
  //       course &&
  //       Array.isArray(chapters) &&
  //       chapters.length > 0
  //     ) {

  //       return {

  //         courseId:
  //           String(course.id),

  //         instructor:
  //           course.instructor ??
  //           'Équipe pédagogique KMAA',

  //         instructorRole:
  //           course.instructorRole ??
  //           'Formateurs experts du domaine',

  //         chapters:
  //           chapters.map(
  //             (chapter: CourseChapter) => ({

  //               id:
  //                 String(chapter.id),

  //               title:
  //                 chapter.title,

  //               position:
  //                 chapter.position,

  //               sequences:
  //                 (chapter.sequences ?? [])
  //                   .map(
  //                     (sequence: CourseSequence) => ({

  //                       id:
  //                         String(sequence.id),

  //                       title:
  //                         sequence.title,

  //                       type:
  //                         sequence.type,

  //                       duration:
  //                         sequence.duration,

  //                       videoUrl:
  //                         sequence.videoUrl,

  //                       documentUrl:
  //                         sequence.documentUrl,

  //                       quizQuestions:
  //                         sequence.quizQuestions,

  //                       instructions:
  //                         sequence.instructions,

  //                       completed:
  //                         sequence.completed ?? false,

  //                       position:
  //                         sequence.position,

  //                     })
  //                   ),

  //             })
  //           ),

  //       };
  //     }


  //     // ----------------------------------------------------------
  //     // FALLBACK CURRICULUM STATIQUE
  //     // ----------------------------------------------------------

  //     return (
  //       CURRICULA[this.courseId()] ??
  //       fallbackCurriculum(this.courseId())
  //     );

  //   });


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

      for (const module of course.modules) {
        for (const chapter of module.chapters) {

          flatChapters.push({
            id: String(chapter.id),
            title: chapter.title,
            position: chapter.position,
            weekNumber: chapter.weekNumber ?? null,

            // 🆕 métadonnées du module parent (pour l'affichage groupé)
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


  // ============================================================
  // INITIALISATION
  // ============================================================



    constructor() {

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
        this.accessService.loadAccess(courseId);   // ✅ droits d'accès

      }

    });


    // ----------------------------------------------------------
    // 2. SÉANCE EN DIRECT : état initial (✅ effect de PREMIER niveau)
    // ----------------------------------------------------------

    effect(() => {

      const id = this.courseId();

      if (id) {
        this.liveService.refreshFromServer(id);
      }

    });

    // ----------------------------------------------------------
    // 3. POLLING toutes les 15 s (✅ HORS effect : une seule fois)
    // ----------------------------------------------------------

    setInterval(() => {

      const id = this.courseId();

      if (id) {
        this.liveService.refreshFromServer(id);
      }

    }, 15000);


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

    if (sequence?.type === 'devoir') {

      this.loadSubmission(
        sequence.id
      );

    }

  }

  // ============================================================
  // TROUVER UNE SÉQUENCE
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
  // TRANSFORMER UNE URL MÉDIA
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

readonly serverProgress =
  signal(0);

private loadProgress(): void {

  const courseId =
    this.courseId();

  if (!courseId) {
    return;
  }

  this.http
    .get<{ data: { progressPercent: number } }>(
      `${this.apiBaseUrl}/api/courses/${courseId}/enrollment-progress`
    )
    .subscribe({

      next: (res) => {

        this.serverProgress.set(
          Number(
            res.data?.progressPercent ?? 0
          )
        );

      },

      error: (error) => {

        console.error(
          'Erreur lors du chargement de la progression :',
          error
        );

      },

    });

}


  // ============================================================
  // POURCENTAGE DE PROGRESSION
  // ============================================================


  get progressPercent(): number {
  return this.serverProgress();
}


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
  isSequenceUnlocked(sequenceId: string): boolean {
    const chapters = this.curriculum().chapters;

    for (const chapter of chapters) {
      for (const seq of chapter.sequences) {
        if (String(seq.id) === String(sequenceId)) {
          return true;   // on est arrivé à la cible → tout est ok
        }
        if (!seq.completed) {
          return false;  // une séquence antérieure non complétée (quiz raté inclus) bloque
        }
      }
    }
    return false;
  }

  /** Valide et calcule le score instantanément. */

  //   submitLaravelQuiz(): void {
  //   const seq = this.activeSequence;
  //   if (!seq?.quizQuestions?.length) return;

  //   // Vérifie que chaque question a une réponse
  //   if (this.laravelAnsweredCount() < seq.quizQuestions.length) {
  //     return;
  //   }

  //   this.laravelQuizSubmitting.set(true);

  //   // ✅ Envoie les réponses BRUTES → le backend corrige et note
  //   this.http
  //     .post<{ data: { scorePercent: number; passed: boolean; threshold: number } }>(
  //       `${this.apiBaseUrl}/api/sequences/${seq.id}/complete`,
  //       { answers: this.laravelQuizAnswers() }
  //     )
  //     .subscribe({
  //       next: (res) => {
  //         this.laravelQuizSubmitting.set(false);
  //         this.laravelQuizSubmitted.set(true);
  //         this.laravelQuizScore.set({
  //           score: res.data.scorePercent,
  //           total: 100,
  //         });
  //         this.laravelQuizPassed.set(res.data.passed);
  //         this.loadProgress();   // la progression n'avance que si passed
  //       },
  //       error: (err) => {
  //         this.laravelQuizSubmitting.set(false);
  //         alert(err?.error?.message ?? 'Erreur lors de la validation du quiz.');
  //       },
  //     });
  // }

    submitLaravelQuiz(): void {
    const seq = this.activeSequence;
    if (!seq?.quizQuestions?.length) return;

    // Vérifie que chaque question a une réponse
    if (this.laravelAnsweredCount() < seq.quizQuestions.length) {
      return;
    }

    this.laravelQuizSubmitting.set(true);

    // ✅ Envoie les réponses BRUTES → le backend corrige et note
    this.http
      .post<{ data: { scorePercent: number; passed: boolean; threshold: number } }>(
        `${this.apiBaseUrl}/api/sequences/${seq.id}/complete`,
        { answers: this.laravelQuizAnswers() }
      )
      .subscribe({
        next: (res) => {
          this.laravelQuizSubmitting.set(false);
          this.laravelQuizSubmitted.set(true);
          this.laravelQuizPassed.set(res.data.passed);
          this.laravelQuizScore.set({
            score: res.data.scorePercent,
            total: 100,
          });
          this.loadProgress();   // la progression n'avance que si passed
        },
        error: (err) => {
          this.laravelQuizSubmitting.set(false);
          alert(err?.error?.message ?? 'Erreur lors de la validation du quiz.');
        },
      });
  }

  /** Refaire le quiz. */
  resetLaravelQuiz(): void {
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

  // joinLive(): void {
  //   this.liveService.getJoinRoom(
  //     this.courseId(),
  //     (roomName) => window.open(`https://meet.jit.si/${roomName}`, '_blank'),
  //     (msg) => alert(msg),   // ex : "incluses dès la formule Standard" si Basique
  //   );
  // }

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

  this.http
    .post<{ data?: unknown }>(
      `${this.apiBaseUrl}/api/sequences/${sequenceId}/complete`,
      {}
    )
    .subscribe({

      next: () => {

        /*
         * Mise à jour visuelle immédiate.
         */
        sequence.completed = true;

        /*
         * On force le recalcul de l'interface.
         */
        this.progressTick.update(
          value => value + 1
        );

        /*
         * On recharge la progression réelle
         * depuis Laravel.
         */
        this.loadProgress();

      },

      error: (error) => {

        console.error(
          'Erreur lors de la validation de la séquence :',
          error
        );

        alert(
          error?.error?.message ??
          'Impossible de valider cette séquence.'
        );

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
  loadSubmission(sequenceId: string): void {
    this.currentSubmission.set(null);
    this.submitSuccess.set(null);
    this.submitError.set(null);
    this.submissionFile.set(null);
    this.submissionComment.set('');

    this.http
      .get<{ data: any }>(
        `${this.apiBaseUrl}/api/sequences/${sequenceId}/submission`
      )
      .subscribe({
        next: (res) => this.currentSubmission.set(res.data ?? null),
        error: () => {},   // pas encore de soumission : silence
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

    const courseId =
      this.courseId();

    if (!courseId) {
      return;
    }

    this.http
      .post<{
          data: {
            uuid: string;
          };
        }>(
          `${this.apiBaseUrl}/api/courses/${courseId}/certificate`,
          {}
        )
      .subscribe({

        next: (res) => {

          const certificateUuid =
            res.data?.uuid;

          if (!certificateUuid) {

            alert(
              'Le certificat n\'a pas pu être généré.'
            );

            return;
          }

          // ✅ URL de téléchargement construite depuis le UUID —
          //    le endpoint /download génère le PDF à la volée.
          window.open(
            `${this.apiBaseUrl}/api/certificates/${certificateUuid}/download`,
            '_blank'
          );

        },

        error: (error) => {

          console.error(
            'Erreur lors de la génération du certificat :',
            error
          );

          alert(
            error?.error?.message ??
            'Erreur lors de la génération du certificat.'
          );

        },

      });

  }
}
