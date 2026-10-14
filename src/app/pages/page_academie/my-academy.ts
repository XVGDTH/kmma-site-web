import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../shared/notification.service';


type TopicIcon = 'affaires' | 'comptabilite' | 'sante' | 'tech' | 'audit' | 'langues';

type SubjectIcon =
  | 'affaires' | 'comptabilite' | 'psychologie' | 'sante' | 'donnees'
  | 'informatique' | 'droit' | 'direction' | 'marketing' | 'enseignement'
  | 'langues' | 'rh' | 'audit' | 'communication' | 'entrepreneuriat'
  | 'developpement-durable' | 'ingenierie' | 'design';

  // ============================================================
// 🆕 SECTION « LA FORMATION KMAA » — présentiel & distanciel
// ============================================================
// ============================================================
// 🆕 SECTION « LA FORMATION KMAA » — présentiel & distanciel
// ============================================================
type TrainingStatIcon = 'modules' | 'satisfaction' | 'modes';

interface TrainingStat {
  value: string;
  label: string;
  icon: TrainingStatIcon;
}

interface TrainingFormat {
  mode: 'presentiel' | 'distanciel';
  title: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  highlights: string[];
  ctaCoursesLabel: string;
  ctaCoursesRoute: string;
}

interface TrainingSubscription {
  name: string;
  price: string;
  period?: string;
  description: string;
  popular: boolean;
  features: string[];
  ctaLabel: string;
  ctaRoute: string;
}

interface TrainingVoucher {
  badge: string;
  discount: string;
  title: string;
  description: string;
  condition: string;
  reference: string;
}
interface Subject {
  label: string;
  icon: SubjectIcon;
  route: string;
}

interface AcademyCourse {
  title: string;
  excerpt: string;
  badge: string;
  image: string;   
  imageAlt: string;
  route: string;
}

interface AcademyTestimonial {
  quote: string;
  author: string;
}

interface AcademyTopic {
  label: string;
  icon: TopicIcon;
  title: string;
  description: string[];
  testimonial: AcademyTestimonial;
  ctaLabel: string;
  ctaRoute: string;
  courses: AcademyCourse[];
}

interface PricingFeature {
  label: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  ctaLabel: string;
  ctaRoute: string;
  featured: boolean;
  features: PricingFeature[];
}

interface HighlightBanner {
  eyebrow?: string;
  title: string;
  text: string;
  ctaLabel: string;
  ctaRoute: string;
  image: string;
  imageAlt: string;
}

interface MiniCourse {
  title: string;
  excerpt: string;
  badge: string;
  image: string;
  imageAlt: string;
  route: string;
}

interface HowItWorksStep {
  number: number;
  title: string;
  text: string;
}

interface HowItWorksTab {
  label: string;
  steps: HowItWorksStep[];
}

