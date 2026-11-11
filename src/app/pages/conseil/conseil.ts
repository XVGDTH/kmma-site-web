import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';

interface NavLink {
  id: string;
  label: string;
}

interface Offer {
  title: string;
  text: string;
  href: string;
}

interface Reason {
  id: string;
  icon: 'team' | 'document' | 'tech' | 'shield';
  label: string;
  title: string;
  text: string;
  points: string[];
}

interface Expertise {
  title: string;
  text: string;
  link: string;
}

interface Mission {
  title: string;
  text: string;
}

interface OutsourcingGroup {
  title: string;
  items: string[];
}

interface Benefit {
  title: string;
  text: string;
}

interface Domain {
  id: string;
  label: string;
  intro: string;
  items: Mission[];
}

interface Sector {
  name: string;
  text: string;
  image: string;
}

interface CaseStudy {
  sector: string;
  title: string;
  text: string;
}

interface Insight {
  type: string;
  title: string;
  text: string;
  date: string;
  dateIso: string;
  author: string;
  image: string;
}

interface Expert {
  name: string;
  initials: string;
  role: string;
  bio: string;
}

@Component({
  selector: 'app-conseil',
  standalone: true,
  templateUrl: './conseil.html',
  styleUrl: './conseil.scss',
})
export class ConseilComponent implements AfterViewInit, OnDestroy {
  /** Coordonnées de contact : à remplacer par les vraies. */
  readonly contactEmail = 'conseil@kmaa.com';

  /** Images (Unsplash). En cas d'échec de chargement, le bloc garde un fond vert de la charte. */
  readonly images = {
    hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80',
    vision: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80',
    strategy: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80',
    finance: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
  };

  readonly navLinks: NavLink[] = [
    { id: 'apercu', label: 'Aperçu' },
    { id: 'offres', label: 'Offres' },
    { id: 'expertises', label: 'Expertises' },
    { id: 'finance', label: 'Finance et comptabilité' },
    { id: 'accompagnement', label: 'Accompagnement' },
    { id: 'secteurs', label: 'Secteurs' },
    { id: 'perspectives', label: 'Perspectives' },
    { id: 'equipe', label: 'Équipe' },
  ];

  readonly offers: Offer[] = [
    {
      title: 'Gouvernance, risques et contrôle interne',
      text: 'Cartographie des risques, dispositifs de contrôle et pilotage par les instances de gouvernance.',
      href: '#',
    },
    {
      title: 'Audit interne',
      text: 'Plans d’audit fondés sur le risque, missions externalisées ou co-sourcées, suivi des recommandations.',
      href: '#',
    },
    {
      title: 'Éthique et conformité',
      text: 'Programmes de conformité, lutte contre la fraude, dispositifs d’alerte et culture de l’intégrité.',
      href: '#',
    },
    {
      title: 'Cybersécurité',
      text: 'Évaluation de la maturité, protection des données financières et préparation à la gestion de crise.',
      href: '#',
    },
  ];

  readonly reasons: Reason[] = [
    {
      id: 'integree',
      icon: 'team',
      label: 'Approche intégrée',
      title: 'Une approche intégrée, de bout en bout',
      text:
        'Nous intervenons tout au long de vos projets de mise en conformité et de gestion des risques, avec les mêmes équipes du premier diagnostic jusqu’au suivi des résultats.',
      points: [
        'Veille et stratégie d’anticipation',
        'Analyse d’écart et analyse d’impacts',
        'Feuille de route et déploiement',
        'Contrôle, optimisation et remédiation',
      ],
    },
    {
      id: 'expertise',
      icon: 'document',
      label: 'Expertise et benchmark',
      title: 'Une expertise appuyée sur des références',
      text:
        'Nos consultants s’appuient sur des pratiques éprouvées et des comparaisons sectorielles pour situer votre organisation et fixer des objectifs réalistes.',
      points: [
        'Référentiels et normes internationales',
        'Comparaison avec des organisations similaires',
        'Recommandations hiérarchisées et chiffrées',
      ],
    },
    {
      id: 'technologie',
      icon: 'tech',
      label: 'Technologie',
      title: 'La technologie au service de la décision',
      text:
        'Données, automatisation et tableaux de bord rendent vos risques visibles en continu, et pas seulement à la clôture.',
      points: [
        'Tableaux de bord de risques en temps réel',
        'Automatisation des contrôles récurrents',
        'Analyse de données et détection d’anomalies',
      ],
    },
    {
      id: 'reassurance',
      icon: 'shield',
      label: 'Réassurance',
      title: 'Une réassurance pour vos parties prenantes',
      text:
        'Des dispositifs documentés, traçables et vérifiés pour rassurer votre direction, vos financeurs et vos régulateurs.',
      points: [
        'Documentation prête pour les contrôles externes',
        'Preuves de conformité centralisées',
        'Restitutions claires aux instances dirigeantes',
      ],
    },
  ];

