import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import {
  SUBMISSIONS,
  Submission,
  FormateurForumThread,
  FormateurForumReply,
} from '../../../data/formateur';

import { LiveSessionService } from '../../../shared/live-session.service';
import { CourseContentService } from '../../../shared/course-content.service';
import { CourseWeek } from '../../../data/Course builder.model ';
import {
  CourseContentDto,
  toAbsoluteUrl,
} from '../../../shared/formateur-content.service';
import { AuthService } from '../../../shared/auth.service';


// ============================================================
// API
// ============================================================

const API_URL = 'http://127.0.0.1:8000/api';

// reception des devoirs  soumis par les apprenants

const LARAVEL_URL = 'http://127.0.0.1:8000';

interface ApiSubmission {
  id: string;
  studentName: string;
  sequenceTitle: string;
  courseTitle: string;
  status: 'soumis' | 'corrige' | 'retourne';
  grade: number | null;
  feedback: string | null;
  fileUrl: string | null;
  comment: string | null;
  submittedAt: string;
}


// ============================================================
// STRUCTURE D'UN COURS RENVOYÉ PAR LARAVEL
// ============================================================

type ApiCourse = {

  /**
   * Identifiant public du cours.
   * Correspond actuellement au slug.
   */
  id: string;

  /**
   * Identifiant SQL réel du cours.
   */
  courseId?: number;

  title: string;

  slug?: string;

  subject?: string;
  category?: string;

  level?: string;
  diploma?: string;

  durationFull?: string;
  durationAlternance?: string;

  image?: string;
  imageAlt?: string;

  popular?: boolean;
  badge?: string | null;

  route?: string;

  description?: string;

  isFree?: boolean;
  hasCertificate?: boolean;
};


// ============================================================
// STRUCTURE INTERNE DU DASHBOARD
// ============================================================

type DashboardCourseItem = {

  course: ApiCourse;

  stat: {
    enrolledCount: number;
    onlineNow: number;
    completionRate: number;
  };

  live: ReturnType<LiveSessionService['getSession']>;

  weeks: CourseWeek[];
};


// ============================================================
// COMPOSANT
// ============================================================

