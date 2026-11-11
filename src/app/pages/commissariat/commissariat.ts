import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

interface NavLink {
  id: string;
  label: string;
}

interface Pillar {
  id: string;
  label: string;
  title: string;
  text: string;
  points: string[];
  image: string;
  alt: string;
}

interface Card {
  title: string;
  text: string;
}

interface Step {
  title: string;
  text: string;
}

interface Opinion {
  label: string;
  title: string;
  text: string;
  meaning: string;
}

interface Benefit {
  icon: 'shield' | 'target' | 'chip';
  title: string;
  text: string;
}

interface Sector {
  id: string;
  label: string;
  title: string;
  text: string;
  points: string[];
}

interface Expert {
  name: string;
  initials: string;
  role: string;
  location: string;
  email: string;
}

interface Article {
  title: string;
  date: string;
  dateIso: string;
  image: string;
}

interface Resource {
  title: string;
  text: string;
  format: string;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-commissariat-aux-comptes',
  standalone: true,
  templateUrl: './commissariat.html',
  styleUrl: './commissariat.scss',
})
export class CommissariatAuxComptesComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Coordonnées de contact : à remplacer par les vraies. */
  readonly contactEmail = 'cac@kmaa.com';

  readonly navLinks: NavLink[] = [
    { id: 'apercu', label: 'Aperçu' },
    { id: 'mission', label: 'La mission' },
    { id: 'transparence', label: 'Transparence' },
    { id: 'deroule', label: 'Déroulé' },
    { id: 'rapport', label: 'Le rapport' },
    { id: 'secteurs', label: 'Secteurs' },
    { id: 'experts', label: 'Experts' },
    { id: 'perspectives', label: 'Perspectives' },
    { id: 'questions', label: 'Questions' },
  ];

  readonly themes: string[] = [
    'Audit légal',
    'Certification des comptes',
    'Contrôle interne',
    'Procédure d’alerte',
    'Audit digital',
  ];

  /** Images (Unsplash). En cas d'échec de chargement, le bloc garde un fond vert de la charte. */
  readonly pillars: Pillar[] = [
    {
      id: 'certifier',
      label: 'Certifier les comptes',
      title: 'Certifier la régularité, la sincérité et l’image fidèle des comptes',
      text:
        'Le commissaire aux comptes examine les états financiers de l’entreprise et exprime une opinion motivée, dans un rapport signé, sur lequel s’appuient associés, financeurs et partenaires.',
      points: [
        'Examen des états financiers annuels',
        'Appréciation des principes comptables et des estimations retenus',
        'Opinion formulée dans un rapport de certification',
      ],
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80',
      alt: 'Documents financiers et stylo sur un bureau',
    },
    {
      id: 'verifier',
      label: 'Vérifier la conformité',
      title: 'Procéder aux vérifications spécifiques prévues par la loi',
      text:
        'Au-delà des comptes, la mission légale couvre la sincérité des informations données aux associés, le respect des règles de fonctionnement des organes sociaux et les conventions réglementées.',
      points: [
        'Contrôle des informations communiquées aux associés',
        'Vérification des conventions entre la société et ses dirigeants',
        'Respect des obligations liées à la vie sociale de l’entreprise',
      ],
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
      alt: 'Équipe de travail réunie autour d’une table',
    },
    {
      id: 'alerter',
      label: 'Alerter et prévenir',
      title: 'Déclencher la procédure d’alerte lorsque c’est nécessaire',
      text:
        'Lorsqu’il relève des faits de nature à compromettre la continuité de l’exploitation, le commissaire aux comptes en informe les dirigeants puis, si besoin, les organes de la société, selon la procédure prévue par la loi.',
      points: [
        'Détection précoce des signaux de fragilité',
        'Échanges documentés avec la direction',
        'Information des organes de la société',
      ],
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80',
      alt: 'Réunion de travail entre un auditeur et des dirigeants',
    },
    {
      id: 'rendre-compte',
      label: 'Rendre compte',
      title: 'Rendre compte à la direction et à l’assemblée des associés',
      text:
        'Nos constats sont restitués tout au long de la mission, puis présentés dans des rapports clairs, destinés aux dirigeants comme à l’assemblée appelée à approuver les comptes.',
      points: [
        'Points d’étape réguliers avec la direction',
        'Rapport sur les comptes et rapports spéciaux',
        'Présence et réponses lors de l’assemblée',
      ],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
      alt: 'Tableau de bord présentant des indicateurs financiers',
    },
  ];

  readonly transparency: Card[] = [
    {
      title: 'Une approche fondée sur le risque',
      text: 'Des professionnels qui travaillent selon un modèle basé sur le risque, adapté à votre entreprise, à votre secteur et à votre contrôle interne.',
    },
    {
      title: 'Un service proactif et réactif',
      text: 'Une équipe collaborative qui réunit les expertises utiles, garantit la continuité de la mission et l’accès aux associés et aux managers.',
    },
    {
      title: 'Une communication active',
      text: 'Des résultats et des analyses partagés tout au long de la mission, pas seulement au moment de signer le rapport.',
    },
  ];

  readonly steps: Step[] = [
    {
      title: 'Acceptation de la mission et indépendance',
      text: 'Nous vérifions l’absence de conflit d’intérêts et le respect des règles d’indépendance avant d’accepter le mandat.',
    },
    {
      title: 'Connaissance de l’entreprise et évaluation des risques',
      text: 'Nous comprenons votre activité, votre organisation et votre contrôle interne pour identifier les zones de risque.',
    },
    {
      title: 'Plan de mission',
      text: 'Nous définissons les procédures, l’équipe et le calendrier en fonction des risques identifiés, et nous les partageons avec vous.',
    },
    {
      title: 'Contrôles intermédiaires',
      text: 'Tests du contrôle interne et revue des opérations en cours d’exercice, avec des constats remontés sans attendre la clôture.',
    },
    {
      title: 'Contrôles de clôture',
      text: 'Examen des comptes de l’exercice, des estimations et des événements postérieurs, puis revue finale par l’associé signataire.',
    },
    {
      title: 'Rapports et assemblée',
      text: 'Remise des rapports aux dirigeants, présentation à l’assemblée et recommandations pour l’exercice suivant.',
    },
  ];

  readonly opinions: Opinion[] = [
    {
      label: 'Opinion favorable',
      title: 'Certification sans réserve',
      text: 'Les comptes sont réguliers, sincères et donnent une image fidèle de la situation de l’entreprise.',
      meaning: 'Vos partenaires peuvent s’appuyer sur vos états financiers.',
    },
    {
      label: 'Opinion nuancée',
      title: 'Certification avec réserve',
      text: 'Un point précis appelle une réserve, sans remettre en cause l’ensemble des comptes.',
      meaning: 'Le rapport identifie le sujet et son incidence, pour que vous puissiez le corriger.',
    },
    {
      label: 'Opinion défavorable',
      title: 'Refus de certifier',
      text: 'Les anomalies relevées sont d’une importance telle que les comptes ne peuvent pas être certifiés.',
      meaning: 'La situation exige une réponse rapide de la direction et des organes de la société.',
    },
  ];

  readonly benefits: Benefit[] = [
    {
      icon: 'shield',
      title: 'Améliorer la qualité et la confiance',
      text: 'Les outils d’analyse de données ne remplacent pas le jugement du commissaire aux comptes : ils éclairent des données complexes pour des décisions mieux informées.',
    },
    {
      icon: 'target',
      title: 'Gagner en efficacité',
      text: 'Une approche fondée sur les données maintient un haut niveau de qualité tout en réduisant les sollicitations de vos équipes pendant la mission.',
    },
    {
      icon: 'chip',
      title: 'Concentrer l’effort là où il compte',
      text: 'Des tests sur l’ensemble des écritures et la détection d’anomalies font ressortir les opérations inhabituelles, pour des contrôles mieux ciblés.',
    },
  ];

  readonly sectors: Sector[] = [
    {
      id: 'finance',
      label: 'Établissements financiers',
      title: 'Une expérience reconnue du commissariat aux comptes dans le secteur financier',
      text:
        'En tant que commissaire aux comptes, nous sécurisons l’information financière de nos clients et apportons à l’écosystème financier (investisseurs, prêteurs, actionnaires, régulateurs, acteurs de la gouvernance) la confiance dont il a besoin.',
      points: [
        'Banques, établissements de microfinance et institutions assimilées',
        'Échanges réguliers avec les autorités de supervision, dont la BCEAO et la Commission bancaire de l’UMOA',
        'Présence lors des opérations de marché et des situations encadrées par la loi',
      ],
    },
    {
      id: 'assurance',
      label: 'Assurance',
      title: 'Le commissariat aux comptes au service des organismes d’assurance',
      text:
        'Provisions techniques, solvabilité, réassurance : nous adaptons notre approche de risque aux particularités comptables et réglementaires du secteur.',
      points: [
        'Examen des provisions et des engagements envers les assurés',
        'Prise en compte du cadre prudentiel applicable',
        'Dialogue avec la direction et les organes de contrôle',
      ],
    },
    {
      id: 'industrie',
      label: 'Industrie et mines',
      title: 'Le commissariat aux comptes pour les activités à forte intensité capitalistique',
      text:
        'Immobilisations, stocks, coûts de revient, engagements de remise en état : des postes sensibles que nous examinons avec une équipe habituée à ces environnements.',
      points: [
        'Contrôle des immobilisations et des stocks',
        'Examen des provisions et des engagements hors bilan',
        'Visites de sites et revue des procédures opérationnelles',
      ],
    },
    {
      id: 'associations',
      label: 'Associations et projets',
      title: 'Le commissariat aux comptes pour les associations, ONG et projets de développement',
      text:
        'Les bailleurs attendent des comptes certifiés et une traçabilité de l’emploi des fonds. Notre mission leur apporte cette garantie.',
      points: [
        'Certification des états financiers annuels',
        'Vérification de l’emploi des fonds reçus',
        'Rapports adaptés aux exigences des financeurs',
      ],
    },
    {
      id: 'public',
      label: 'Entreprises publiques',
      title: 'Le commissariat aux comptes pour les entreprises publiques et parapubliques',
      text:
        'Gouvernance, transparence et redevabilité : nous aidons les organes de ces entreprises à disposer d’une information financière fiable.',
      points: [
        'Rapports destinés aux organes de gouvernance',
        'Revue des conventions et des relations avec l’actionnaire public',
        'Recommandations sur le dispositif de contrôle interne',
      ],
    },
  ];

  /** Noms fictifs : à remplacer par les vraies personnes. */
  readonly experts: Expert[] = [
    {
      name: 'Moussa Sanou',
      initials: 'MS',
      role: 'Associé, commissaire aux comptes',
      location: 'Ouagadougou',
      email: 'moussa.sanou@kmaa.com',
    },
    {
      name: 'Awa Kinda',
      initials: 'AK',
      role: 'Directrice de mission, commissariat aux comptes',
      location: 'Ouagadougou',
      email: 'awa.kinda@kmaa.com',
    },
    {
      name: 'Ismaël Tapsoba',
      initials: 'IT',
      role: 'Directeur, secteur financier',
      location: 'Bobo-Dioulasso',
      email: 'ismael.tapsoba@kmaa.com',
    },
    {
      name: 'Estelle Yaméogo',
      initials: 'EY',
      role: 'Responsable audit digital',
      location: 'Ouagadougou',
      email: 'estelle.yameogo@kmaa.com',
    },
  ];

  /** Titres et dates d'exemple : à remplacer par de vraies publications. */
  readonly articles: Article[] = [
    {
      title: 'Comprendre le rapport du commissaire aux comptes : les trois opinions possibles',
      date: '22 oct. 2026',
      dateIso: '2026-10-22',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Procédure d’alerte : comment elle fonctionne et ce qu’elle protège',
      date: '08 oct. 2026',
      dateIso: '2026-10-08',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Indépendance du commissaire aux comptes : les règles à connaître',
      date: '24 sept. 2026',
      dateIso: '2026-09-24',
      image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Préparer la clôture : les documents attendus par le commissaire aux comptes',
      date: '10 sept. 2026',
      dateIso: '2026-09-10',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
    },
  ];

  readonly resources: Resource[] = [
    {
      title: 'Guide de la mission de commissariat aux comptes',
      text: 'Les étapes, les interlocuteurs et les livrables, du premier échange au rapport.',
      format: 'Guide',
    },
    {
      title: 'Liste de contrôle : préparer la visite du commissaire aux comptes',
      text: 'Les documents et les informations à réunir avant chaque intervention.',
      format: 'Liste de contrôle',
    },
    {
      title: 'Calendrier type d’une mission annuelle',
      text: 'Un repère pour planifier vos clôtures et vos échanges avec l’équipe d’audit.',
      format: 'Calendrier',
    },
  ];

  readonly faqs: Faq[] = [
    {
      id: 'q1',
      question: 'Qui doit désigner un commissaire aux comptes ?',
      answer:
        'La loi impose cette désignation à certaines sociétés, selon leur forme juridique et leur taille. Nous vous indiquons ce qui s’applique à votre situation.',
    },
    {
      id: 'q2',
      question: 'Le commissaire aux comptes peut-il aussi tenir ma comptabilité ?',
      answer:
        'Non. L’indépendance est la condition de la mission : le commissaire aux comptes ne peut pas contrôler des comptes qu’il a lui-même établis. La tenue de la comptabilité relève d’un autre professionnel.',
    },
    {
      id: 'q3',
      question: 'Quelle est la durée du mandat ?',
      answer:
        'La durée du mandat et ses conditions de renouvellement sont fixées par la loi. Nous vous précisons la règle qui s’applique à votre société lors de la désignation.',
    },
    {
      id: 'q4',
      question: 'Que se passe-t-il si le commissaire aux comptes relève une anomalie ?',
      answer:
        'Il en discute d’abord avec la direction. Selon la nature et la gravité du sujet, il peut formuler une réserve dans son rapport ou déclencher la procédure d’alerte prévue par la loi.',
    },
    {
      id: 'q5',
      question: 'Comment préparer au mieux la mission ?',
      answer:
        'Désignez un interlocuteur, tenez à jour vos pièces et votre comptabilité, et partagez-nous votre calendrier de clôture. Une liste de contrôle adaptée vous est remise au démarrage.',
    },
    {
      id: 'q6',
      question: 'Les informations que vous consultez restent-elles confidentielles ?',
      answer:
        'Oui. Le commissaire aux comptes et ses collaborateurs sont tenus au secret professionnel, dans les limites prévues par la loi.',
    },
  ];

  readonly activeSection = signal<string>('apercu');
  readonly readProgress = signal<number>(0);
  readonly timelineProgress = signal<number>(0);
  readonly activePillar = signal<string>('certifier');
  readonly paused = signal<boolean>(false);
  readonly activeSector = signal<string>('finance');
  readonly openFaq = signal<string | null>('q1');

  @ViewChild('timeline') private timeline?: ElementRef<HTMLElement>;
  @ViewChild('track') private track?: ElementRef<HTMLElement>;

  private navObserver?: IntersectionObserver;
  private revealObserver?: IntersectionObserver;
  private ticking = false;

  get currentPillar(): Pillar {
    return this.pillars.find((p) => p.id === this.activePillar()) ?? this.pillars[0];
  }

  get currentSector(): Sector {
    return this.sectors.find((s) => s.id === this.activeSector()) ?? this.sectors[0];
  }

  ngAfterViewInit(): void {
    this.updateScroll();

    if (typeof IntersectionObserver === 'undefined') {
      this.host.nativeElement.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    this.navObserver = new IntersectionObserver(
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
        this.navObserver.observe(el);
      }
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    this.host.nativeElement.querySelectorAll('.reveal').forEach((el) => this.revealObserver?.observe(el));
  }

  ngOnDestroy(): void {
    this.navObserver?.disconnect();
    this.revealObserver?.disconnect();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.ticking) {
      return;
    }
    this.ticking = true;
    requestAnimationFrame(() => {
      this.updateScroll();
      this.ticking = false;
    });
  }

  private updateScroll(): void {
    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    const rect = this.host.nativeElement.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    this.readProgress.set(total > 0 ? clamp(-rect.top / total) : 0);

    const tl = this.timeline?.nativeElement;
    if (tl) {
      const r = tl.getBoundingClientRect();
      this.timelineProgress.set(clamp((window.innerHeight * 0.6 - r.top) / r.height));
    }
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

  selectPillar(id: string): void {
    this.activePillar.set(id);
  }

  /** Appelé à la fin de la barre de progression : passe au pilier suivant. */
  nextPillar(): void {
    const index = this.pillars.findIndex((p) => p.id === this.activePillar());
    this.activePillar.set(this.pillars[(index + 1) % this.pillars.length].id);
  }

  onTabKey(event: KeyboardEvent, index: number): void {
    const last = this.pillars.length - 1;
    let next = index;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else return;
    event.preventDefault();
    this.activePillar.set(this.pillars[next].id);
    document.getElementById('pillar-tab-' + this.pillars[next].id)?.focus();
  }

  selectSector(id: string): void {
    this.activeSector.set(id);
  }

  toggleFaq(id: string): void {
    this.openFaq.set(this.openFaq() === id ? null : id);
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