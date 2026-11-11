import { AfterViewInit, Component, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavLink {
  id: string;
  label: string;
}

interface Gain {
  title: string;
  text: string;
}

interface Stake {
  title: string;
  text: string;
}

interface Formula {
  id: string;
  title: string;
  audience: string;
  text: string;
  items: string[];
}

interface Mission {
  id: string;
  title: string;
  summary: string;
  details: string[];
}

interface Level {
  title: string;
  items: string[];
}

interface Step {
  title: string;
  text: string;
}

interface Rhythm {
  period: string;
  items: string[];
}

interface Strength {
  title: string;
  text: string;
}

interface Profile {
  title: string;
  text: string;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
}

interface Insight {
  title: string;
  tags: string[];
  image: string;
}

interface Expert {
  name: string;
  initials: string;
  role: string;
  bio: string;
}

@Component({
  selector: 'app-expertise-comptable',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './expertise_comptable.html',
  styleUrl: './expertise_comptable.scss',
})
export class ExpertiseComptableComponent implements AfterViewInit, OnDestroy {
  /** Coordonnées de contact : à remplacer par les vraies. */
  readonly contactEmail = 'comptabilite@kmaa.com';

  /** Images (Unsplash). En cas d'échec de chargement, le bloc garde un fond vert de la charte. */
  readonly images = {
    hero: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1200&q=80',
    stakes: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1400&q=80',
    platform: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80',
  };

  readonly navLinks: NavLink[] = [
    { id: 'apercu', label: 'Aperçu' },
    { id: 'enjeux', label: 'Vos enjeux' },
    { id: 'formules', label: 'Nos réponses' },
    { id: 'missions', label: 'Missions' },
    { id: 'methode', label: 'Méthode' },
    { id: 'profils', label: 'Qui nous accompagnons' },
    { id: 'questions', label: 'Questions' },
    { id: 'actualites', label: 'Actualités' },
    { id: 'equipe', label: 'Équipe' },
  ];

  readonly gains: Gain[] = [
    { title: 'Du temps pour votre métier', text: 'Vous déléguez la comptabilité et gardez votre énergie pour vos clients et vos équipes.' },
    { title: 'Des comptes fiables', text: 'Des écritures contrôlées et des états financiers sur lesquels vos partenaires peuvent s’appuyer.' },
    { title: 'Une visibilité permanente', text: 'Des chiffres à jour, lisibles, pour décider sans attendre la clôture annuelle.' },
  ];

  readonly stakes: Stake[] = [
    {
      title: 'Conformité réglementaire',
      text: 'Respecter le référentiel comptable applicable et les obligations fiscales et sociales, dans les délais.',
    },
    {
      title: 'Fiabilité des données financières',
      text: 'Disposer d’informations complètes et cohérentes, à un coût opérationnel maîtrisé.',
    },
    {
      title: 'Information des financeurs',
      text: 'Fournir à vos banques, bailleurs, créanciers et associés des états détaillés et crédibles.',
    },
    {
      title: 'Pilotage de l’activité',
      text: 'Suivre vos marges, votre trésorerie et vos engagements pour anticiper plutôt que subir.',
    },
  ];

  readonly formulas: Formula[] = [
    {
      id: 'partner',
      title: 'Expert-comptable Business Partner',
      audience: 'Pour les dirigeants qui préparent un projet structurant',
      text: 'Un expert-comptable positionné comme partenaire de votre direction pour accompagner vos projets financiers structurants.',
      items: [
        'Plan de financement et prévisionnel',
        'Choix de la structure juridique et fiscale',
        'Pilotage budgétaire et tableaux de bord',
        'Appui lors d’une levée de fonds ou d’une acquisition',
      ],
    },
    {
      id: 'assistance',
      title: 'Assistance régulière',
      audience: 'Pour les entreprises qui tiennent leur comptabilité en interne',
      text: 'Une assistance régulière pour établir vos comptes annuels et vos déclarations fiscales, tout en gardant la main sur le quotidien.',
      items: [
        'Révision périodique de votre comptabilité',
        'Établissement du bilan et des états annexes',
        'Déclarations fiscales et sociales',
        'Réponses à vos questions comptables et fiscales',
      ],
    },
    {
      id: 'externalisation',
      title: 'Prise en charge de l’activité',
      audience: 'Pour ceux qui veulent déléguer totalement ou partiellement',
      text: 'Vous confiez la tenue totale ou partielle de votre comptabilité à une équipe KMAA dédiée et de proximité, comme si elle était chez vous.',
      items: [
        'Saisie et suivi de vos pièces comptables',
        'Rapprochements bancaires et suivi des tiers',
        'Paie et administration du personnel',
        'Reporting mensuel à votre direction',
      ],
    },
  ];

  readonly missions: Mission[] = [
    {
      id: 'tenue',
      title: 'Tenue comptable',
      summary: 'Un grand livre à jour, des écritures justifiées.',
      details: [
        'Enregistrement des opérations d’achat, de vente et de trésorerie',
        'Rapprochements bancaires et lettrage des comptes de tiers',
        'Suivi des immobilisations et des stocks',
      ],
    },
    {
      id: 'arretes',
      title: 'Révision et arrêtés des comptes',
      summary: 'Bilan, compte de résultat et annexes prêts à temps.',
      details: [
        'Travaux d’inventaire et écritures de régularisation',
        'Établissement des états financiers annuels',
        'Présentation des comptes à votre direction et à vos associés',
      ],
    },
    {
      id: 'declaratif',
      title: 'Obligations fiscales et sociales',
      summary: 'Vos déclarations déposées dans les délais.',
      details: [
        'Calcul et déclaration des taxes et impôts',
        'Déclarations sociales',
        'Suivi du calendrier des échéances',
      ],
    },
    {
      id: 'paie',
      title: 'Paie et gestion sociale',
      summary: 'Des bulletins fiables et des obligations sociales maîtrisées.',
      details: [
        'Établissement des bulletins de paie',
        'Déclarations et cotisations sociales',
        'Documents de fin de contrat et tenue du registre du personnel',
      ],
    },
    {
      id: 'consolidation',
      title: 'Consolidation et reporting',
      summary: 'Une vision unifiée de vos entités.',
      details: [
        'Consolidation des comptes de groupe',
        'Reporting mensuel et trimestriel',
        'Tableaux de bord pour les associés et les financeurs',
      ],
    },
    {
      id: 'conseil',
      title: 'Conseil à la création et au développement',
      summary: 'Les bonnes décisions dès le départ, puis à chaque étape.',
      details: [
        'Business plan, prévisionnel financier et plan de trésorerie',
        'Choix de la forme juridique et du régime fiscal',
        'Développement à l’international',
      ],
    },
    {
      id: 'referentiel',
      title: 'Passage au référentiel SYSCOHADA révisé',
      summary: 'Un changement de normes préparé et documenté.',
      details: [
        'Analyse d’écart entre vos pratiques et le référentiel',
        'Retraitement des comptes et bilan d’ouverture',
        'Formation de vos équipes comptables',
      ],
    },
  ];

  readonly levels: Level[] = [
    {
      title: 'Comptabilité transactionnelle',
      items: [
        'Comptes fournisseurs et paiement des factures',
        'Comptes clients et relances',
        'Gestion des notes de frais',
        'Rapprochements bancaires',
        'Enregistrement des opérations courantes',
      ],
    },
    {
      title: 'Fonction de contrôleur',
      items: [
        'Conciliations de comptes',
        'Gestion de la trésorerie',
        'Rapports financiers consolidés',
        'Préparation des états financiers',
        'Conception des procédures de contrôle',
      ],
    },
    {
      title: 'Direction financière externalisée',
      items: [
        'Préparation et suivi budgétaire',
        'Analyse des flux de trésorerie',
        'Prévisions financières et modélisation',
      ],
    },
  ];

  readonly steps: Step[] = [
    { title: 'Diagnostic', text: 'Nous analysons votre organisation, vos outils et vos obligations pour identifier les priorités.' },
    { title: 'Cadrage', text: 'Nous définissons ensemble le périmètre, les échéances et les interlocuteurs de chaque côté.' },
    { title: 'Mise en place', text: 'Reprise des historiques, paramétrage des outils et circuits de transmission des pièces.' },
    { title: 'Production', text: 'Tenue, révision et déclarations selon le calendrier convenu, avec un point d’étape régulier.' },
    { title: 'Restitution', text: 'Présentation des comptes, des indicateurs clés et des recommandations pour la période suivante.' },
  ];

  readonly rhythms: Rhythm[] = [
    {
      period: 'Chaque mois',
      items: ['Saisie et contrôle des pièces', 'Rapprochements bancaires', 'Déclarations périodiques', 'Tableau de bord de trésorerie'],
    },
    {
      period: 'Chaque trimestre',
      items: ['Situation intermédiaire', 'Revue des comptes de tiers', 'Point de gestion avec la direction'],
    },
    {
      period: 'Chaque année',
      items: ['Inventaire et écritures de régularisation', 'Établissement des états financiers', 'Déclarations annuelles', 'Présentation aux associés et aux financeurs'],
    },
    {
      period: 'En continu',
      items: ['Veille réglementaire et fiscale', 'Réponses à vos questions', 'Conseil sur vos décisions de gestion'],
    },
  ];

  readonly strengths: Strength[] = [
    { title: 'Espace client sécurisé', text: 'Déposez vos pièces et retrouvez vos documents où que vous soyez.' },
    { title: 'Tableaux de bord en ligne', text: 'Chiffre d’affaires, charges, trésorerie : vos indicateurs à jour.' },
    { title: 'Rappels d’échéances', text: 'Des alertes avant chaque date importante, pour ne rien oublier.' },
    { title: 'Équipe dédiée', text: 'Des interlocuteurs identifiés qui connaissent votre activité.' },
  ];

  readonly profiles: Profile[] = [
    { title: 'Très petites et petites entreprises', text: 'Une comptabilité claire et des obligations tenues, sans mobiliser votre temps.' },
    { title: 'Entreprises de taille intermédiaire', text: 'Une organisation comptable qui suit votre croissance et vos financements.' },
    { title: 'Grandes entreprises et groupes', text: 'Renfort d’équipes, consolidation et reporting pour vos instances.' },
    { title: 'Associations, ONG et coopératives', text: 'Des comptes présentables à vos bailleurs et à vos membres.' },
    { title: 'Entrepreneurs et jeunes entreprises', text: 'Structuration, prévisionnel et premiers choix juridiques et fiscaux.' },
    { title: 'Professions libérales', text: 'Une gestion simple de vos recettes, de vos charges et de votre fiscalité.' },
  ];

  readonly faqs: Faq[] = [
    {
      id: 'q1',
      question: 'Quelle est la différence entre un comptable et un expert-comptable ?',
      answer:
        'Le comptable tient et enregistre vos opérations. L’expert-comptable est un professionnel réglementé : il révise et présente vos comptes, engage sa responsabilité professionnelle et vous conseille sur vos décisions de gestion.',
    },
    {
      id: 'q2',
      question: 'Dois-je tout externaliser ?',
      answer:
        'Non. Vous choisissez le niveau d’intervention : un accompagnement de conseil, une assistance pour vos comptes annuels, ou la prise en charge totale ou partielle de votre comptabilité.',
    },
    {
      id: 'q3',
      question: 'Quels documents dois-je fournir ?',
      answer:
        'En général : factures d’achat et de vente, relevés bancaires, pièces de caisse, contrats, éléments de paie et tout document justifiant une opération. Nous vous remettons une liste adaptée à votre activité.',
    },
    {
      id: 'q4',
      question: 'Combien de temps faut-il pour démarrer ?',
      answer:
        'Le délai dépend de l’état de votre comptabilité et du périmètre choisi. Après le diagnostic, nous vous proposons un calendrier de mise en place précis.',
    },
    {
      id: 'q5',
      question: 'Mes données sont-elles protégées ?',
      answer:
        'Vos documents sont stockés dans un espace sécurisé à accès contrôlé, et nos équipes sont tenues au secret professionnel.',
    },
    {
      id: 'q6',
      question: 'Pouvez-vous m’aider à passer au référentiel SYSCOHADA révisé ?',
      answer:
        'Oui. Nous analysons l’écart avec vos pratiques actuelles, retraitons vos comptes, préparons le bilan d’ouverture et formons vos équipes.',
    },
  ];

  /** Titres et étiquettes d'exemple : à remplacer par de vraies publications. */
  readonly insights: Insight[] = [
    {
      title: 'Clôture annuelle : la liste de contrôle de l’expert-comptable',
      tags: ['Décryptages', 'Expertise comptable'],
      image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'L’intelligence artificielle et les métiers de la comptabilité',
      tags: ['Nos experts dans les médias', 'Expertise comptable'],
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Obligations déclaratives : les erreurs les plus fréquentes',
      tags: ['Décryptages', 'Fiscalité'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    },
  ];

  /** Noms fictifs : à remplacer par les vraies personnes. */
  readonly experts: Expert[] = [
    {
      name: 'Martial YAOGO',
      initials: 'MY',
      role: 'Expert comptable',
      bio: 'Accompagne dirigeants et entrepreneurs dans le pilotage de leur activité et la fiabilisation de leurs comptes.',
    },
    {
      name: 'Nacanabo DIALLO',
      initials: 'ND',
      role: 'Associé, expert comptable',
      bio: 'Coordonne les équipes dédiées et le passage aux nouveaux référentiels comptables.',
    },
    {
      name: 'BIRBA',
      initials: 'B',
      role: 'Expert compable, associé',
      bio: 'Coordonne les sorties sur terrain et les missions de fraudes.',
    },
  ];

  readonly relatedServices = [
    { title: 'Audit et Fraude', href: '#' },
    { title: 'Conseil aux organisations', href: '#' },
    { title: 'Conformité fiscale', href: '#' },
    { title: 'Gestion et administration du personnel', href: '#' },
  ];

  readonly activeSection = signal<string>('apercu');
  readonly openMission = signal<string | null>('tenue');
  readonly openFaq = signal<string | null>('q1');
  readonly linkCopied = signal<boolean>(false);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeSection.set(entry.target.id);
          }
        }
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    for (const link of this.navLinks) {
      const el = document.getElementById(link.id);
      if (el) {
        this.observer.observe(el);
      }
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  scrollTo(id: string, event: Event): void {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      this.activeSection.set(id);
    }
  }

  toggleMission(id: string): void {
    this.openMission.set(this.openMission() === id ? null : id);
  }

  toggleFaq(id: string): void {
    this.openFaq.set(this.openFaq() === id ? null : id);
  }

  print(): void {
    window.print();
  }

  async share(): Promise<void> {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2500);
    } catch {
      // Partage annulé ou non autorisé : rien à faire.
    }
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).classList.add('is-broken');
  }
}