  readonly expertises: Expertise[] = [
    {
      title: 'Conseil en fusions et acquisitions',
      text: 'De la stratégie de transaction à l’intégration, en passant par la diligence raisonnable et l’exécution de la clôture.',
      link: 'Découvrir le conseil en transactions',
    },
    {
      title: 'Amélioration des performances',
      text: 'Croissance, redressement ou efficacité opérationnelle : planification de la demande, productivité et optimisation du fonds de roulement.',
      link: 'Découvrir l’amélioration des performances',
    },
    {
      title: 'Conseil technologique',
      text: 'Stratégie et feuille de route, sélection des systèmes et des fournisseurs, pilotage des projets et des programmes.',
      link: 'Découvrir le conseil technologique',
    },
    {
      title: 'Conseil économique',
      text: 'Prévisions de ventes, planification stratégique et budgétaire, analyses de marché et d’investissements.',
      link: 'Découvrir le conseil économique',
    },
    {
      title: 'Chaîne d’approvisionnement et logistique',
      text: 'Analyse des dépenses d’achats, stratégies par catégorie, développement des fournisseurs et transformation des équipes.',
      link: 'Explorer les services d’approvisionnement',
    },
    {
      title: 'Comptabilité et reporting financier',
      text: 'Application des normes, amélioration des rapports, optimisation de la clôture et feuille de route pour les directions financières.',
      link: 'Découvrir le conseil comptable',
    },
    {
      title: 'Services d’évaluation',
      text: 'Évaluation d’actifs, tests de dépréciation, restructurations, cessions et analyses complexes.',
      link: 'Découvrir l’évaluation',
    },
    {
      title: 'Services externalisés',
      text: 'Comptabilité externalisée, conseil en capital humain et support à l’intégration, à mesure que votre entreprise grandit.',
      link: 'Découvrir l’externalisation',
    },
  ];

  readonly missions: Mission[] = [
    { title: 'Tenue comptable', text: 'Enregistrement, rapprochements et suivi courant de vos écritures.' },
    { title: 'Arrêtés comptables', text: 'Bilan, compte de résultat et annexes, prêts à temps pour vos échéances.' },
    { title: 'Obligations déclaratives', text: 'Déclarations fiscales et sociales dans le respect des délais.' },
    { title: 'Consolidation des comptes et reporting', text: 'Une vision unifiée de vos entités, pour vos associés et vos financeurs.' },
    { title: 'Développement à l’international', text: 'Structuration comptable et conformité lors de vos implantations hors du pays.' },
  ];

  readonly outsourcing: OutsourcingGroup[] = [
    {
      title: 'Comptabilité transactionnelle',
      items: [
        'Comptes fournisseurs et paiement des factures',
        'Comptes clients',
        'Gestion des dépenses',
        'Rapprochements bancaires',
        'Enregistrement des transactions',
      ],
    },
    {
      title: 'Services de contrôleur',
      items: [
        'Conciliations de comptes',
        'Gestion de trésorerie',
        'Rapports financiers consolidés',
        'Préparation des états financiers',
        'Conception des procédures de contrôle',
      ],
    },
    {
      title: 'Services de directeur financier externalisé',
      items: [
        'Préparation et suivi budgétaire',
        'Analyse des flux de trésorerie',
        'Prévisions financières et modélisation',
      ],
    },
  ];