@Component({

  selector: 'app-formateur-dashboard',

  standalone: true,

  imports: [
    RouterLink,
  ],

  templateUrl: './formateur-dashboard.html',

  styleUrl: './formateur-dashboard.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormateurDashboard {


  // ==========================================================
  // SERVICES
  // ==========================================================

  private readonly liveService =
    inject(LiveSessionService);

  private readonly contentService =
    inject(CourseContentService);

  private readonly http =
    inject(HttpClient);
      private readonly authService =
    inject(AuthService);



  // ==========================================================
  // INFORMATIONS DU FORMATEUR
  // ==========================================================

  // ==========================================================
  // INFORMATIONS DU FORMATEUR CONNECTÉ (depuis l'API)
  // ==========================================================

  readonly currentUser =
    computed(() => this.authService.currentUser());

  readonly instructorName =
    computed(() =>
      this.currentUser()?.name?.trim() || 'Formateur'
    );

  readonly instructorEmail =
    computed(() => this.currentUser()?.email ?? '');

  /** Initiales pour l'avatar (ex : "Martial YAOGO" → "MY"). */
  readonly instructorInitials =
    computed(() =>
      this.instructorName()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
    );

  readonly instructorAvatar =
    computed(() => this.currentUser()?.avatar ?? null);
  // ==========================================================
  // COURS DU FORMATEUR
  // ==========================================================

  readonly myCourses =
    signal<DashboardCourseItem[]>([]);

      // ==========================================================
  // CONTENUS PUBLIÉS (chapitres/séquences depuis l'API)
  // ==========================================================

  /** Contenu de chaque cours, chargé depuis l'API. */
  readonly courseContents = signal<Record<number, CourseContentDto>>({});

  /** Cours ayant du contenu, pour la section « Contenus publiés ». */
  readonly publishedContents = computed(() =>
    this.myCourses().flatMap((item) => {
      const id = Number(item.course.courseId ?? item.course.id);
      const content = this.courseContents()[id];

      if (!content || content.chapters.length === 0) return [];

      return [{ course: item.course, content }];
    })
  );

  readonly totalPublishedSequences = computed(() =>
    this.publishedContents().reduce(
      (sum, item) =>
        sum + item.content.chapters.reduce((s, ch) => s + ch.sequences.length, 0),
      0
    )
  );

  assetUrl(url: string | null | undefined): string | null {
    return toAbsoluteUrl(url);
  }

  private loadCourseContents(items: DashboardCourseItem[]): void {
    items.forEach((item) => {
      const id = Number(item.course.courseId ?? item.course.id);

      if (!Number.isFinite(id) || id <= 0) return;

      this.http
        .get<{ data: CourseContentDto }>(
          `${API_URL}/formateur/courses/${id}/content`
        )
        .subscribe({
          next: (res) =>
            this.courseContents.update((map) => ({ ...map, [id]: res.data })),
          error: () => { /* cours sans contenu : ignoré */ },
        });
    });
  }


  readonly coursesLoading =
    signal(false);


  readonly coursesError =
    signal<string | null>(null);



  // ==========================================================
  // FORUM DU FORMATEUR
  // ==========================================================

  readonly forumThreads =
    signal<FormateurForumThread[]>([]);


  readonly forumLoading =
    signal(false);


  readonly forumError =
    signal<string | null>(null);



  // ==========================================================
  // INTERACTION AVEC UNE DISCUSSION
  // ==========================================================

  /**
   * ID de la discussion actuellement ouverte.
   *
   * null = aucune discussion ouverte.
   */
  readonly expandedThreadId =
    signal<number | null>(null);


  /**
   * ID de la discussion pour laquelle
   * le formulaire de réponse est ouvert.
   */
  readonly replyingThreadId =
    signal<number | null>(null);


  /**
   * ID de la discussion dont la réponse
   * est actuellement envoyée.
   */
  readonly replyLoadingId =
    signal<number | null>(null);


  /**
   * Message d'erreur concernant une réponse.
   */
  readonly replyError =
    signal<string | null>(null);


  /**
   * ID de la discussion concernée par l'erreur.
   */
  readonly replyErrorForThread =
    signal<number | null>(null);


  /**
   * ID de la discussion actuellement
   * en cours de résolution.
   */
  readonly resolvingThreadId =
    signal<number | null>(null);



  // ==========================================================
  // STATISTIQUES DU FORUM
  // ==========================================================

  readonly totalForumThreads =
    computed(() =>
      this.forumThreads().length
    );


  readonly unresolvedForumThreads =
    computed(() =>
      this.forumThreads().filter(
        (thread) => !thread.resolved
      )
    );


  readonly resolvedForumThreads =
    computed(() =>
      this.forumThreads().filter(
        (thread) => thread.resolved
      )
    );


  readonly totalForumReplies =
    computed(() =>
      this.forumThreads().reduce(
        (total, thread) =>
          total +
          (thread.replies?.length ?? 0),
        0
      )
    );


  readonly forumQuestionsToHandle =
    computed(() =>
      this.forumThreads().filter(
        (thread) =>
          !thread.resolved &&
          (thread.replies?.length ?? 0) === 0
      )
    );



  // ==========================================================
  // CONSTRUCTEUR
  // ==========================================================

  constructor() {

    this.loadMyCourses();

    this.loadForumThreads();
    this.loadSubmissions(); 

  }



  // ==========================================================
  // CHARGEMENT DES COURS
  // ==========================================================

  private loadMyCourses(): void {

    this.coursesLoading.set(true);

    this.coursesError.set(null);


    this.http
      .get<{ data: ApiCourse[] }>(
        `${API_URL}/formateur/courses`
      )
      .subscribe({

        // next: (res) => {

        //   const courses =
        //     res.data ?? [];




                next: (res) => {

          const courses = res.data ?? [];

          const items = courses.map((course) => {

            const courseId = String(course.id ?? course.slug ?? '');

            return {
              course: { ...course, id: courseId },
              stat: { enrolledCount: 0, onlineNow: 0, completionRate: 0 },
              live: this.liveService.getSession(courseId),
              weeks: this.contentService.weeksForCourse(courseId),
            };

          });

          this.myCourses.set(items);

          // ✅ LA SEULE LIGNE À AJOUTER ICI
          this.loadCourseContents(items);

          this.coursesLoading.set(false);

          console.log('📚 Cours du formateur récupérés :', items);
        },

        //
        //
        //
        //


        error: (err) => {

          console.error(
            '❌ Erreur chargement cours formateur :',
            err
          );


          this.myCourses.set([]);

          this.coursesLoading.set(false);

          this.coursesError.set(
            'Impossible de charger les cours du formateur.'
          );

        },

      });

  }



  // ==========================================================
  // CHARGEMENT DU FORUM
  // ==========================================================

  private loadForumThreads(): void {

    this.forumLoading.set(true);

    this.forumError.set(null);


    this.http
      .get<{ data: FormateurForumThread[] }>(
        `${API_URL}/formateur/forum`
      )
      .subscribe({

        next: (res) => {

          console.log(
            '🔥 FORUM FORMATEUR API :',
            res
          );


          console.log(
            '🔥 NOMBRE DE DISCUSSIONS :',
            res.data?.length ?? 0
          );


          this.forumThreads.set(
            res.data ?? []
          );


          this.forumLoading.set(false);

        },


        error: (err) => {

          console.error(
            '❌ ERREUR FORUM FORMATEUR :',
            err
          );


          this.forumError.set(
            err?.error?.message ??
            'Impossible de charger les discussions du forum.'
          );


          this.forumThreads.set([]);

          this.forumLoading.set(false);

        },

      });

  }



  // ==========================================================
  // VOIR / MASQUER UNE DISCUSSION
  // ==========================================================

  toggleDiscussion(
    threadId: number
  ): void {

    if (
      this.expandedThreadId() === threadId
    ) {

      this.expandedThreadId.set(null);

      return;
    }


    this.expandedThreadId.set(threadId);

  }



  // ==========================================================
  // OUVRIR LE FORMULAIRE DE RÉPONSE
  // ==========================================================

  openReply(
    threadId: number
  ): void {

    this.replyError.set(null);

    this.replyErrorForThread.set(null);


    /**
     * On ouvre automatiquement
     * la discussion.
     */
    this.expandedThreadId.set(threadId);


    /**
     * Si le formulaire est déjà ouvert,
     * on le ferme.
     */
    if (
      this.replyingThreadId() === threadId
    ) {

      this.replyingThreadId.set(null);

      return;
    }


    this.replyingThreadId.set(threadId);

  }



  // ==========================================================
  // ANNULER UNE RÉPONSE
  // ==========================================================

  cancelReply(): void {

    this.replyingThreadId.set(null);

    this.replyError.set(null);

    this.replyErrorForThread.set(null);

  }



  // ==========================================================
  // ENVOYER UNE RÉPONSE
  // ==========================================================

  submitReply(
    threadId: number,
    content: string
  ): void {

    const cleanContent =
      content.trim();


    /**
     * Protection contre une réponse vide.
     */
    if (!cleanContent) {

      this.replyError.set(
        'Veuillez écrire une réponse avant de publier.'
      );

      this.replyErrorForThread.set(threadId);

      return;
    }


    if (cleanContent.length < 2) {

      this.replyError.set(
        'Votre réponse est trop courte.'
      );

      this.replyErrorForThread.set(threadId);

      return;
    }


    this.replyLoadingId.set(threadId);

    this.replyError.set(null);

    this.replyErrorForThread.set(null);


    console.log(
      '📤 Envoi de la réponse...',
      {
        threadId,
        content: cleanContent,
      }
    );


    this.http
      .post<{ data: FormateurForumReply }>(
        `${API_URL}/forum/threads/${threadId}/replies`,
        {
          content: cleanContent,
        }
      )
      .subscribe({

        next: (res) => {

          console.log(
            '✅ RÉPONSE PUBLIÉE :',
            res
          );


          const newReply =
            res.data;


          /**
           * Ajout immédiat de la réponse
           * dans la discussion actuellement affichée.
           */
          this.forumThreads.update(
            (threads) =>
              threads.map(
                (thread) => {

                  if (
                    thread.id !== threadId
                  ) {

                    return thread;

                  }


                  return {

                    ...thread,

                    replies: [
                      ...(thread.replies ?? []),
                      newReply,
                    ],

                  };

                }
              )
          );


          /**
           * La discussion reste ouverte.
           */
          this.expandedThreadId.set(threadId);


          /**
           * On ferme le formulaire.
           */
          this.replyingThreadId.set(null);


          this.replyLoadingId.set(null);

        },


        error: (err) => {

          console.error(
            '❌ ERREUR PUBLICATION RÉPONSE :',
            err
          );


          this.replyError.set(
            err?.error?.message ??
            'Impossible de publier votre réponse.'
          );


          this.replyErrorForThread.set(
            threadId
          );


          this.replyLoadingId.set(null);

        },

      });

  }



  // ==========================================================
  // MARQUER UNE DISCUSSION COMME RÉSOLUE
  // ==========================================================

  resolveDiscussion(
    threadId: number
  ): void {

    this.resolvingThreadId.set(threadId);


    console.log(
      '✅ Résolution de la discussion :',
      threadId
    );


    this.http
      .patch<{ data: FormateurForumThread }>(
        `${API_URL}/forum/threads/${threadId}/resolved`,
        {}
      )
      .subscribe({

        next: (res) => {

          console.log(
            '✅ DISCUSSION MISE À JOUR :',
            res
          );


          const updatedThread =
            res.data;


          /**
           * Remplacement de la discussion
           * dans le signal.
           */
          this.forumThreads.update(
            (threads) =>
              threads.map(
                (thread) =>
                  thread.id === threadId
                    ? updatedThread
                    : thread
              )
          );


          /**
           * Fermeture éventuelle du formulaire.
           */
          this.replyingThreadId.set(null);


          this.resolvingThreadId.set(null);

        },


        error: (err) => {

          console.error(
            '❌ ERREUR RÉSOLUTION DISCUSSION :',
            err
          );


          this.resolvingThreadId.set(null);


          this.replyError.set(
            err?.error?.message ??
            'Impossible de modifier le statut de cette discussion.'
          );


          this.replyErrorForThread.set(
            threadId
          );

        },

      });

  }



  // ==========================================================
  // SEMAINES PUBLIÉES
  // ==========================================================

  readonly allPublishedWeeks =
    computed(() =>
      this.myCourses().flatMap(
        (item) =>
          item.weeks.map(
            (week) => ({

              week,

              courseTitle:
                String(
                  item.course.title ?? ''
                ),

              courseId:
                item.course.id,

            })
          )
      )
    );



  // ==========================================================
  // STATISTIQUES DES APPRENANTS
  // ==========================================================

  readonly totalStudents =
    computed(() =>
      this.myCourses().reduce(
        (sum, item) =>
          sum +
          item.stat.enrolledCount,
        0
      )
    );


  readonly totalOnline =
    computed(() =>
      this.myCourses().reduce(
        (sum, item) =>
          sum +
          item.stat.onlineNow,
        0
      )
    );


  readonly activeLiveCount =
    computed(() =>
      this.myCourses().filter(
        (item) =>
          item.live.isLive
      ).length
    );



  // ==========================================================
  // TRAVAUX DES APPRENANTS
  // ==========================================================

  // readonly submissions =
  //   signal<Submission[]>(
  //     SUBMISSIONS
  //   );


  // readonly pendingSubmissions =
  //   computed(() =>
  //     this.submissions().filter(
  //       (submission) =>
  //         submission.status ===
  //         'a_corriger'
  //     )
  //   );


  // readonly gradedSubmissions =
  //   computed(() =>
  //     this.submissions().filter(
  //       (submission) =>
  //         submission.status ===
  //         'note'
  //     )
  //   );



  // // ==========================================================
  // // NOTATION D'UN TRAVAIL
  // // ==========================================================

  // gradeSubmission(
  //   id: string,
  //   grade: number
  // ): void {

  //   if (
  //     Number.isNaN(grade) ||
  //     grade < 0 ||
  //     grade > 20
  //   ) {

  //     return;

  //   }


  //   this.submissions.update(
  //     (current) =>
  //       current.map(
  //         (submission) =>

  //           submission.id === id

  //             ? {

  //                 ...submission,

  //                 status:
  //                   'note' as const,

  //                 grade,

  //               }

  //             : submission

  //       )
  //   );

  // }

    // ==========================================================
  // SOUMISSIONS RÉELLES (API) — devoirs des apprenants
  // ==========================================================

  readonly realSubmissions =
    signal<ApiSubmission[]>([]);

  readonly submissionsLoading =
    signal(false);

  readonly pendingSubmissions =
    computed(() =>
      this.realSubmissions().filter(
        (s) => s.status === 'soumis'
      )
    );

  readonly gradedSubmissions =
    computed(() =>
      this.realSubmissions().filter(
        (s) => s.status === 'corrige' || s.status === 'retourne'
      )
    );

  private loadSubmissions(): void {

    this.submissionsLoading.set(true);

    this.http
      .get<{ data: ApiSubmission[] }>(
        `${API_URL}/formateur/submissions`
      )
      .subscribe({
        next: (res) => {
          this.realSubmissions.set(res.data ?? []);
          this.submissionsLoading.set(false);
        },
        error: (err) => {
          console.error('Erreur soumissions :', err);
          this.submissionsLoading.set(false);
        },
      });

  }

  /** URL absolue du devoir rendu. */
  submissionFileUrl(sub: ApiSubmission): string | null {
    if (!sub.fileUrl) return null;
    return `${LARAVEL_URL}${sub.fileUrl}`;
  }

  // ==========================================================
  // CORRECTION D'UNE SOUMISSION
  // ==========================================================

  readonly gradingId =
    signal<string | null>(null);

  gradeRealSubmission(
    sub: ApiSubmission,
    grade: number,
    feedback: string
  ): void {

    if (
      Number.isNaN(grade) ||
      grade < 0 ||
      grade > 20
    ) {
      alert('Note invalide (0 à 20).');
      return;
    }

    this.gradingId.set(sub.id);

    this.http
      .patch<{ message: string }>(
        `${API_URL}/formateur/submissions/${sub.id}`,
        {
          grade: Math.round(grade),
          instructor_feedback: feedback,
          status: 'corrige',
        }
      )
      .subscribe({
        next: () => {
          this.realSubmissions.update((list) =>
            list.map((s) =>
              s.id === sub.id
                ? {
                    ...s,
                    status: 'corrige' as const,
                    grade: Math.round(grade),
                    feedback,
                  }
                : s
            )
          );
          this.gradingId.set(null);
        },
        error: (err) => {
          alert(err?.error?.message ?? 'Erreur lors de la correction.');
          this.gradingId.set(null);
        },
      });
  }



  // ==========================================================
  // FORMATAGE DES DATES
  // ==========================================================

  formatDate(
    iso: string
  ): string {

    if (!iso) {

      return '';

    }


    try {

      const date =
        new Date(iso);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return iso;

      }


      return date.toLocaleDateString(
        'fr-FR',
        {

          day: 'numeric',

          month: 'long',

          year: 'numeric',

          hour: '2-digit',

          minute: '2-digit',

        }
      );

    } catch {

      return iso;

    }

  }



  // ==========================================================
  // DATE LIMITE D'UNE SEMAINE
  // ==========================================================

  formatDeadline(
    week: CourseWeek
  ): string {

    const start =
      new Date(
        week.publishedAt
      );


    if (
      Number.isNaN(
        start.getTime()
      )
    ) {

      return '';

    }


    const days =
      week.programLength ===
      '3-jours'

        ? 3

        : week.programLength ===
          '5-jours'

          ? 5

          : 7;


    const end =
      new Date(start);


    end.setDate(
      end.getDate() + days
    );


    return end.toLocaleDateString(
      'fr-FR',
      {

        day: 'numeric',

        month: 'long',

        year: 'numeric',

      }
    );

  }



  // ==========================================================
  // DURÉE DU PROGRAMME
  // ==========================================================

  programLabel(
    length: CourseWeek['programLength']
  ): string {

    if (
      length === '3-jours'
    ) {

      return '3 jours';

    }


    if (
      length === '5-jours'
    ) {

      return '5 jours';

    }


    return '1 semaine';

  }

}