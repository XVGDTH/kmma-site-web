// ============================================================
// Types pour le système vidéo + transcript synchronisé
// ============================================================

export interface TranscriptChapter {
  id: string;
  startTime: number;     // secondes
  endTime: number;
  title: string;
  summary?: string;
}

export interface TranscriptCue {
  id: string;
  startTime: number;     // secondes
  endTime: number;
  text: string;
  chapterId: string;     // à quel chapitre appartient ce cue
}

export interface VideoTranscriptData {
  videoId: string;
  videoUrl: string;
  vttUrl?: string;        // optionnel — généré dynamiquement
  chapters: TranscriptChapter[];
  cues: TranscriptCue[];
  duration: number;       // durée totale en secondes
}

// ============================================================
// Utilitaire : générer un fichier .vtt depuis les cues
// ============================================================
export function buildVttContent(cues: TranscriptCue[]): string {
  const header = 'WEBVTT\n\n';
  const body = cues
    .map((cue, i) => {
      const start = formatVttTime(cue.startTime);
      const end = formatVttTime(cue.endTime);
      return `${i + 1}\n${start} --> ${end}\n${cue.text}\n`;
    })
    .join('\n');
  return header + body;
}

function formatVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

function pad(n: number, length = 2): string {
  return n.toString().padStart(length, '0');
}

// ============================================================
// ✅ DONNÉES DE DÉMO — Le cours d'audit
// À remplacer plus tard par un appel API
// ============================================================
export const DEMO_TRANSCRIPT: VideoTranscriptData = {
  videoId: 'demo-audit-01',
  // ⚠️ Remplace par un vrai fichier MP4 que tu hébergeras
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  duration: 596,

  chapters: [
    {
      id: 'chap-1',
      startTime: 0,
      endTime: 90,
      title: 'Introduction à l\'audit interne',
      summary: 'Définition, rôle et importance du métier.',
    },
    {
      id: 'chap-2',
      startTime: 90,
      endTime: 240,
      title: 'Le cadre légal au Burkina Faso',
      summary: 'Les textes de référence et obligations.',
    },
    {
      id: 'chap-3',
      startTime: 240,
      endTime: 420,
      title: 'Les normes IIA en pratique',
      summary: 'Application concrète des standards internationaux.',
    },
    {
      id: 'chap-4',
      startTime: 420,
      endTime: 596,
      title: 'Cas pratique et conclusion',
      summary: 'Mise en application et synthèse.',
    },
  ],

  cues: [
    { id: 'c1',  startTime: 0,   endTime: 8,   text: 'Bienvenue dans ce cours dédié à l\'audit interne.', chapterId: 'chap-1' },
    { id: 'c2',  startTime: 8,   endTime: 18,  text: 'Aujourd\'hui, nous allons découvrir les fondamentaux du métier.', chapterId: 'chap-1' },
    { id: 'c3',  startTime: 18,  endTime: 30,  text: 'L\'audit interne est une activité indépendante et objective.', chapterId: 'chap-1' },
    { id: 'c4',  startTime: 30,  endTime: 44,  text: 'Elle donne à une organisation une assurance sur le degré de maîtrise de ses opérations.', chapterId: 'chap-1' },
    { id: 'c5',  startTime: 44,  endTime: 58,  text: 'Elle lui apporte des conseils pour les améliorer.', chapterId: 'chap-1' },
    { id: 'c6',  startTime: 58,  endTime: 72,  text: 'Elle contribue à créer de la valeur ajoutée.', chapterId: 'chap-1' },
    { id: 'c7',  startTime: 72,  endTime: 90,  text: 'Voyons maintenant le cadre légal au Burkina Faso.', chapterId: 'chap-1' },

    { id: 'c8',  startTime: 90,  endTime: 105, text: 'Au Burkina Faso, l\'audit interne est encadré par plusieurs textes.', chapterId: 'chap-2' },
    { id: 'c9',  startTime: 105, endTime: 120, text: 'La loi sur les sociétés commerciales précise les obligations.', chapterId: 'chap-2' },
    { id: 'c10', startTime: 120, endTime: 138, text: 'L\'acte uniforme OHADA s\'applique également.', chapterId: 'chap-2' },
    { id: 'c11', startTime: 138, endTime: 155, text: 'Les entreprises cotées ont des obligations supplémentaires.', chapterId: 'chap-2' },
    { id: 'c12', startTime: 155, endTime: 172, text: 'Les PME doivent également structurer une fonction d\'audit.', chapterId: 'chap-2' },
    { id: 'c13', startTime: 172, endTime: 190, text: 'Cela renforce la gouvernance et la transparence.', chapterId: 'chap-2' },
    { id: 'c14', startTime: 190, endTime: 210, text: 'Le contrôle interne est un préalable indispensable.', chapterId: 'chap-2' },
    { id: 'c15', startTime: 210, endTime: 240, text: 'Passons aux normes internationales IIA.', chapterId: 'chap-2' },

    { id: 'c16', startTime: 240, endTime: 260, text: 'Les normes IIA sont la référence mondiale de l\'audit interne.', chapterId: 'chap-3' },
    { id: 'c17', startTime: 260, endTime: 280, text: 'Elles couvrent les principes fondamentaux et le code de déontologie.', chapterId: 'chap-3' },
    { id: 'c18', startTime: 280, endTime: 300, text: 'Elles décrivent aussi les normes de mise en œuvre.', chapterId: 'chap-3' },
    { id: 'c19', startTime: 300, endTime: 320, text: 'Chaque norme précise ce qui doit être fait et comment.', chapterId: 'chap-3' },
    { id: 'c20', startTime: 320, endTime: 345, text: 'Le respect de ces normes est gage de qualité.', chapterId: 'chap-3' },
    { id: 'c21', startTime: 345, endTime: 370, text: 'Il permet aussi une reconnaissance internationale.', chapterId: 'chap-3' },
    { id: 'c22', startTime: 370, endTime: 395, text: 'Voyons maintenant comment les appliquer en pratique.', chapterId: 'chap-3' },
    { id: 'c23', startTime: 395, endTime: 420, text: 'Nous verrons un exemple concret.', chapterId: 'chap-3' },

    { id: 'c24', startTime: 420, endTime: 450, text: 'Prenons le cas d\'une entreprise de distribution.', chapterId: 'chap-4' },
    { id: 'c25', startTime: 450, endTime: 480, text: 'Comment structurer une mission d\'audit interne ?', chapterId: 'chap-4' },
    { id: 'c26', startTime: 480, endTime: 510, text: 'Il faut commencer par la planification.', chapterId: 'chap-4' },
    { id: 'c27', startTime: 510, endTime: 540, text: 'Puis réaliser les tests de conformité.', chapterId: 'chap-4' },
    { id: 'c28', startTime: 540, endTime: 565, text: 'Enfin, rédiger le rapport et assurer le suivi.', chapterId: 'chap-4' },
    { id: 'c29', startTime: 565, endTime: 596, text: 'Voilà pour ce cours. À bientôt pour la suite !', chapterId: 'chap-4' },
  ],
};