@Component({
  selector: 'app-my-academy',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-academy.html',
  styleUrl: './my-academy.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyAcademy {
  readonly activeIndex = signal(0);
  //
  //notifications
  //
  private readonly router = inject(Router);

goToMySpace(): void {
  // Connecté → dashboard ; sinon l'espace demandera le login via guard
  this.router.navigate(['/apprendre']);
}
 
  // 
  // 
  //
  readonly topicIcons: Record<TopicIcon, string> = {
    // Livre ouvert — Affaires & Gestion
    affaires: 'M12 6.5C10.5 5 8.5 4 6 4H3v14h3c2.5 0 4.5 1 6 2.5 M12 6.5C13.5 5 15.5 4 18 4h3v14h-3c-2.5 0-4.5 1-6 2.5V6.5Z',
    // Calculatrice — Comptabilité analytique de gestion
    comptabilite: 'M6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z M8 6h8 M8 11h.01 M12 11h.01 M16 11h.01 M8 15h.01 M12 15h.01 M16 15h.01 M8 19h.01 M12 19h.01',
    // Coeur avec pouls — Santé et médecine
    sante: 'M20.8 8.5c0 4-4.4 7.5-8.8 11.5-4.4-4-8.8-7.5-8.8-11.5a4.7 4.7 0 0 1 8.8-2.3 4.7 4.7 0 0 1 8.8 2.3Z M8 12h2l1.5-3 2 6 1.5-3H16',
    // Puce/écran tactile — Tech & IT
    tech: 'M9 9h6v6H9z M4 9h2 M4 15h2 M18 9h2 M18 15h2 M9 4v2 M15 4v2 M9 18v2 M15 18v2',
    // Bouclier check — Systèmes de contrôle & audit
    audit: 'M9 12l2 2 4-4 M12 3l8 4v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4Z',
    // Globe — Langues
    langues: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3a13.7 13.7 0 0 1 3.5 9A13.7 13.7 0 0 1 12 21a13.7 13.7 0 0 1-3.5-9A13.7 13.7 0 0 1 12 3Z',
  };

  readonly topics: AcademyTopic[] = [
    {
      label: 'Affaires et gestion',
      icon: 'affaires',
      title: 'Affaires et gestion',
      description: [
        'Développez une vision stratégique de la gestion d\'entreprise : organisation, pilotage, prise de décision et leadership au quotidien.',
        'Nos formations s\'appuient sur des cas concrets tirés du tissu économique local pour vous préparer aux réalités du terrain.',
      ],
      testimonial: {
        quote: 'J\'ai enfin compris comment structurer la gestion de mon entreprise grâce à des méthodes simples et efficaces.',
        author: 'Rasmané, Ouagadougou',
      },
      ctaLabel: 'Découvrir affaires et gestion',
      ctaRoute: '/mes-cours/affaires',
      courses: [
        
        {
          title: 'Fondamentaux du management d\'entreprise',
          excerpt: 'Les bases pour organiser, planifier et piloter une équipe ou une structure.',
          badge: 'Programme complet',
          image: 'gestion_affaires.png',
          imageAlt: 'Fondamentaux du management d\'entreprise',
          route: '/mes-cours/affaires/fondamentaux-management',
        },
        {
          title: 'Stratégie et prise de décision',
          excerpt: 'Apprenez à analyser une situation et à décider avec méthode.',
          badge: 'Parcours court',
          image: 'prise_de_decision.png',
          imageAlt: 'Stratégie et prise de décision',
          route: '/mes-cours/affaires/strategie-decision',
        },
      ],
    },
    {
      label: 'Comptabilité analytique de gestion',
      icon: 'comptabilite',
      title: 'Comptabilité analytique de gestion',
      description: [
        'Maîtrisez le calcul des coûts, l\'analyse de la rentabilité et le contrôle budgétaire pour éclairer les décisions de gestion.',
        'Un programme pratique, orienté outils, pour transformer vos données comptables en véritable aide à la décision.',
      ],
      testimonial: {
        quote: 'Grâce à cette formation, je sais désormais calculer le coût réel de chaque produit de mon entreprise.',
        author: 'Awa, Bobo-Dioulasso',
      },
      ctaLabel: 'Découvrir la comptabilité analytique',
      ctaRoute: '/mes-cours/comptabilite',
      courses: [
        {
          title: 'Calcul et analyse des coûts',
          excerpt: 'Méthodes de coûts complets, coûts variables et seuil de rentabilité.',
          badge: 'Programme certifiant',
          image: 'calculs_de_couts.png',
          imageAlt: 'Calcul et analyse des coûts',
          route: '/mes-cours/comptabilite/calcul-couts',
        },
        {
          title: 'Contrôle budgétaire',
          excerpt: 'Construire, suivre et ajuster un budget prévisionnel efficace.',
          badge: 'Parcours court',
          image: 'controle_budgetaire.png',
          imageAlt: 'Contrôle budgétaire',
          route: '/mes-cours/comptabilite/controle-budgetaire',
        },
      ],
    },
    {
      label: 'Santé et médecine',
      icon: 'sante',
      title: 'Santé et médecine',
      description: [
        'Développez des compétences essentielles pour les métiers de la santé : gestion administrative des structures sanitaires, hygiène et sécurité au travail.',
        'Des formations pensées pour les professionnels de santé comme pour le personnel administratif des établissements médicaux.',
      ],
      testimonial: {
        quote: 'Une formation utile pour mieux comprendre la gestion administrative d\'une structure de santé.',
        author: 'Clarisse, Ouagadougou',
      },
      ctaLabel: 'Découvrir santé et médecine',
      ctaRoute: '/mes-cours/sante',
      courses: [
        {
          title: 'Gestion administrative des structures de santé',
          excerpt: 'Organisez efficacement les aspects administratifs d\'un établissement de santé.',
          badge: 'Parcours court',
          image: 'administration_sante.png',
          imageAlt: 'Gestion administrative des structures de santé',
          route: '/mes-cours/sante/administration-sante',
        },
        {
          title: 'Hygiène et sécurité au travail',
          excerpt: 'Les bonnes pratiques pour un environnement de travail sain et sécurisé.',
          badge: 'Parcours court',
          image: 'hygene_sanitaire.png',
          imageAlt: 'Hygiène et sécurité au travail',
          route: '/mes-cours/sante/hygiene-securite',
        },
      ],
    },
    {
      label: 'Tech & IT',
      icon: 'tech',
      title: 'Tech & IT',
      description: [
        'Développez des compétences numériques recherchées : bureautique avancée, outils de gestion digitale et bases de la cybersécurité.',
        'Des parcours accessibles, quel que soit votre niveau de départ, pour vous approprier les outils numériques du monde professionnel.',
      ],
      testimonial: {
        quote: 'J\'ai appris à utiliser des outils numériques que j\'utilise maintenant tous les jours au bureau.',
        author: 'Ibrahim, Ouagadougou',
      },
      ctaLabel: 'Découvrir tech & IT',
      ctaRoute: '/mes-cours/informatique',
      courses: [
        {
          title: 'Bureautique avancée pour l\'entreprise',
          excerpt: 'Maîtrisez les outils bureautiques indispensables à la vie professionnelle.',
          badge: 'Parcours court',
          image: 'bureautique.png',
          imageAlt: 'Bureautique avancée pour l\'entreprise',
          route: '/mes-cours/informatique/bureautique',
        },
        {
          title: 'Initiation à la cybersécurité',
          excerpt: 'Les réflexes essentiels pour protéger les données de votre organisation.',
          badge: 'Parcours court',
          image: 'cybersecurite.png',
          imageAlt: 'Initiation à la cybersécurité',
          route: '/mes-cours/informatique/cybersecurite',
        },
      ],
    },
    {
      label: 'Systèmes de contrôle & audit',
      icon: 'audit',
      title: 'Systèmes de contrôle & audit',
      description: [
        'Renforcez vos compétences en audit interne, contrôle de gestion et reddition des comptes avec des cas pratiques réels.',
        'Nos formateurs, issus du terrain, partagent des méthodes directement transposables dans votre organisation.',
      ],
      testimonial: {
        quote: 'Une formation rigoureuse qui m\'a permis de structurer mes premiers audits internes.',
        author: 'Boureima, Koudougou',
      },
      ctaLabel: 'Découvrir l\'audit',
      ctaRoute: '/mes-cours/audit',
      courses: [
        {
          title: 'Fondamentaux de l\'audit interne',
          excerpt: 'Les méthodes et outils clés pour mener une mission d\'audit interne de A à Z.',
          badge: 'Programme certifiant',
          image: 'audit_interne.png',
          imageAlt: 'Fondamentaux de l\'audit interne',
          route: '/mes-cours/audit/interne',
        },
        {
          title: 'Contrôle de gestion appliqué',
          excerpt: 'Mettez en place des tableaux de bord pertinents pour piloter la performance.',
          badge: 'Parcours court',
          image: 'controle_gestion.png',
          imageAlt: 'Contrôle de gestion appliqué',
          route: '/audit/controle-gestion',
        },
      ],
    },
    {
      label: 'Langues',
      icon: 'langues',
      title: 'Langues',
      description: [
        'Maîtrisez l\'art de la communication professionnelle en français, en anglais et dans les langues locales pour élargir vos opportunités.',
        'Des cours conçus pour un usage concret : rédaction professionnelle, prise de parole en public et communication interculturelle.',
      ],
      testimonial: {
        quote: 'Mon niveau d\'anglais professionnel s\'est nettement amélioré en quelques semaines seulement.',
        author: 'Sana, Ouagadougou',
      },
      ctaLabel: 'Découvrir les langues',
      ctaRoute: '/mes-cours/langues',
      courses: [
        {
          title: 'Anglais professionnel',
          excerpt: 'Communiquez avec aisance en contexte professionnel et international.',
          badge: 'Parcours court',
          image: 'anglais.png',
          imageAlt: 'Anglais professionnel',
          route: '/mes-cours/langues/anglais',
        },
        {
          title: 'Rédaction administrative en français',
          excerpt: 'Rédigez des courriers, rapports et comptes rendus clairs et efficaces.',
          badge: 'Parcours court',
          image: 'redaction_francais.png',
          imageAlt: 'Rédaction administrative en français',
          route: '/mes-cours/langues/redaction-administrative',
        },
      ],
    },
  ];

  // --- Nos matières ----------------------------------------------------------
  readonly subjectIcons: Record<SubjectIcon, string> = {
    affaires: 'M12 6.5C10.5 5 8.5 4 6 4H3v14h3c2.5 0 4.5 1 6 2.5 M12 6.5C13.5 5 15.5 4 18 4h3v14h-3c-2.5 0-4.5 1-6 2.5V6.5Z',
    comptabilite: 'M6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z M8 6h8 M8 11h.01 M12 11h.01 M16 11h.01 M8 15h.01 M12 15h.01',
    psychologie: 'M9 3a5 5 0 0 0-4.5 7.2C3.6 11.2 3 12.5 3 14a4 4 0 0 0 4 4h.5 M9 3a5 5 0 0 1 4.5 7.2c.9 1 1.5 2.3 1.5 3.8a4 4 0 0 1-4 4h-.5 M9 3v18',
    sante: 'M20.8 8.5c0 4-4.4 7.5-8.8 11.5-4.4-4-8.8-7.5-8.8-11.5a4.7 4.7 0 0 1 8.8-2.3 4.7 4.7 0 0 1 8.8 2.3Z M8 12h2l1.5-3 2 6 1.5-3H16',
    donnees: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
    informatique: 'M9 9h6v6H9z M4 9h2 M4 15h2 M18 9h2 M18 15h2 M9 4v2 M15 4v2 M9 18v2 M15 18v2',
    droit: 'M12 3v18 M5 8l-3 6a3 3 0 0 0 6 0l-3-6Z M19 8l-3 6a3 3 0 0 0 6 0l-3-6Z M5 8h14 M8 21h8',
    direction: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M16.2 7.8l-2.6 5.5-5.5 2.6 2.6-5.5 5.5-2.6Z',
    marketing: 'M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1Z M16 8a5 5 0 0 1 0 8 M19 5a9 9 0 0 1 0 14',
    enseignement: 'M22 10 12 5 2 10l10 5 10-5Z M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5',
    langues: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3a13.7 13.7 0 0 1 3.5 9A13.7 13.7 0 0 1 12 21a13.7 13.7 0 0 1-3.5-9A13.7 13.7 0 0 1 12 3Z',
    rh: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    audit: 'M9 12l2 2 4-4 M12 3l8 4v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4Z',
    communication: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z',
    entrepreneuriat: 'M9 18h6 M10 22h4 M12 2a7 7 0 0 0-7 7c0 3 2 4.5 3 6s1 2 1 3h6c0-1 0-1.5 1-3s3-3 3-6a7 7 0 0 0-7-7Z',
    'developpement-durable': 'M11 20A7 7 0 0 1 4 13c0-4 3-7.5 7-11 4 3.5 7 7 7 11a7 7 0 0 1-7 7Z',
    ingenierie: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.4.66.74.85.34.19.51.24 1.87.24H22a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
    design: 'M12 19l7-7 3 3-7 7-3-3Z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z M2 2l7.586 7.586 M11 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  };



  readonly subjects: Subject[] = [
  { label: 'Affaires et gestion', icon: 'affaires', route: '/mes-cours/affaires' },
  { label: 'Comptabilité et finance', icon: 'comptabilite', route: '/mes-cours/comptabilite' },
  { label: 'Psychologie', icon: 'psychologie', route: '/mes-cours/psychologie' },
  { label: 'Soins de santé', icon: 'sante', route: '/mes-cours/sante' },
  { label: 'Analyse de données', icon: 'donnees', route: '/mes-cours/donnees' },
  { label: 'Informatique et technologie', icon: 'informatique', route: '/mes-cours/informatique' },
  { label: 'Droit', icon: 'droit', route: '/mes-cours/droit' },
  { label: 'Direction et leadership', icon: 'direction', route: '/mes-cours/direction' },
  { label: 'Marketing', icon: 'marketing', route: '/mes-cours/marketing' },
  { label: 'Enseignement et pédagogie', icon: 'enseignement', route: '/mes-cours/enseignement' },
  { label: 'Langues', icon: 'langues', route: '/mes-cours/langues' },
  { label: 'Ressources humaines', icon: 'rh', route: '/mes-cours/rh' },
  { label: 'Audit et contrôle de gestion', icon: 'audit', route: '/mes-cours/audit' },
  { label: 'Communication', icon: 'communication', route: '/mes-cours/communication' },
  { label: 'Entrepreneuriat', icon: 'entrepreneuriat', route: '/mes-cours/entrepreneuriat' },
  { label: 'Développement durable', icon: 'developpement-durable', route: '/mes-cours/developpement-durable' },
  { label: 'Ingénierie', icon: 'ingenierie', route: '/mes-cours/ingenierie' },
  { label: 'Design et créativité', icon: 'design', route: '/mes-cours/design' },
];

  // ============================================================
  // 🆕 DONNÉES — La formation KMAA (présentiel & distanciel)
  // ============================================================
readonly trainingStatIcons: Record<TrainingStatIcon, string> = {
  modules: 'M12 6.5C10.5 5 8.5 4 6 4H3v14h3c2.5 0 4.5 1 6 2.5 M12 6.5C13.5 5 15.5 4 18 4h3v14h-3c-2.5 0-4.5 1-6 2.5V6.5Z',
  satisfaction: 'M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 16.9 6.2 19.9l1.1-6.5L2.6 8.8l6.5-.9L12 2Z',
  modes: 'M2 4h20v12H2z M8 20h8 M12 16v4',
};

readonly trainingStats: TrainingStat[] = [
  {
    value: '18+',
    label: 'Modules et parcours conçus par des formateurs experts, issus du terrain professionnel.',
    icon: 'modules',
  },
  {
    value: '95%',
    label: 'De satisfaction chez nos apprenants : des cours concrets, orientés pratique et résultats.',
    icon: 'satisfaction',
  },
  {
    value: '2',
    label: 'Modes de formation au choix : rejoignez-nous dans nos locaux ou formez-vous depuis chez vous.',
    icon: 'modes',
  },
];

readonly trainingFormats: TrainingFormat[] = [
  {
    mode: 'presentiel',
    title: 'Formation en présentiel',
    tagline: "L'énergie du collectif, dans nos locaux",
    description:
      "Des séances en salle encadrées par nos formateurs : échanges directs, ateliers pratiques, mises en situation et networking avec d'autres professionnels.",
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Séance de formation en présentiel à l\'académie KMAA',
    highlights: [
      'Salles équipées à Ouagadougou et Bobo-Dioulasso',
      'Ateliers pratiques et études de cas réels',
      'Échanges directs avec les formateurs',
      'Networking entre apprenants et entreprises',
    ],
    ctaCoursesLabel: 'Voir nos cours en présentiel',
    ctaCoursesRoute: '/entreprises/formations',   // ✅ MODIFIÉ
  },
  {
    mode: 'distanciel',
    title: 'Formation à distance',
    tagline: 'La flexibilité du 100 % en ligne',
    description:
      "Apprenez où que vous soyez, à votre rythme : classes virtuelles en direct, replays disponibles 24h/24, exercices corrigés et suivi personnalisé par nos équipes pédagogiques.",
    image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Apprenante suivant une formation KMAA à distance sur son ordinateur',
    highlights: [
      'Classes virtuelles en direct + replays à la demande',
      'Contenus accessibles sur mobile et ordinateur',
      'Exercices corrigés et quiz de progression',
      'Assistance pédagogique du lundi au samedi',
    ],
    ctaCoursesLabel: 'Voir nos cours en ligne',
    ctaCoursesRoute: '/entreprises/formations',   // ✅ MODIFIÉ
  },
];

readonly trainingSubscriptions: TrainingSubscription[] = [
  {
    name: 'Pack 10 personnes',
    price: 'Sur devis',
    period: 'pour 10 apprenants',
    description: 'Idéal pour les petites équipes ou les groupes constitués qui démarrent.',
    popular: false,
    features: [
      'Accès à tous les modules, présentiel et distanciel',
      'Sessions intra-entreprise (dans vos locaux ou les nôtres)',
      'Suivi de progression groupé',
      'Attestation de formation pour chaque participant',
    ],
    ctaLabel: 'Demander un devis',
    ctaRoute: '/contact',
  },
  {
    name: 'Pack 20 personnes',
    price: 'Sur devis',
    period: 'pour 20 apprenants',
    description: 'Le format privilégié par les PME et institutions en pleine croissance.',
    popular: true,
    features: [
      'Tous les modules + parcours sur mesure',
      'Sessions en présentiel ET à distance',
      'Reporting RH détaillé + suivi pédagogique',
      'Réductions volume applicables',
      'Certificat de réussite pour chaque apprenant',
    ],
    ctaLabel: 'Choisir le Pack 20',
    ctaRoute: '/contact',
  },
  {
    name: 'Sur devis',
    price: 'Sur mesure',
    period: '+ de 20 apprenants',
    description: 'Pour les grandes organisations : programme entièrement personnalisé.',
    popular: false,
    features: [
      'Programme construit main dans la main',
      'Sessions illimitées selon vos besoins',
      'Interlocuteur dédié + accompagnement premium',
      'Reporting avancé pour votre direction',
      'Réductions volume maximales',
    ],
    ctaLabel: 'Contacter un conseiller',
    ctaRoute: '/contact',
  },
];

readonly trainingVouchers: TrainingVoucher[] = [
  {
    badge: '10+',
    discount: '-10%',
    title: 'À partir de 10 personnes',
    description: 'Inscrivez 10 apprenants au même programme et bénéficiez de 10 % de réduction.',
    condition: 'Groupes constitués',
    reference: 'OFFRE-GROUPE-10',
  },
  {
    badge: '20+',
    discount: '-18%',
    title: 'À partir de 20 personnes',
    description: 'Formez une équipe de 20 personnes ou plus et économisez 18 % sur l\'ensemble.',
    condition: 'PME & institutions',
    reference: 'OFFRE-GROUPE-20',
  },
  {
    badge: '20+',
    discount: '-25%',
    title: 'Plus de 20 personnes',
    description: 'Pour les grands déploiements : bénéficiez de notre meilleur tarif volume.',
    condition: 'Grands comptes',
    reference: 'OFFRE-VOLUME-25',
  },
];


  // ============================================================
  // 🎟️ Copie de la référence d'une offre groupe
  // ============================================================
  readonly copiedReference = signal<string | null>(null);

  copyVoucherReference(reference: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(reference).then(() => {
        this.copiedReference.set(reference);
        setTimeout(() => this.copiedReference.set(null), 2500);
      });
    }
  }

  // --- Formules d'accompagnement --------------------------------------------
  readonly pricingPlans: PricingPlan[] = [
    {
      name: 'Accès libre',
      price: '0 FCFA',
      description: 'Découvrez nos contenus et commencez à apprendre dès aujourd\'hui.',
      ctaLabel: 'Explorer les formations',
      ctaRoute: '/formations',
      featured: false,
      features: [
        { label: 'Accès à une sélection de cours', included: true },
        { label: 'Ressources pédagogiques de base', included: true },
        { label: 'Certificat de réussite', included: false },
        { label: 'Accompagnement personnalisé', included: false },
      ],
    },
    {
      name: 'Formule Standard',
      price: 'Sur devis',
      priceNote: 'Facturation mensuelle ou annuelle',
      description: 'L\'essentiel pour progresser sérieusement, avec un accès complet à nos parcours.',
      ctaLabel: 'Choisir cette formule',
      ctaRoute: '/contact',
      featured: true,
      features: [
        { label: 'Accès complet à tous les parcours', included: true },
        { label: 'Certificats de réussite', included: true },
        { label: 'Suivi pédagogique régulier', included: true },
        { label: 'Coaching individuel', included: false },
      ],
    },
    {
      name: 'Formule Premium',
      price: 'Sur devis',
      priceNote: 'Facturation mensuelle ou annuelle',
      description: 'Un accompagnement complet pour accélérer votre carrière.',
      ctaLabel: 'Choisir cette formule',
      ctaRoute: '/contact',
      featured: false,
      features: [
        { label: 'Tout ce qui est inclus dans Standard', included: true },
        { label: 'Coaching individuel', included: true },
        { label: 'Accompagnement carrière', included: true },
        { label: 'Accès prioritaire aux nouvelles sessions', included: true },
      ],
    },
  ];

  // --- Bandeaux de mise en avant ---------------------------------------------
  readonly accessibilityBanner: HighlightBanner = {
    eyebrow: 'Accessibilité',
    title: 'Une formation accessible en français pour vous',
    text: 'Nous adaptons nos supports pédagogiques pour qu\'ils restent clairs et accessibles, quel que soit votre niveau de départ ou votre langue de confort.',
    ctaLabel: 'En savoir plus',
    ctaRoute: '/a-propos',
    image: 'formation_accesible.png',
    imageAlt: 'Formation accessible en plusieurs langues',
  };

  readonly careerBanner: HighlightBanner = {
    eyebrow: 'Carrière',
    title: 'Boostez votre carrière avec nos formations conçues sur mesure ',
    text: 'Développez des compétences recherchées par les employeurs grâce à des formations pratiques, dispensées par des experts du terrain.',
    ctaLabel: 'Explorer les formations',
    ctaRoute: '/academy',
    image: 'carriere-boost.jpg',
    imageAlt: 'Boostez votre carrière avec KMAA',
  };

  readonly careerCourses: MiniCourse[] = [
    {
      title: 'Stratégie et pilotage financier',
      excerpt: 'Développez une vision stratégique de la gestion financière de votre organisation.',
      badge: 'Programme complet',
      image: 'pilotages_financiers.png',
      imageAlt: 'Stratégie et pilotage financier',
      route: '/formations/strategie-financiere',
    },
    {
      title: 'Leadership et management d\'équipe',
      excerpt: 'Les fondamentaux pour encadrer et motiver une équipe au quotidien.',
      badge: 'Parcours court',
      image: 'leadership.png',
      imageAlt: 'Leadership et management d\'équipe',
      route: '/formations/leadership',
    },
    {
      title: 'Transformation digitale des PME',
      excerpt: 'Intégrez les outils numériques essentiels à la croissance de votre entreprise.',
      badge: 'Bootcamp',
      image: 'transformation_digitale.png',
      imageAlt: 'Transformation digitale des PME',
      route: '/formations/transformation-digitale',
    },
    {
      title: 'Droit des affaires',
      excerpt: 'Sécurisez juridiquement vos activités et vos contrats commerciaux.',
      badge: 'Attestation de formation',
      image: 'droits_affaires.png',
      imageAlt: 'Certification en droit des affaires',
      route: '/formations/droit-affaires',
    },
  ];

  // --- Poussez vos compétences plus loin (diplômes) --------------------------
  readonly diplomaCourses: MiniCourse[] = [
    {
      title: 'Attestation en gestion comptable et financière',
      excerpt: 'Un programme complet pour maîtriser la comptabilité générale, analytique et la finance d\'entreprise.',
      badge: 'Formation complète',
      image: 'comptable.png',
      imageAlt: 'Attestation en gestion comptable et financière',
      route: '/formations/diplome-comptabilite',
    },
    {
      title: 'Attestation en audit et contrôle de gestion',
      excerpt: 'Devenez expert des méthodes d\'audit interne et de pilotage de la performance.',
      badge: 'Formation complète',
      image: 'gestion.png',
      imageAlt: 'Attestation en audit et contrôle de gestion',
      route: '/formations/diplome-audit',
    },
    {
      title: 'Attestation en gestion administrative et RH',
      excerpt: 'Structurez la gestion administrative et les ressources humaines de toute organisation.',
      badge: 'Formation complète',
      image: 'rh.png',
      imageAlt: 'Attestation en gestion administrative et RH',
      route: '/formations/diplome-gestion',
    },
    {
      title: 'Attestation en accompagnement pédagogique',
      excerpt: 'Formez-vous aux méthodes de coaching et de mentorat professionnel.',
      badge: 'Formation complète',
      image: 'pedagogie.png',
      imageAlt: 'Attestation en accompagnement pédagogique',
      route: '/formations/diplome-accompagnement',
    },
  ];

  // --- Bandeau entreprise ------------------------------------------------------
  readonly enterpriseBanner: HighlightBanner = {
    eyebrow: 'KMAA Entreprise',
    title: 'Formez vos équipes avec KMAA Entreprise',
    text: 'Des parcours sur mesure pour développer les compétences de vos collaborateurs, adaptés aux réalités et aux objectifs de votre organisation.',
    ctaLabel: 'Contactez-nous',
    ctaRoute: '/contact',
    image: 'former_vos_equipes.png',
    imageAlt: 'KMAA Entreprise',
  };

  // --- Comment ça marche ? ------------------------------------------------------
  readonly activeStepsTab = signal(0);

    // ============================================================
  // 🔔 NOTIFICATIONS (badge sur « Mon espace »)
  // ============================================================

  private readonly notifService = inject(NotificationService);

  readonly unreadCount = this.notifService.unreadCount;

  constructor() {
    // Chargement initial + polling (30 s) pour le badge
    this.notifService.load();
    setInterval(() => this.notifService.load(), 30000);
  }

  readonly howItWorksTabs: HowItWorksTab[] = [
    {
      label: 'Parcours courts',
      steps: [
        { number: 1, title: 'Choisissez un parcours court', text: 'Des modules ciblés, du niveau débutant à avancé, conçus et enseignés par des experts.' },
        { number: 2, title: 'Inscrivez-vous', text: 'Accédez immédiatement au contenu du parcours choisi.' },
        { number: 3, title: 'Apprenez à votre rythme', text: 'Le contenu est divisé en modules clairs, à suivre selon votre disponibilité.' },
        { number: 4, title: 'Obtenez votre certificat', text: 'Une fois le parcours terminé, recevez votre certificat de réussite.' },
      ],
    },
    {
      label: 'Accompagnement',
      steps: [
        { number: 1, title: 'Exprimez votre besoin', text: 'Décrivez votre objectif : coaching, mentorat ou préparation à un examen.' },
        { number: 2, title: 'Rencontrez votre accompagnateur', text: 'Un premier échange pour définir ensemble un plan personnalisé.' },
        { number: 3, title: 'Suivez votre plan', text: 'Des séances régulières adaptées à votre progression.' },
        { number: 4, title: 'Atteignez votre objectif', text: 'Un bilan final pour mesurer les progrès réalisés.' },
      ],
    },
    {
      label: 'Formations certifiantes',
      steps: [
        { number: 1, title: 'Choisissez votre certification', text: 'Sélectionnez le domaine dans lequel vous souhaitez être certifié.' },
        { number: 2, title: 'Suivez le programme', text: 'Cours théoriques et cas pratiques encadrés par nos formateurs.' },
        { number: 3, title: 'Passez l\'évaluation', text: 'Un examen final valide vos acquis.' },
        { number: 4, title: 'Recevez votre certification', text: 'Un document reconnu à valoriser auprès des employeurs.' },
      ],
    },
    {
      label: 'Diplômes',
      steps: [
        { number: 1, title: 'Choisissez votre diplôme', text: 'Un programme complet dans le domaine de votre choix.' },
        { number: 2, title: 'Suivez le cursus complet', text: 'Modules progressifs répartis sur plusieurs mois.' },
        { number: 3, title: 'Réalisez votre projet final', text: 'Un projet ou mémoire pour mettre en pratique vos acquis.' },
        { number: 4, title: 'Obtenez votre diplôme', text: 'Une reconnaissance complète de votre parcours de formation.' },
      ],
    },
  ];

  setStepsTab(index: number): void {
    this.activeStepsTab.set(index);
  }
  // procedure de scroll cers le haut dans la section catalogue.
  scrollToCatalogue(): void {
  const el = document.getElementById('catalogue');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

  get activeSteps(): HowItWorksTab {
    return this.howItWorksTabs[this.activeStepsTab()];
  }

  get activeTopic(): AcademyTopic {
    return this.topics[this.activeIndex()];
  }

  setActive(index: number): void {
    this.activeIndex.set(index);
  }
}