  readonly benefits: Benefit[] = [
    {
      title: 'Processus automatisés et rationalisés',
      text: 'Renforcez vos contrôles internes et réduisez les risques, tout en gardant la souplesse nécessaire à l’évolution de votre activité.',
    },
    {
      title: 'Accès aux données en temps réel',
      text: 'Consultez les informations dont vous avez besoin, quand et où vous en avez besoin, pour décider plus vite.',
    },
    {
      title: 'Spécialistes de votre secteur',
      text: 'Des conseillers expérimentés qui connaissent vos objectifs et repèrent les tendances pour vous aider à planifier.',
    },
    {
      title: 'Analyses exploitables',
      text: 'Une vision à 360 degrés de votre entreprise pour prendre des décisions financières et opérationnelles proactives.',
    },
  ];

  readonly domains: Domain[] = [
    {
      id: 'finance',
      label: 'Direction financière',
      intro: 'Nous renforçons la fonction finance pour qu’elle devienne un partenaire de la stratégie.',
      items: [
        { title: 'Assistance opérationnelle', text: 'Des renforts qualifiés pour absorber les pics d’activité et sécuriser vos clôtures.' },
        { title: 'Transformation de la fonction finance', text: 'Organisation, processus et outils repensés pour gagner en rapidité et en fiabilité.' },
        { title: 'Gestion de projet', text: 'Pilotage rigoureux de vos chantiers financiers, du cadrage à la mise en production.' },
        { title: 'Pilotage de la performance', text: 'Indicateurs, budgets et tableaux de bord au service des décisions de la direction.' },
        { title: 'Conformité comptable, réglementaire et normative', text: 'Mise en conformité avec les référentiels comptables et les exigences des régulateurs.' },
      ],
    },
    {
      id: 'rh',
      label: 'Ressources humaines',
      intro: 'Nous accompagnons vos équipes et vos organisations à chaque étape de leur évolution.',
      items: [
        { title: 'Conseil et implémentation de solutions SIRH', text: 'Choix, paramétrage et déploiement de votre système d’information RH.' },
        { title: 'Transformation des hommes et des organisations', text: 'Conduite du changement, accompagnement des managers et évolution des métiers.' },
        { title: 'Management de transition, direction à temps partagé, recrutement', text: 'Des profils expérimentés, en mission ou en renfort, pour les moments décisifs.' },
        { title: 'Paie et administration du personnel', text: 'Gestion fiable et conforme de la paie et des obligations sociales.' },
      ],
    },
  ];

  readonly sectors: Sector[] = [
    {
      name: 'Microfinance et banque',
      text: 'Gestion des risques de crédit, conformité réglementaire et pilotage des portefeuilles.',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1000&q=80',
    },
    {
      name: 'Agro-industrie',
      text: 'Chaînes de valeur, coûts de revient et financement de la campagne agricole.',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
    },
    {
      name: 'Énergie et mines',
      text: 'Projets à forte intensité capitalistique, conformité et maîtrise des risques opérationnels.',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=80',
    },
    {
      name: 'Immobilier et BTP',
      text: 'Suivi des programmes, trésorerie de chantier et reporting aux investisseurs.',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    },
    {
      name: 'Commerce et distribution',
      text: 'Stocks, achats et pilotage de la marge pour des réseaux en croissance.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80',
    },
  ];

  /** Textes d'exemple : à remplacer par de vraies références clients. */
  readonly cases: CaseStudy[] = [
    {
      sector: 'Microfinance',
      title: 'Cartographie des risques et dispositif de contrôle interne',
      text: 'Mise en place d’un cadre de gestion des risques adapté à une institution de taille moyenne, avec suivi trimestriel en comité.',
    },
    {
      sector: 'Agro-industrie',
      title: 'Transformation de la fonction finance',
      text: 'Refonte du processus de clôture mensuelle et déploiement d’un tableau de bord de trésorerie pour la direction.',
    },
    {
      sector: 'Immobilier',
      title: 'Externalisation de la comptabilité et du reporting',
      text: 'Reprise de la comptabilité de plusieurs sociétés de programme et consolidation du reporting aux associés.',
    },
  ];

