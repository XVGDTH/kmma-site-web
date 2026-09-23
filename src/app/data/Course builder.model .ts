import { MyAcademie } from './../pages/home/sections/my-academy/my-academie';
import { App } from './../app';
/**
 * Modèle de contenu pédagogique séquencé, construit par le formateur et
 * consommé par l'apprenant — façon HEC Paris / plateforme LMS.
 *
 * IMPORTANT (lire avant de brancher le vrai backend) :
 * - `videoObjectUrl` est une URL locale (`URL.createObjectURL`) générée dans
 *   le navigateur du formateur au moment de l'import. Elle ne survit PAS à un
 *   rechargement de page ni n'est partagée avec les autres navigateurs —
 *   c'est un aperçu de démonstration, pas un vrai hébergement vidéo.
 * - Le découpage en tranches de 5/7/10/15/20/30 min N'EST PAS réalisé
 *   réellement ici (couper une vidéo proprement demande un ré-encodage
 *   côté serveur, ex. ffmpeg). `targetSegmentMinutes` est stocké comme
 *   METADONNÉE d'intention : à la connexion du vrai backend, c'est cette
 *   valeur qui pilotera le découpage effectif du fichier source.
 */

import { ThisReceiver } from "@angular/compiler";
import { from } from "rxjs";

export type SegmentDurationMinutes = 5 | 7 | 10 | 15 | 20 | 30;

export type ProgramLength = '3-jours' | '5-jours' | '1-semaine';

export const SEGMENT_DURATION_OPTIONS: SegmentDurationMinutes[] = [5, 7, 10, 15, 20, 30];

export const PROGRAM_LENGTH_OPTIONS: { id: ProgramLength; label: string }[] = [
  { id: '3-jours', label: '3 jours' },
  { id: '5-jours', label: '5 jours' },
  { id: '1-semaine', label: '1 semaine' },
];

export type SequenceKind = 'video' | 'td' | 'tp' | 'devoir' | 'quiz';

export interface UploadedVideoMeta {
  id: string;
  fileName: string;
  /** Aperçu local — voir avertissement en tête de fichier. */
  videoObjectUrl: string;
  /** Durée réelle du fichier importé (mesurée via l'élément <video>), en secondes. */
  durationSeconds: number;
  /** Découpage cible choisi par le formateur (métadonnée pour le futur backend). */
  targetSegmentMinutes: SegmentDurationMinutes;
}

export interface QuizQuestionDraft {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface WeekQuiz {
  questions: QuizQuestionDraft[];
  /** Score minimum pour débloquer la semaine suivante, sur `totalPoints`. */
  passingScore: number;
  totalPoints: number;
}

export interface WeekAssignment {
  kind: 'td' | 'tp' | 'devoir';
  title: string;
  instructions: string;
  /** Nom du fichier PDF/support joint par le formateur (aperçu local, voir avertissement). */
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface CourseWeek {
  id: string;
  courseId: string;
  index: number; // 1, 2, 3...
  label: string; // "Semaine 1", "Jour 1"...
  programLength: ProgramLength;
  videos: UploadedVideoMeta[];
  assignments: WeekAssignment[];
  quiz?: WeekQuiz;
  publishedAt: string;
}

/** Progression d'un apprenant sur une semaine donnée d'un cours. */
export interface StudentWeekProgress {
  courseId: string;
  weekId: string;
  videosWatched: string[]; // ids des vidéos visionnées en entier
  assignmentsSubmitted: string[]; // titres des devoirs/TD/TP rendus
  quizScore?: number;
  quizPassed: boolean;
}

// design ux/ui facon hec paris 

export interface CourseWeek {
  id: string;
  courseId: string;
  index: number;
  label: string;
  programLength: ProgramLength;

  // 🆕 AJOUTS — tout est optionnel, rien ne casse
  introText?: string;
  objectives?: string[];
  estimatedMinutes?: number;

  videos: UploadedVideoMeta[];
  assignments: WeekAssignment[];
  quiz?: WeekQuiz;
  publishedAt: string;
}

export interface WeekAssignment {
  kind: 'td' | 'tp' | 'devoir';
  title: string;
  instructions: string;
  attachmentName?: string;
  attachmentUrl?: string;
  // 🆕 AJOUTS
  gradingCriteria?: { label: string; points: number }[];
  maxScore?: number;
}

export interface UploadedVideoMeta {
  id: string;
  fileName: string;
  videoObjectUrl: string;
  durationSeconds: number;
  targetSegmentMinutes: SegmentDurationMinutes;
  // 🆕 AJOUT
  transcript?: string;
}

// 🆕 NOUVELLE FONCTION — à ajouter en bas du fichier, avant les exports existants
export function computeWeekDuration(week: CourseWeek): number {
  const videoMinutes = week.videos.reduce((sum, v) => sum + v.durationSeconds / 60, 0);
  const assignmentMinutes = week.assignments.length * 30;
  const quizMinutes = week.quiz ? week.quiz.questions.length * 2 : 0;
  return week.estimatedMinutes ?? Math.round(videoMinutes + assignmentMinutes + quizMinutes);
}
