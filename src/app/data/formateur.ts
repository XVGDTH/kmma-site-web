// ============================================================
// STATISTIQUES DES COURS DU FORMATEUR
// ============================================================

export interface FormateurCourseStat {
  courseId: string;
  enrolledCount: number;
  onlineNow: number;
  completionRate: number; // pourcentage moyen de la cohorte
}


// ============================================================
// DEVOIRS / TP / TD / SOUMISSIONS
// ============================================================

export interface Submission {
  id: string;
  studentName: string;
  courseId: string;
  sequenceTitle: string;
  submittedAt: string; // ex: "28 août 2026, 14h32"
  status: 'a_corriger' | 'note';
  grade?: number; // sur 20
}


// ============================================================
// DONNÉES TEMPORAIRES DES STATISTIQUES
// TODO : remplacer par un vrai appel API
// ============================================================

export const MY_COURSE_STATS: FormateurCourseStat[] = [
  {
    courseId: 'comp-01',
    enrolledCount: 47,
    onlineNow: 6,
    completionRate: 62,
  },
];


// ============================================================
// DONNÉES TEMPORAIRES DES SOUMISSIONS
// TODO : remplacer par les vraies données backend
// ============================================================

export const SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    studentName: 'Aminata Zongo',
    courseId: 'comp-01',
    sequenceTitle: 'TD : calcul de coût de revient',
    submittedAt: '30 août 2026, 09h12',
    status: 'a_corriger',
  },

  {
    id: 'sub-2',
    studentName: 'Issouf Ouédraogo',
    courseId: 'comp-01',
    sequenceTitle: 'TP : mise en application sur tableur',
    submittedAt: '29 août 2026, 18h47',
    status: 'a_corriger',
  },

  {
    id: 'sub-3',
    studentName: 'Fatou Kaboré',
    courseId: 'comp-01',
    sequenceTitle: 'Devoir noté : étude de cas',
    submittedAt: '27 août 2026, 21h05',
    status: 'note',
    grade: 15,
  },
];


// ============================================================
// FORUM FORMATEUR
// Données récupérées depuis Laravel
// ============================================================


// ------------------------------------------------------------
// Utilisateur du forum
// ------------------------------------------------------------

export interface FormateurForumUser {
  id: number;
  name: string;
}


// ------------------------------------------------------------
// Cours associé à une discussion
// ------------------------------------------------------------

export interface FormateurForumCourse {
  id: number;
  slug: string;
  title: string;
}


// ------------------------------------------------------------
// Chapitre associé à une discussion
// ------------------------------------------------------------

export interface FormateurForumChapter {
  id: number;
  title: string;
}


// ------------------------------------------------------------
// Réponse à une discussion
// ------------------------------------------------------------

export interface FormateurForumReply {
  id: number;
  forum_thread_id: number;
  user_id: number;
  content: string;
  upvotes: number;
  created_at: string;
  updated_at?: string;
  user: FormateurForumUser;
}


// ------------------------------------------------------------
// Discussion du forum
// ------------------------------------------------------------

export interface FormateurForumThread {
  id: number;

  // ID SQL du cours
  course_id: number;

  // ID SQL du chapitre, facultatif
  chapter_id?: number | null;

  // ID SQL de l'utilisateur ayant créé la discussion
  user_id: number;

  // Contenu de la discussion
  title: string;
  content: string;

  // Nombre de votes
  upvotes: number;

  // Discussion résolue ou non
  resolved: boolean;

  // Dates Laravel
  created_at: string;
  updated_at?: string;

  // Relations chargées par Laravel
  user: FormateurForumUser;
  course: FormateurForumCourse;
  chapter?: FormateurForumChapter | null;

  // Réponses
  replies: FormateurForumReply[];
}