  /** Textes d'exemple : à remplacer par de vraies publications. */
  readonly insights: Insight[] = [
    {
      type: 'Étude',
      title: 'Faire de la gestion des risques un levier de performance',
      text: 'Comment les directions des risques peuvent influencer la stratégie plutôt que subir la conformité.',
      date: '30 sept. 2026',
      dateIso: '2026-09-30',
      author: 'Issa Traoré',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    },
    {
      type: 'Guide',
      title: 'Externaliser sa comptabilité : les bonnes questions à se poser',
      text: 'Périmètre, gouvernance, indicateurs : une grille pour choisir le bon modèle d’externalisation.',
      date: '07 sept. 2026',
      dateIso: '2026-09-07',
      author: 'Fatimata Zongo',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1000&q=80',
    },
    {
      type: 'Analyse',
      title: 'Piloter sa trésorerie dans un contexte d’incertitude',
      text: 'Quatre leviers pour sécuriser le fonds de roulement sans freiner l’investissement.',
      date: '16 juil. 2026',
      dateIso: '2026-07-16',
      author: 'Daouda Kaboré',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
    },
  ];

  /** Noms fictifs : à remplacer par les vraies personnes. */
  readonly experts: Expert[] = [
    {
      name: 'Issa Traoré',
      initials: 'IT',
      role: 'Associé, responsable du Conseil',
      bio: 'Accompagne depuis plus de vingt ans des dirigeants sur la gestion des risques et la transformation de leur organisation.',
    },
    {
      name: 'Fatimata Zongo',
      initials: 'FZ',
      role: 'Directrice, Finance et comptabilité',
      bio: 'Conseille les directions financières sur la clôture, le reporting et l’externalisation de la comptabilité.',
    },
    {
      name: 'Daouda Kaboré',
      initials: 'DK',
      role: 'Directeur, Stratégie et performance',
      bio: 'Aide les entreprises à définir une stratégie transformante et à en piloter l’exécution.',
    },
  ];

  readonly relatedServices: Offer[] = [
    { title: 'Audit et assurance', text: '', href: '#' },
    { title: 'Conformité fiscale', text: '', href: '#' },
    { title: 'Services d’évaluation', text: '', href: '#' },
    { title: 'Comptabilité externalisée', text: '', href: '#' },
  ];

  readonly activeSection = signal<string>('apercu');
  readonly activeReason = signal<string>('integree');
  readonly activeDomain = signal<string>('finance');

  @ViewChild('track') private track?: ElementRef<HTMLElement>;

  private observer?: IntersectionObserver;

  get currentReason(): Reason {
    return this.reasons.find((r) => r.id === this.activeReason()) ?? this.reasons[0];
  }

  get currentDomain(): Domain {
    return this.domains.find((d) => d.id === this.activeDomain()) ?? this.domains[0];
  }

  /** Repères calculés à partir du contenu de la page : aucune donnée inventée. */
  get stats(): { value: number; label: string }[] {
    return [
      { value: this.offers.length, label: 'offres de gestion des risques' },
      { value: this.expertises.length, label: 'domaines d’expertise' },
      { value: this.sectors.length, label: 'secteurs accompagnés' },
    ];
  }

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

  selectReason(id: string): void {
    this.activeReason.set(id);
  }

  selectDomain(id: string): void {
    this.activeDomain.set(id);
  }

  onTabKey(event: KeyboardEvent, index: number): void {
    const last = this.reasons.length - 1;
    let next = index;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else return;
    event.preventDefault();
    this.activeReason.set(this.reasons[next].id);
    document.getElementById('reason-tab-' + this.reasons[next].id)?.focus();
  }

  slide(direction: 1 | -1): void {
    const el = this.track?.nativeElement;
    if (!el) {
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).classList.add('is-broken');
  }
}