export type SequenceType = 'video' | 'quiz' | 'devoir' | 'tp' | 'td' | 'document' | 'cas_pratique';

export interface QuizQuestion {
  question: string;
  type?: 'qcm' | 'texte';        // 🆕 type de question
  options?: string[];             // QCM uniquement
  correctIndex?: number;          // QCM : index de la bonne réponse
  expectedAnswer?: string;        // 🆕 TEXTE : réponse attendue
}



// export interface CourseSequence {
//   id: string;
//   title: string;
//   type: SequenceType;

//   position?: number;

//   duration?: string;
//   videoUrl?: string;
//   documentUrl?: string;

//   quizQuestions?: QuizQuestion[];

//   instructions?: string;

//   completed: boolean;
// }

export interface CourseSequence {
  id: string;
  title: string;
  type: SequenceType;

  position?: number;
  duration?: string | null;
  videoUrl?: string | null;
  documentUrl?: string | null;
  quizQuestions?: QuizQuestion[];
  instructions?: string | null;
  completed: boolean;

  // 🆕 Options HEC
  passingScore?: number | null;
  isBlocking?: boolean;
  isFinal?: boolean;
  deadline?: string | null;
  allowFileUpload?: boolean;
}



// export interface CourseChapter {
//   id: string;
//   title: string;
//   position?: number;
//   sequences: CourseSequence[];
// }

export interface CourseChapter {
  id: string;
  title: string;
  position: number;
  sequences: CourseSequence[];

  // 🆕 Structure HEC — Module parent + semaine
  weekNumber?: number | null;
  moduleId?: number;
  moduleTitle?: string;
  modulePosition?: number;
  moduleQuiz?: CourseSequence | null;
}

export interface CourseCurriculum {
  courseId: string;
  instructor: string;
  instructorRole: string;
  chapters: CourseChapter[];
}

// Programme détaillé pour quelques cours pilotes.
// TODO (Salomon) : remplacer par un appel API qui charge le programme réel du cours.
export const CURRICULA: Record<string, CourseCurriculum> = {
  'comp-01': {
    courseId: 'comp-01',
    instructor: 'M. Moussa Coulibaly',
    instructorRole: 'Ingénieur de conception des systèmes d\'information',
    chapters: [
      {
        id: 'ch-1',
         position: 0,  
        title: 'Chapitre 1 — Introduction et fondamentaux',
        sequences: [
          { id: 's-1-1', title: 'Présentation du cours', type: 'video', duration: '8 min', completed: true },
          { id: 's-1-2', title: 'Fiche pédagogique', type: 'document', completed: true },
          { id: 's-1-3', title: 'Quiz de positionnement', type: 'quiz', completed: false,
            quizQuestions: [
              { question: 'Qu\'est-ce que la comptabilité analytique ?', options: ['Un outil de communication externe', 'Un outil d\'aide à la décision interne', 'Une obligation fiscale uniquement'], correctIndex: 1 },
              { question: 'Le coût variable dépend :', options: ['Du niveau d\'activité', 'Du temps', 'De la localisation'], correctIndex: 0 },
            ],
          },
        ],
      },
      {
        id: 'ch-2',
         position: 1,  
        title: 'Chapitre 2 — Calcul des coûts',
        sequences: [
          { id: 's-2-1', title: 'Méthode des coûts complets', type: 'video', duration: '22 min', completed: false },
          { id: 's-2-2', title: 'TD : calcul de coût de revient', type: 'td', instructions: 'Calculez le coût de revient unitaire à partir des données fournies dans le support ci-joint.', completed: false },
          { id: 's-2-3', title: 'TP : mise en application sur tableur', type: 'tp', instructions: 'Reproduisez le tableau de calcul des coûts dans Excel à partir du modèle fourni.', completed: false },
        ],
      },
      {
        id: 'ch-3',
        title: 'Chapitre 3 — Évaluation finale',
         position: 3,  
        sequences: [
          { id: 's-3-1', title: 'Devoir noté : étude de cas', type: 'devoir', instructions: 'Analysez le cas de l\'entreprise ABC et proposez une structure de coûts adaptée. À rendre avant la date limite.', completed: false },
          { id: 's-3-2', title: 'Quiz final', type: 'quiz', completed: false,
            quizQuestions: [
              { question: 'Le seuil de rentabilité correspond à :', options: ['Le chiffre d\'affaires qui couvre toutes les charges', 'Le bénéfice net', 'La marge brute'], correctIndex: 0 },
            ],
          },
        ],
      },
    ],
  },
};

/** Programme générique utilisé si le cours n'a pas de programme défini explicitement */
export function fallbackCurriculum(courseId: string): CourseCurriculum {
  return {
    courseId,
    instructor: 'Équipe pédagogique KMAA',
    instructorRole: 'Formateurs experts du domaine',
    chapters: [
      {
        id: 'ch-1',
        title: 'Chapitre 1 — Introduction',
         position: 4,  
        sequences: [
          { id: 'g-1-1', title: 'Présentation du cours', type: 'video', duration: '10 min', completed: false },
          { id: 'g-1-2', title: 'Support de cours', type: 'document', completed: false },
        ],
      },
      {
        id: 'ch-2',
        title: 'Chapitre 2 — Approfondissement',
         position: 5,  
        sequences: [
          { id: 'g-2-1', title: 'Concepts clés', type: 'video', duration: '18 min', completed: false },
          { id: 'g-2-2', title: 'Travaux dirigés', type: 'td', instructions: 'Exercices d\'application sur les concepts vus en vidéo.', completed: false },
          { id: 'g-2-3', title: 'Quiz de validation', type: 'quiz', completed: false,
            quizQuestions: [
              { question: 'Cette question sera personnalisée pour ce cours.', options: ['Réponse A', 'Réponse B', 'Réponse C'], correctIndex: 0 },
            ],
          },
        ],
      },
      {
        id: 'ch-3',
        title: 'Chapitre 3 — Évaluation',
         position: 6,  
        sequences: [
          { id: 'g-3-1', title: 'Devoir final', type: 'devoir', instructions: 'Devoir noté à rendre en fin de parcours.', completed: false },
        ],
      },
    ],
  };
}


