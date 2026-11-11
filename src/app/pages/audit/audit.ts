import { AfterViewInit, Component, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavLink {
  id: string;
  label: string;
}

interface Pillar {
  id: string;
  title: string;
  lead: string;
  points: string[];
}

interface Trait {
  title: string;
  text: string;
}

interface Service {
  id: string;
  title: string;
  summary: string;
  details: string[];
}

interface NewsItem {
  type: string;
  title: string;
  text: string;
  date: string;
  dateIso: string;
}

interface Expert {
  name: string;
  initials: string;
  role: string;
  bio: string;
  location: string;
}

interface RelatedService {
  label: string;
  href: string;
}

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class AuditComponent implements AfterViewInit, OnDestroy {
  /** Coordonnées de contact : à remplacer par les vraies. */
  readonly contactEmail = 'admin@convergesas.com';

  /** Images (Unsplash). Si une URL ne répond pas, le bloc garde un fond vert de la charte. */
  readonly images = {
    hero: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
    overview: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
    method: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80',
    stakes: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80',
    band: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80',
  };

  readonly navLinks: NavLink[] = [
    { id: 'apercu', label: 'Aperçu' },
    { id: 'approche', label: 'Approche' },
    { id: 'methode', label: 'Méthode' },
    { id: 'enjeux', label: 'Vos enjeux' },
    { id: 'services', label: 'Services' },
    { id: 'actualites', label: 'Actualités' },
    { id: 'equipe', label: 'Équipe' },
  ];

  readonly values: string[] = ['Intégrité', 'Objectivité', 'Indépendance'];

  readonly pillars: Pillar[] = [
    {
      id: 'moderne',
      title: 'Une approche modernisée',
      lead:
        "Notre mission repose sur une méthodologie d'audit claire, dont l'évaluation des risques est le fil conducteur. Chaque travail est dimensionné selon ce qui compte vraiment pour vos parties prenantes.",
      points: [
        'Cartographie des risques dès la phase préparatoire',
        'Plan de mission adapté à votre structure et à votre secteur',
        'Conclusions documentées, traçables et compréhensibles',
      ],
    },
    {
      id: 'processus',
      title: 'Des processus optimisés',
      lead:
        "L'intégration de nos équipes et leur spécialisation sectorielle rendent chaque audit plus fluide, plus rapide et plus proche des enjeux de votre activité.",
      points: [
        'Interlocuteurs identifiés et disponibles tout au long de la mission',
        'Échanges d’informations centralisés et sécurisés',
        'Calendrier partagé et points d’étape réguliers',
      ],
    },
    {
      id: 'plateforme',
      title: 'Une plateforme augmentée par l’IA',
      lead:
        "L'intelligence artificielle ne remplace pas le jugement professionnel : elle le renforce. Les tâches répétitives sont automatisées pour libérer du temps d'analyse, d'esprit critique et de dialogue avec vous.",
      points: [
        'Détection d’anomalies sur l’ensemble des écritures',
        'Tableaux de bord de suivi en temps réel',
        'Espace unifié entre KMAA et ses clients',
      ],
    },
  ];

  readonly traits: Trait[] = [
    {
      title: 'Spécialisation sectorielle',
      text: 'Nos auditeurs sont alignés par secteur pour apporter une connaissance plus fine de votre environnement, sans courbe d’apprentissage à votre charge.',
    },
    {
      title: 'Technologie d’audit',
      text: 'Nous adoptons des outils avancés et transformons en continu l’expérience d’audit, avec un flux de travail efficace et des informations intégrées.',
    },
    {
      title: 'Analyse de données',
      text: 'L’analyse et la visualisation des données permettent un audit plus large et plus profond que l’échantillonnage traditionnel.',
    },
    {
      title: 'Les bonnes personnes',
      text: 'Nous mobilisons le bon spécialiste pour la bonne situation, avec des équipes qui collaborent sans friction d’un bureau à l’autre.',
    },
    {
      title: 'Approche fondée sur le risque',
      text: 'Nous concentrons nos efforts sur les zones de votre activité qui présentent le plus de risques et d’importance, pour ne rien laisser passer d’essentiel.',
    },
    {
      title: 'Communication fiable',
      text: 'Vous avez un accès régulier aux spécialistes affectés à votre mission, ainsi qu’à des associés habilités à décider sur le terrain.',
    },
    {
      title: 'Services de haute qualité',
      text: 'Un cadre de contrôle qualité rigoureux garantit que votre organisation reçoit des informations objectives et crédibles.',
    },
  ];

  readonly stakes: string[] = [
    'Votre structuration et votre implantation géographique',
    'Vos défis stratégiques à court, moyen et long termes',
    'Les spécificités liées à votre secteur d’activité',
  ];

  readonly ambitions: string[] = [
    'Des services d’audit de haute qualité, conformes aux normes internationales',
    'Une mobilisation possible de nos équipes localement et à l’international',
    'Des outils innovants, inspirés des dernières avancées de l’IA, pour anticiper les risques',
    'Des procédures actualisées grâce à une veille réglementaire partagée avec nos clients',
  ];

  readonly services: Service[] = [
    {
      id: 'cac',
      title: 'Commissariat aux comptes',
      summary: 'Audit légal et rapports prévus par la réglementation.',
      details: [
        'Certification des comptes annuels et consolidés',
        'Rapports spéciaux et procédures légales',
        'Méthodologie cohérente, combinant approches traditionnelles et innovantes',
      ],
    },
    {
      id: 'contractuel',
      title: 'Audit contractuel',
      summary: 'Des missions à la demande, calibrées sur votre besoin.',
      details: [
        'Audit d’états financiers volontaire',
        'Revue limitée et procédures convenues',
        'Due diligence et acquisitions',
      ],
    },
    {
      id: 'techno',
      title: 'Audit et nouvelles technologies',
      summary: 'Des données exploitées de bout en bout, pas seulement échantillonnées.',
      details: [
        'Analyse de données sur la totalité des flux',
        'Audit des systèmes d’information et des contrôles automatisés',
        'Tableaux de bord de risque partagés avec votre direction',
      ],
    },
    {
      id: 'normes',
      title: 'Normes ISA et SYSCOHADA',
      summary: 'Des réponses claires sur l’interprétation et l’application des référentiels.',
      details: [
        'Aide à l’application des normes comptables',
        'Préparation de la clôture annuelle',
        'Passage d’un référentiel à un autre',
      ],
    },
  ];

  readonly news: NewsItem[] = [
    {
      type: 'Webcast',
      title: 'Clôture annuelle 2026 : points d’attention pour tous les secteurs',
      text: 'Nouveautés comptables, principaux enjeux de la clôture et décryptage des points sensibles.',
      date: '26 nov. 2026',
      dateIso: '2026-11-26',
    },
    {
      type: 'Atelier',
      title: 'Reporting de durabilité : ce qui change pour les exercices à venir',
      text: 'Un temps d’échange pour prendre du recul sur l’actualité réglementaire et préparer vos équipes.',
      date: '10 déc. 2026',
      dateIso: '2026-12-10',
    },
    {
      type: 'Publication',
      title: 'Audit assisté par IA : bonnes pratiques et limites',
      text: 'Comment automatiser les travaux préparatoires sans jamais déléguer le jugement professionnel.',
      date: '14 janv. 2027',
      dateIso: '2027-01-14',
    },
  ];

  /** Noms fictifs : à remplacer par les vraies personnes. */
  readonly experts: Expert[] = [
    {
      name: 'Bintou OUEDRAOGO',
      initials: 'BO',
      role: 'Fraude et audit interne',
      bio: 'Accompagne des groupes et des PME en audit et fraude.',
      location: 'Ouagadougou, Burkina Faso',
    },
    {
    name: 'Abiezer OUEDRAOGO',
      initials: 'AO',
      role: 'Fraude et audit interne',
      bio: 'Pilote les missions d’audit',
      location: 'Ouagadougou, Burkina Faso',
    },
    {
      name: 'Axelle OUEDRAOGO',
      initials: 'AO',
      role: 'Fraude et audit interne',
      bio: 'Conseille les directions financières sur l’application des référentiels.',
      location: 'Ouagadougou, Burkina Faso',
    },
  ];

  readonly relatedServices: RelatedService[] = [
    { label: 'Conseil comptable', href: '#' },
    { label: 'Conformité fiscale', href: '#' },
    { label: 'Services d’évaluation', href: '#' },
    { label: 'Optimisation de portefeuille', href: '#' },
    { label: 'Services d’assurance', href: '#' },
    { label: 'Bureau national', href: '#' },
  ];

  readonly activeSection = signal<string>('apercu');
  readonly activePillar = signal<string>('moderne');
  readonly openService = signal<string | null>('cac');

  private observer?: IntersectionObserver;

  get currentPillar(): Pillar {
    return this.pillars.find((p) => p.id === this.activePillar()) ?? this.pillars[0];
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

  selectPillar(id: string): void {
    this.activePillar.set(id);
  }

  onTabKey(event: KeyboardEvent, index: number): void {
    const last = this.pillars.length - 1;
    let next = index;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else return;
    event.preventDefault();
    this.activePillar.set(this.pillars[next].id);
    document.getElementById('tab-' + this.pillars[next].id)?.focus();
  }

  toggleService(id: string): void {
    this.openService.set(this.openService() === id ? null : id);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).classList.add('is-broken');
  }
}