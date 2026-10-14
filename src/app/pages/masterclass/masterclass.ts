import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import du composant de connexion
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';


interface MasterclassVideo {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  category: string;
  description: string;
}

interface MasterclassResource {
  icon: string;
  title: string;
  type: string;
  size: string;
}

interface ChatMessage {
  id: number;
  author: string;
  role: 'participant' | 'expert' | 'moderator';
  message: string;
  time: string;
}

interface Question {
  id: number;
  author: string;
  question: string;
  likes: number;
  answered: boolean;
  answer?: string;
}

interface MasterclassInfo {
  category: string; title: string; subtitle: string; description: string;
  date: string; time: string; timezone: string;
  participants: number; capacity: number; language: string;
}
interface Speaker {
  name: string; role: string; organization: string; bio: string;
  image: string; stats: { value: string; label: string }[];
}
interface Session { time: string; duration: string; title: string; description: string; status: string; }
interface MasterclassResource { icon: string; title: string; type: string; size: string; }
interface QuizQ { question: string; options: string[]; correct: number; }

@Component({
  selector: 'app-masterclass',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './masterclass.html',
  styleUrl: './masterclass.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Masterclass {

    //import du composant de videos youtubes
    private readonly sanitizer = inject(DomSanitizer);
    readonly youtubeUrl = computed<SafeResourceUrl>(() => {
  const id = this.currentVideoId();

  return this.sanitizer.bypassSecurityTrustResourceUrl(
    `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`
  );
});

  /* =========================================================
     Ã‰TAT GLOBAL
  ========================================================= */

  readonly isRegistered = signal(false);
  readonly activeTab = signal<'programme' | 'interactions' | 'ressources'>('programme');

  readonly eventStatus = signal<'upcoming' | 'live' | 'replay'>('live');

  readonly currentVideoId = signal('qp0HIF3SfI4');

  // readonly currentVideo = computed(() =>
  //   this.videos.find(video => video.id === this.currentVideoId())
  // );
    readonly currentVideo = computed(() =>
    this.videos().find(video => video.id === this.currentVideoId())
  );

  readonly videoProgress = signal(68);

  /* =========================================================
     COMPTE Ã€ REBOURS
  ========================================================= */

  readonly countdown = signal({
    days: 0,
    hours: 2,
    minutes: 41,
    seconds: 17,
  });

  /* =========================================================
     MASTERCLASS
  ========================================================= */
  
  //   private readonly http = inject(HttpClient);
  // private readonly apiUrl = 'http://127.0.0.1:8000/api';

  // readonly masterclass = signal<MasterclassInfo>({
      private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  constructor() {
    this.http
      .get<{ data: any }>(`${this.apiUrl}/masterclass`)
      .subscribe({
        next: (res) => {
          const d = res?.data;
          if (!d?.masterclass) return;

          this.masterclass.set({ ...this.masterclass(), ...d.masterclass });
          if (d.speaker?.name) {
            this.speaker.set({ ...this.speaker(), ...d.speaker });
          }
          if (Array.isArray(d.sessions) && d.sessions.length) this.sessions.set(d.sessions);
          if (Array.isArray(d.videos) && d.videos.length) this.videos.set(d.videos);
          if (Array.isArray(d.resources) && d.resources.length) this.resources.set(d.resources);
          if (Array.isArray(d.quiz) && d.quiz.length) this.quizQuestions.set(d.quiz);
          if (d.status) this.eventStatus.set(d.status);
          if (d.youtube_id) this.currentVideoId.set(d.youtube_id);
        },
        error: () => console.warn('Masterclass API indisponible â€” contenu statique affichÃ©.'),
      });
  }

  readonly masterclass = signal<MasterclassInfo>({
    category: 'LEADERSHIP â€¢ INNOVATION',
    title: 'Construire une vision qui transforme',
    subtitle: 'Leadership, innovation et impact : les clÃ©s pour transformer une idÃ©e en vÃ©ritable projet.',
    description: 'Une expÃ©rience immersive pensÃ©e pour les entrepreneurs, Ã©tudiants, professionnels et porteurs de projets.',
    date: 'Samedi 12 septembre 2026',
    time: '18:00 â€“ 20:00',
    timezone: 'GMT',
    participants: 284,
    capacity: 500,
    language: 'FranÃ§ais',
  });


  /* =========================================================
     INTERVENANT
  ========================================================= */

  readonly speaker = signal<Speaker>({
    name: 'M. Martial YAOGO',
    role: 'Expert Comptable',
    organization: 'KMAA Academy',
    bio: 'Entrepreneur, formateur et passionnÃ© par la transformation des organisations et le dÃ©veloppement des talents.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=85',
    stats: [
      { value: '12+', label: 'annÃ©es dâ€™expÃ©rience' },
      { value: '80+', label: 'confÃ©rences' },
      { value: '2.4K', label: 'apprenants' },
    ],
  });

  /* =========================================================
     PROGRAMME
  ========================================================= */

   readonly sessions = signal<Session[]>([
    {
      time: '18:00',
      duration: '10 min',
      title: 'Ouverture & bienvenue',
      description:
        'Introduction, prÃ©sentation de lâ€™expert et dÃ©couverte des objectifs de la session.',
      status: 'done',
    },
    {
      time: '18:10',
      duration: '25 min',
      title: 'Pourquoi les grands projets Ã©chouent-ils ?',
      description:
        'Comprendre les erreurs classiques et les blocages qui empÃªchent une idÃ©e de devenir un projet.',
      status: 'done',
    },
    {
      time: '18:35',
      duration: '30 min',
      title: 'Construire une vision forte',
      description:
        'MÃ©thodes concrÃ¨tes pour dÃ©finir une vision claire, mobilisatrice et mesurable.',
      status: 'live',
    },
    {
      time: '19:05',
      duration: '25 min',
      title: 'Leadership & passage Ã  lâ€™action',
      description:
        'Transformer sa vision en dÃ©cisions, habitudes et rÃ©sultats.',
      status: 'next',
    },
    {
      time: '19:30',
      duration: '20 min',
      title: 'Questions & rÃ©ponses',
      description:
        'Ã‰change direct avec lâ€™expert autour des problÃ©matiques des participants.',
      status: 'next',
    },
    {
      time: '19:50',
      duration: '10 min',
      title: 'Conclusion & challenge',
      description:
        'SynthÃ¨se, challenge personnel et prochaines Ã©tapes.',
      status: 'next',
    },
  
  ]);

  /* =========================================================
     VIDÃ‰OS YOUTUBE
  ========================================================= */

  readonly videos = signal<MasterclassVideo[]>([
    {
      id: 'qp0HIF3SfI4',
      title: 'How Great Leaders Inspire Action',
      speaker: 'Simon Sinek â€” TED',
      duration: '18:04',
      category: 'Leadership',
      description:
        'Une rÃ©fÃ©rence incontournable sur la vision, le leadership et la capacitÃ© Ã  inspirer.',
    },
    {
      id: 'eIho2S0ZahI',
      title: 'How to Speak So That People Want to Listen',
      speaker: 'Julian Treasure â€” TED',
      duration: '9:58',
      category: 'Communication',
      description:
        'Comprendre comment communiquer avec plus dâ€™impact et capter vÃ©ritablement lâ€™attention.',
    },
  ]);

  /* =========================================================
     CHAT
  ========================================================= */

  readonly chatMessages = signal<ChatMessage[]>([
    {
      id: 1,
      author: 'Aminata',
      role: 'participant',
      message: 'Bonjour Ã  tous ðŸ‘‹',
      time: '18:32',
    },
    {
      id: 2,
      author: 'M. Martial YAOGO',
      role: 'expert',
      message: 'Bienvenue Ã  tous ! Nous allons parler de vision et surtout de passage Ã  lâ€™action.',
      time: '18:33',
    },
    {
      id: 3,
      author: 'Issouf',
      role: 'participant',
      message: 'TrÃ¨s intÃ©ressant, surtout la partie sur les projets qui Ã©chouent.',
      time: '18:35',
    },
    {
      id: 4,
      author: 'Fatou',
      role: 'participant',
      message: 'Est-ce quâ€™on peut appliquer cette mÃ©thode Ã  un projet Ã©tudiant ?',
      time: '18:36',
    },
  ]);

  chatDraft = '';

  /* =========================================================
     QUESTIONS
  ========================================================= */

  readonly questions = signal<Question[]>([
    {
      id: 1,
      author: 'Aminata Z.',
      question:
        'Comment maintenir une vision claire lorsque plusieurs personnes travaillent sur le mÃªme projet ?',
      likes: 18,
      answered: true,
      answer:
        'Il faut transformer la vision en objectifs communs, puis dÃ©finir des indicateurs simples permettant Ã  chaque membre de comprendre sa contribution.',
    },
    {
      id: 2,
      author: 'Issouf O.',
      question:
        'Quelle est la premiÃ¨re chose Ã  faire lorsquâ€™on souhaite transformer une idÃ©e en projet ?',
      likes: 12,
      answered: false,
    },
    {
      id: 3,
      author: 'Fatou K.',
      question:
        'Comment convaincre une Ã©quipe de suivre une nouvelle vision ?',
      likes: 9,
      answered: false,
    },
  ]);

  questionDraft = '';

  /* =========================================================
     RÃ‰ACTIONS
  ========================================================= */

  readonly reactions = signal({
    heart: 42,
    fire: 67,
    clap: 31,
    idea: 25,
  });

  /* =========================================================
     SONDAGE
  ========================================================= */

  readonly pollOptions = [
    'DÃ©finir ma vision',
    'AmÃ©liorer mon leadership',
    'Mieux communiquer',
    'Passer Ã  lâ€™action',
  ];

  readonly selectedPoll = signal<string | null>(null);
  readonly pollSubmitted = signal(false);

  /* =========================================================
     RESSOURCES
  ========================================================= */

   readonly resources = signal<MasterclassResource[]>([ 
    {
      icon: 'ðŸ“˜',
      title: 'Guide â€” Construire sa vision',
      type: 'PDF',
      size: '2.4 MB',
    },
    {
      icon: 'ðŸ“Š',
      title: 'Canvas Vision & Objectifs',
      type: 'PDF',
      size: '1.1 MB',
    },
    {
      icon: 'ðŸ§ ',
      title: 'Checklist Leadership',
      type: 'PDF',
      size: '840 KB',
    },
    {
      icon: 'ðŸ“',
      title: 'Notes de la Masterclass',
      type: 'PDF',
      size: '1.7 MB',
    },
  ]);

  /* =========================================================
     QUIZ
  ========================================================= */

 readonly quizQuestions = signal<QuizQ[]>([ 
    {
      question:
        'Quel est le premier Ã©lÃ©ment permettant de mobiliser une Ã©quipe autour dâ€™un projet ?',
      options: [
        'Une vision claire',
        'Un budget important',
        'Une grande Ã©quipe',
        'Une campagne publicitaire',
      ],
      correct: 0,
    },
    {
      question:
        'Quel est le meilleur moyen de transformer une vision en action ?',
      options: [
        'Attendre le moment parfait',
        'DÃ©finir des objectifs concrets',
        'Multiplier les rÃ©unions',
        'Changer rÃ©guliÃ¨rement de stratÃ©gie',
      ],
      correct: 1,
    },
    {
      question:
        'Un bon leader doit principalement savoir :',
      options: [
        'Tout contrÃ´ler',
        'Travailler seul',
        'Donner du sens et mobiliser',
        'Ã‰viter les erreurs',
      ],
      correct: 2,
    },
  ]);

  readonly quizAnswers = signal<number[]>([]);
  readonly quizSubmitted = signal(false);

    readonly quizScore = computed(() => {
    const answers = this.quizAnswers();

    if (!answers.length) {
      return 0;
    }

    return answers.reduce((score, answer, index) => {
      return score + (answer === this.quizQuestions()[index].correct ? 1 : 0);
    }, 0);
  });

  /* =========================================================
     FEEDBACK
  ========================================================= */

  readonly rating = signal(0);
  feedbackComment = '';
  readonly feedbackSubmitted = signal(false);

  /* =========================================================
     CERTIFICAT
  ========================================================= */

  readonly certificateUnlocked = computed(() =>
    this.quizSubmitted() &&
    this.quizScore() >= 2 &&
    this.feedbackSubmitted()
  );

  /* =========================================================
     STATISTIQUES
  ========================================================= */

  readonly completionRate = computed(() => {
    let progress = 25;

    if (this.videoProgress() >= 50) {
      progress += 25;
    }

    if (this.quizSubmitted()) {
      progress += 25;
    }

    if (this.feedbackSubmitted()) {
      progress += 25;
    }

    return progress;
  });

  /* =========================================================
     INSCRIPTION
  ========================================================= */

  register(): void {
    this.isRegistered.set(true);

    try {
      localStorage.setItem('masterclass_registered', 'true');
    } catch {
      // localStorage indisponible : on continue simplement en mÃ©moire.
    }
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

  setTab(tab: 'programme' | 'interactions' | 'ressources'): void {
    this.activeTab.set(tab);
  }

  /* =========================================================
     VIDÃ‰O
  ========================================================= */

  selectVideo(videoId: string): void {
    this.currentVideoId.set(videoId);
    this.videoProgress.set(0);
  }

  markVideoProgress(value: number): void {
    this.videoProgress.set(Math.min(100, Math.max(0, value)));
  }

  /* =========================================================
     CHAT
  ========================================================= */

  sendChatMessage(): void {
    const message = this.chatDraft.trim();

    if (!message) {
      return;
    }

    this.chatMessages.update(messages => [
      ...messages,
      {
        id: Date.now(),
        author: 'Vous',
        role: 'participant',
        message,
        time: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);

    this.chatDraft = '';
  }

  /* =========================================================
     QUESTIONS
  ========================================================= */

  sendQuestion(): void {
    const question = this.questionDraft.trim();

    if (!question) {
      return;
    }

    this.questions.update(questions => [
      {
        id: Date.now(),
        author: 'Vous',
        question,
        likes: 0,
        answered: false,
      },
      ...questions,
    ]);

    this.questionDraft = '';
  }

  likeQuestion(id: number): void {
    this.questions.update(questions =>
      questions.map(question =>
        question.id === id
          ? { ...question, likes: question.likes + 1 }
          : question
      )
    );
  }

  /* =========================================================
     RÃ‰ACTIONS
  ========================================================= */

  react(type: 'heart' | 'fire' | 'clap' | 'idea'): void {
    this.reactions.update(current => ({
      ...current,
      [type]: current[type] + 1,
    }));
  }

  /* =========================================================
     SONDAGE
  ========================================================= */

  selectPoll(option: string): void {
    this.selectedPoll.set(option);
  }

  submitPoll(): void {
    if (!this.selectedPoll()) {
      return;
    }

    this.pollSubmitted.set(true);
  }

  /* =========================================================
     QUIZ
  ========================================================= */

  selectQuizAnswer(questionIndex: number, answerIndex: number): void {
    this.quizAnswers.update(current => {
      const answers = [...current];
      answers[questionIndex] = answerIndex;
      return answers;
    });
  }

  // submitQuiz(): void {
  //   if (this.quizAnswers().length !== this.quizQuestions.length) {
  //     return;
  //   }

  //   this.quizSubmitted.set(true);
  // }
    submitQuiz(): void {
    if (this.quizAnswers().length !== this.quizQuestions().length) {
      return;
    }

    this.quizSubmitted.set(true);
  }

  /* =========================================================
     FEEDBACK
  ========================================================= */

  setRating(value: number): void {
    this.rating.set(value);
  }

  submitFeedback(): void {
    if (!this.rating()) {
      return;
    }

    this.feedbackSubmitted.set(true);
  }

  /* =========================================================
     RESSOURCES
  ========================================================= */

  downloadResource(resource: MasterclassResource): void {
    /*
     * Pour le moment, pas de backend.
     * Cette fonction simule le tÃ©lÃ©chargement.
     * Plus tard :
     * -> URL renvoyÃ©e par le backend
     * -> tÃ©lÃ©chargement rÃ©el.
     */
    console.log(`TÃ©lÃ©chargement simulÃ© : ${resource.title}`);
  }

  /* =========================================================
     CERTIFICAT
  ========================================================= */

  downloadCertificate(): void {
    if (!this.certificateUnlocked()) {
      return;
    }

    console.log('GÃ©nÃ©ration du certificat...');
  }
}