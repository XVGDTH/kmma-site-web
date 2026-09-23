import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ForumThread,
  ForumReply,
} from '../../data/forum';

import { ForumApiService } from '../forum-service-api';
import { CoursesApiService } from '../courses-api.service';

@Component({
  selector: 'app-course-forum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-forum.html',
  styleUrl: './course-forum.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseForum implements OnChanges {

  /**
   * Valeur reçue depuis le course-player.
   * Peut être un slug ou un ID.
   */
  @Input({ required: true })
  courseId!: string | number;

  /**
   * Utilisateur connecté
   */
  @Input()
  currentUserId!: number;

  @Input()
  currentUserName = 'Apprenant';

  @Input()
  currentUserRole: 'apprenant' | 'formateur' = 'apprenant';

  // ============================================================
  // ÉTAT
  // ============================================================

  private readonly allThreads = signal<ForumThread[]>([]);

  /** Vrai ID numérique du cours récupéré depuis CoursesApiService */
  private readonly resolvedCourseId = signal<number | null>(null);

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly resolvingCourse = signal(false);
  readonly error = signal<string | null>(null);

  readonly openThreadId = signal<number | null>(null);
  readonly showNewThreadForm = signal(false);

  // ============================================================
  // FORMULAIRES
  // ============================================================

  newTitle = '';
  newContent = '';
  replyDraft = '';

  // ============================================================
  // DISCUSSIONS DU COURS
  // ============================================================

  readonly threads = computed(() => {
    return this.allThreads()
      .slice()
      .sort((a, b) => b.upvotes - a.upvotes);
  });

  // ============================================================
  // CONSTRUCTEUR
  // ============================================================

  constructor(
    private forumApi: ForumApiService,
    private coursesApi: CoursesApiService
  ) {}

  // ============================================================
  // CHANGEMENT DU CONTEXTE DU COURS
  // ============================================================

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['courseId'] &&
      this.courseId !== undefined &&
      this.courseId !== null &&
      this.courseId !== ''
    ) {
      this.resolveCourse();
    }
  }

  // ============================================================
  // RÉCUPÉRER LE VRAI ID DU COURS
  // ============================================================

  private resolveCourse(): void {
    const value = String(this.courseId).trim();

    if (!value) {
      this.error.set('Cours invalide.');
      return;
    }

    console.log('🔎 Slug reçu par le forum :', value);

    this.resolvingCourse.set(true);
    this.error.set(null);

    this.coursesApi.getCourseDetail(value).subscribe({
      next: (course) => {
        console.log('🔥 OBJET COMPLET DU COURS :', course);
        console.log('🔥 COURSE ID SQL :', course.courseId);

        const numericId = Number(course.courseId);

        if (!Number.isInteger(numericId) || numericId <= 0) {
          console.error('❌ courseId invalide :', course.courseId);

          this.error.set('Impossible d’identifier le cours pour le forum.');
          this.resolvedCourseId.set(null);
          this.resolvingCourse.set(false);
          return;
        }

        this.resolvedCourseId.set(numericId);
        console.log('✅ VRAI ID DU COURS :', numericId);

        this.resolvingCourse.set(false);
        this.loadThreads();
      },

      error: (err) => {
        console.error('❌ ERREUR RÉCUPÉRATION COURS :', err);

        this.resolvedCourseId.set(null);
        this.resolvingCourse.set(false);
        this.error.set('Impossible d’identifier le cours pour le forum.');
      },
    });
  }

  // ============================================================
  // CHARGER LES DISCUSSIONS
  // ============================================================

  loadThreads(): void {
    const courseId = this.resolvedCourseId();

    if (courseId === null || !Number.isInteger(courseId) || courseId <= 0) {
      this.error.set('Impossible d\'identifier le cours.');
      return;
    }

    console.log('📚 Chargement du forum pour le course_id :', courseId);

    this.loading.set(true);
    this.error.set(null);

    this.forumApi.getThreads(courseId).subscribe({
      next: (threads) => {
        console.log('✅ Discussions récupérées :', threads);
        this.allThreads.set(threads);
        this.loading.set(false);
      },

      error: (err) => {
        console.error('❌ Erreur chargement forum :', err);
        console.error('Status :', err.status);
        console.error('Erreur serveur :', err.error);

        this.error.set(
          err.error?.message ?? 'Impossible de charger les discussions.'
        );
        this.loading.set(false);
      },
    });
  }

  // ============================================================
  // OUVRIR / FERMER UNE DISCUSSION
  // ============================================================

  toggleThread(threadId: number): void {
    if (this.openThreadId() === threadId) {
      this.openThreadId.set(null);
    } else {
      this.openThreadId.set(threadId);
    }

    this.replyDraft = '';
  }

  // ============================================================
  // FORMULAIRE NOUVELLE DISCUSSION
  // ============================================================

  toggleNewThreadForm(): void {
    this.showNewThreadForm.update((value) => !value);
    this.newTitle = '';
    this.newContent = '';
    this.error.set(null);
  }

  // ============================================================
  // CRÉER UNE DISCUSSION
  // ============================================================

  postThread(): void {
    console.log('🔥 BOUTON PUBLIER CLIQUÉ');

    const title = this.newTitle.trim();
    const content = this.newContent.trim();
    const courseId = this.resolvedCourseId();

    console.log('Titre :', title);
    console.log('Contenu :', content);
    console.log('Valeur reçue du course-player :', this.courseId);
    console.log('Vrai course_id utilisé par le forum :', courseId);

    if (!title) {
      this.error.set('Veuillez renseigner le titre de votre question.');
      return;
    }

    if (!content) {
      this.error.set('Veuillez renseigner le contenu de votre question.');
      return;
    }

    if (courseId === null || !Number.isInteger(courseId) || courseId <= 0) {
      console.log('❌ Aucun cours valide résolu');
      this.error.set(
        'Le cours n\'a pas encore été identifié. Veuillez patienter.'
      );
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    console.log('📡 Envoi vers Laravel...');

    this.forumApi
      .createThread({
        course_id: courseId,
        title,
        content,
        chapter_id: null,
      })
      .subscribe({
        next: (thread) => {
          console.log('✅ DISCUSSION CRÉÉE :', thread);

          this.allThreads.update((current) => [thread, ...current]);

          this.newTitle = '';
          this.newContent = '';
          this.showNewThreadForm.set(false);
          this.submitting.set(false);

          console.log('🎉 Question publiée avec succès.');
        },

        error: (err) => {
          console.error('❌ ERREUR API FORUM :', err);
          console.error('Status :', err.status);
          console.error('Message :', err.message);
          console.error('Erreur serveur :', err.error);

          this.error.set(
            err.error?.message ?? 'Impossible de créer la discussion.'
          );
          this.submitting.set(false);
        },
      });
  }

  // ============================================================
  // RÉPONDRE À UNE DISCUSSION
  // ============================================================

  postReply(threadId: number): void {
    const content = this.replyDraft.trim();

    if (!content) {
      this.error.set('Veuillez écrire une réponse.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    console.log('📡 Envoi de la réponse pour la discussion :', threadId);

    this.forumApi.createReply(threadId, content).subscribe({
      next: (reply) => {
        console.log('✅ RÉPONSE AJOUTÉE :', reply);

        this.allThreads.update((current) =>
          current.map((thread) => {
            if (thread.id !== threadId) {
              return thread;
            }

            return {
              ...thread,
              replies: [...thread.replies, reply],
            };
          })
        );

        this.replyDraft = '';
        this.submitting.set(false);
      },

      error: (err) => {
        console.error('❌ Erreur ajout réponse :', err);
        console.error('Status :', err.status);
        console.error('Erreur serveur :', err.error);

        this.error.set(
          err.error?.message ?? 'Impossible d\'ajouter la réponse.'
        );
        this.submitting.set(false);
      },
    });
  }

  // ============================================================
  // UPVOTE DISCUSSION
  // ============================================================

  upvoteThread(threadId: number): void {
    console.log('👍 Upvote discussion :', threadId);

    this.forumApi.upvoteThread(threadId).subscribe({
      next: (updatedThread) => {
        console.log('✅ Discussion mise à jour :', updatedThread);

        this.allThreads.update((current) =>
          current.map((thread) =>
            thread.id === updatedThread.id ? updatedThread : thread
          )
        );
      },

      error: (err) => {
        console.error('❌ Erreur upvote discussion :', err);

        this.error.set(
          err.error?.message ?? 'Impossible de voter pour cette discussion.'
        );
      },
    });
  }

  // ============================================================
  // UPVOTE RÉPONSE
  // ============================================================

  upvoteReply(threadId: number, replyId: number): void {
    console.log('👍 Upvote réponse :', replyId);

    this.forumApi.upvoteReply(replyId).subscribe({
      next: (updatedReply) => {
        console.log('✅ Réponse mise à jour :', updatedReply);

        this.allThreads.update((current) =>
          current.map((thread) => {
            if (thread.id !== threadId) {
              return thread;
            }

            return {
              ...thread,
              replies: thread.replies.map((reply) =>
                reply.id === updatedReply.id ? updatedReply : reply
              ),
            };
          })
        );
      },

      error: (err) => {
        console.error('❌ Erreur upvote réponse :', err);

        this.error.set(
          err.error?.message ?? 'Impossible de voter pour cette réponse.'
        );
      },
    });
  }

  // ============================================================
  // MARQUER COMME RÉSOLU
  // ============================================================

  toggleResolved(threadId: number): void {
    console.log('🔄 Modification resolved :', threadId);

    this.forumApi.toggleResolved(threadId).subscribe({
      next: (updatedThread) => {
        console.log('✅ Discussion mise à jour :', updatedThread);

        this.allThreads.update((current) =>
          current.map((thread) =>
            thread.id === updatedThread.id ? updatedThread : thread
          )
        );
      },

      error: (err) => {
        console.error('❌ Erreur modification resolved :', err);

        this.error.set(
          err.error?.message ??
            'Impossible de modifier le statut de la discussion.'
        );
      },
    });
  }

  // ============================================================
  // AUTORISATION POUR "RÉSOLU"
  // ============================================================

  canToggleResolved(thread: ForumThread): boolean {
    return (
      thread.user_id === this.currentUserId ||
      this.currentUserRole === 'formateur'
    );
  }

  // ============================================================
  // NOM DE L'AUTEUR
  // ============================================================

  getAuthorName(thread: ForumThread): string {
    return thread.user?.name ?? 'Utilisateur';
  }

  // ============================================================
  // NOM DE L'AUTEUR D'UNE RÉPONSE
  // ============================================================

  getReplyAuthorName(reply: ForumReply): string {
    return reply.user?.name ?? 'Utilisateur';
  }

  // ============================================================
  // DATE
  // ============================================================

  formatDate(date: string): string {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}