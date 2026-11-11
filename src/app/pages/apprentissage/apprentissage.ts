import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  CourseContentApiService,
  LearnerChapterDto,
  LearnerModuleDto,
  LearnerSequenceDto,
} from '../../shared/course-content-api.service';
import { toAbsoluteUrl } from '../../shared/formateur-content.service';


type SelectedItem = { kind: 'sequence'; sequence: LearnerSequenceDto };

@Component({
  selector: 'app-apprentissage',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './apprentissage.html',
  styleUrl: './apprentissage.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Apprentissage {

  private readonly route = inject(ActivatedRoute);
  readonly contentApi = inject(CourseContentApiService);

  readonly courseSlug = this.route.snapshot.paramMap.get('courseId') ?? '';

  readonly course  = this.contentApi.course;
  readonly loading = this.contentApi.loading;
  readonly error   = this.contentApi.error;

  readonly modules   = computed(() => this.course()?.modules ?? []);
  readonly orphans   = computed(() => this.course()?.chapters ?? []);
  readonly finalExam = computed(() => this.course()?.finalExam ?? null);

  readonly selectedItem = signal<SelectedItem | null>(null);

  readonly quizAnswers = signal<Record<number, number>>({});
  readonly quizResult  = signal<{ score: number; total: number; passed: boolean } | null>(null);
  // Ajoute cet état dans ta classe
readonly isCompleting = signal<boolean>(false);
// Ajoute ceci avec les autres signaux
readonly notificationMessage = signal<string | null>(null);



  constructor() {
    if (this.courseSlug) {
      this.contentApi.loadCourse(this.courseSlug);
    }
  }

  // ----------------------------------------------------------
  // SÉLECTION
  // ----------------------------------------------------------

  selectSequence(seq: LearnerSequenceDto): void {
    this.quizAnswers.set({});
    this.quizResult.set(null);
    this.selectedItem.set({ kind: 'sequence', sequence: seq });
  }

  // ----------------------------------------------------------
  // QUIZ
  // ----------------------------------------------------------

  answerQuestion(qIndex: number, oIndex: number): void {
    if (this.quizResult()) return;
    this.quizAnswers.update((c) => ({ ...c, [qIndex]: oIndex }));
  }

  submitQuiz(seq: LearnerSequenceDto): void {
    const questions = seq.quizQuestions ?? [];
    if (questions.length === 0) return;

    const answers = this.quizAnswers();
    let score = 0;
    questions.forEach((q, i) => {
      if (q.type === 'qcm' && answers[i] === q.correctIndex) score += 1;
    });

    const percent = Math.round((score / questions.length) * 100);
    const passed = percent >= (seq.passingScore ?? 0);

    this.quizResult.set({ score, total: questions.length, passed });
  }

  answeredCount(): number {
    return Object.keys(this.quizAnswers()).length;
  }

  // ----------------------------------------------------------
  // HELPERS TEMPLATE
  // ----------------------------------------------------------

  assetUrl(url: string | null | undefined): string | null {
    return toAbsoluteUrl(url);
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      video: '🎬', document: '📄', tp: '🛠️',
      td: '✍️', cas_pratique: '📝', quiz: '❓',
    };
    return map[type] ?? '📄';
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      video: 'Vidéo', document: 'Document', tp: 'Travaux pratiques',
      td: 'Exercice', cas_pratique: 'Cas pratique', quiz: 'Quiz',
    };
    return map[type] ?? type;
  }

  moduleSequenceCount(module: LearnerModuleDto): number {
    let n = 0;
    for (const ch of module.chapters) n += ch.sequences.length;
    if (module.moduleQuiz) n += 1;
    return n;
  }

  isQuiz(seq: LearnerSequenceDto): boolean {
    return seq.type === 'quiz';
  }

  // Dans la classe Apprentissage
markAsComplete(seq: LearnerSequenceDto): void {
  if (seq.completed || this.isCompleting()) return;
  
  this.isCompleting.set(true);
  
  this.contentApi.markSequenceComplete(Number(seq.id)).subscribe({
    next: () => {
      // ✅ On force la mise à jour en recréant le signal
      const current = this.selectedItem();
      // ✅ Vérifie si TOUT le cours est terminé
const allSequences = this.modules().flatMap(m => m.chapters.flatMap(c => c.sequences));
const allCompleted = allSequences.every(s => s.completed);
const finalExamDone = this.finalExam() ? this.finalExam()!.completed : true;

if (allCompleted && finalExamDone) {
  this.showNotification("🎉 Félicitations ! Vous avez terminé tout le cours. Vous pouvez télécharger votre certificat depuis votre espace.");
}
      if (current) {
        this.selectedItem.set({
          ...current,
          sequence: { ...current.sequence, completed: true }
        });
      }
      
      // ✅ On affiche la notification de succès
      this.showNotification("Vous avez marqué cette séquence comme terminée !");
      
      this.isCompleting.set(false);
    },
    error: (err) => {
      console.error('Erreur validation', err);
      alert("Impossible de marquer comme terminé.");
      this.isCompleting.set(false);
    }

    
  });
}


// Méthode pour afficher une notification
showNotification(message: string): void {
  this.notificationMessage.set(message);
  // La notification disparaît après 5 secondes
  setTimeout(() => this.notificationMessage.set(null), 5000);
}

  // ============================================================
  // FEEDBACK (Avis)
  // ============================================================
  submitFeedback(sequenceId: number, comment: string, rating: number | null): void {
    if (!sequenceId) return;

    // On appelle l'API
    this.contentApi.sendFeedback(sequenceId, comment, rating).subscribe({
      next: () => {
        // ✅ Notification de succès
        this.showNotification("Merci ! Votre avis a bien été enregistré.");
        
        // Optionnel : vider le formulaire ou fermer le modal
        // this.feedbackComment.set('');
        // this.feedbackRating.set(null);
        // this.showFeedbackForm.set(false);
      },
      error: (err) => {
        console.error('Erreur feedback', err);
        alert("Impossible d'envoyer votre avis pour le moment.");
      }
    });
  }
}