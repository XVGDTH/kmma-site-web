import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavLink {
  label: string;
  fragment?: string;
  route?: string;
}

export interface NavDropdown {
  label: string;
  items: { label: string; description: string; route?: string; fragment?: string }[];
}

export interface ExpertisePanelLink {
  label: string;
  route: string;
}

export interface ExpertisePanelAction {
  label: string;
  route: string;
  style: 'primary' | 'secondary';
}

export interface ExpertiseItem {
  label: string;
  route: string;
  icon: 'formations' | 'accompagnement' | 'gestion' | 'audit';
  panel: {
    title: string;
    ctaLabel: string;
    ctaRoute: string;
    links: ExpertisePanelLink[];
    resources: ExpertisePanelLink[];
    image: string;
    imageAlt: string;
    bannerQuestion: string;
    bannerActions: ExpertisePanelAction[];
  };
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly scrolled = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly openDropdown = signal<string | null>(null);
  readonly openMobileAccordion = signal<string | null>(null);

  /** Item survolé/actif dans le méga-menu "Expertises" */
  readonly activeExpertise = signal<string | null>(null);

  readonly simpleLinks: NavLink[] = [
    { label: 'Accueil', route: '/' },
  ];

  readonly dropdowns: NavDropdown[] = [
    {
      label: 'Nos Services',
      items: [
        { label: 'Accompagnement pédagogique', description: 'Un suivi personnalisé de bout en bout', route: '/services/accompagnement' },
        { label: 'Coaching & mentorat', description: 'Des experts à vos côtés', route: '/services/coaching' },
        { label: 'Formations en entreprise', description: 'Solutions dédiées aux organisations', route: '/services/entreprise' },
        { label: 'Certification & évaluation', description: 'Validez vos acquis officiellement', route: '/services/certification' },
      ],
    },
    {
      label: 'Compte',
      items: [
        { label: 'Connexion', description: 'Accédez à votre espace apprenant', route: '/compte/connexion' },
        { label: 'Créer un compte', description: 'Rejoignez la communauté Kmma', route: '/compte/inscription' },
        { label: 'Mon espace', description: 'Suivez votre progression', route: '/compte/espace' },
      ],
    },
  ];

  /** Icônes (path SVG) référencées par item.icon dans le template */
  readonly expertiseIcons: Record<ExpertiseItem['icon'], string> = {
    formations: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z',
    accompagnement: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    gestion: 'M9 11H3v11h6V11Z M15 4H9v18h6V4Z M21 15h-6v7h6v-7Z',
    audit: 'M9 12l2 2 4-4 M12 3l8 4v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4Z',
  };

  readonly expertises: ExpertiseItem[] = [
    {
      label: 'Formations',
      route: '/formations',
      icon: 'formations',
      panel: {
        title: 'FORMATIONS',
        ctaLabel: 'Découvrir nos formations',
        ctaRoute: '/formations',
        links: [
          { label: 'Toutes nos sessions en cours', route: '/formations' },
          { label: 'Formations certifiantes', route: '/formations/certifiantes' },
          { label: 'Formations à distance', route: '/formations/distance' },
          { label: 'Calendrier des sessions', route: '/formations/calendrier' },
          { label: 'Une autre formation ?', route: '/formations/contact' },
        ],
        resources: [
          { label: 'Guide pour choisir sa formation', route: '/ressources/guide-formation' },
          { label: 'Nos outils pédagogiques', route: '/ressources/outils' },
        ],
        image: 'formations.jpg',
        imageAlt: 'Formation KMAA',
        bannerQuestion: 'Besoin d\'aide pour choisir votre formation ?',
        bannerActions: [
          { label: 'Prendre RDV', route: '/contact', style: 'primary' },
          { label: 'Nous appeler', route: '/contact#telephone', style: 'secondary' },
        ],
      },
    },
    {
      label: 'Accompagnement pédagogique',
      route: '/services/accompagnement',
      icon: 'accompagnement',
      panel: {
        title: 'ACCOMPAGNEMENT PÉDAGOGIQUE',
        ctaLabel: 'Découvrir notre accompagnement',
        ctaRoute: '/services/accompagnement',
        links: [
          { label: 'Suivi personnalisé', route: '/services/accompagnement/suivi' },
          { label: 'Coaching & mentorat', route: '/services/coaching' },
          { label: 'Préparation aux examens', route: '/services/accompagnement/examens' },
          { label: 'Une autre demande ?', route: '/services/accompagnement/contact' },
        ],
        resources: [
          { label: 'Notre blog', route: '/blog' },
          { label: 'Guide de l\'apprenant', route: '/ressources/guide-apprenant' },
        ],
        image: 'accompagnement.jpg',
        imageAlt: 'Accompagnement pédagogique KMAA',
        bannerQuestion: 'Besoin d\'un accompagnement sur mesure ?',
        bannerActions: [
          { label: 'Prendre RDV', route: '/contact', style: 'primary' },
          { label: 'Nous appeler', route: '/contact#telephone', style: 'secondary' },
        ],
      },
    },
    {
      label: 'Gestion administrative',
      route: '/gestion-administrative',
      icon: 'gestion',
      panel: {
        title: 'GESTION ADMINISTRATIVE',
        ctaLabel: 'Découvrir notre expertise',
        ctaRoute: '/gestion-administrative',
        links: [
          { label: 'Gestion administrative', route: '/gestion-administrative/generale' },
          { label: 'Gestion commerciale', route: '/gestion-administrative/commerciale' },
          { label: 'Gestion fiscale', route: '/gestion-administrative/fiscale' },
          { label: 'Gestion comptable', route: '/gestion-administrative/comptable' },
          { label: 'Un autre besoin ?', route: '/gestion-administrative/contact' },
        ],
        resources: [
          { label: 'Guide de gestion administrative', route: '/ressources/guide-gestion' },
        ],
        image: 'gestion.jpg',
        imageAlt: 'Gestion administrative KMAA',
        bannerQuestion: 'Besoin d\'aide en gestion administrative ?',
        bannerActions: [
          { label: 'Prendre RDV', route: '/contact', style: 'primary' },
          { label: 'Nous appeler', route: '/contact#telephone', style: 'secondary' },
        ],
      },
    },
    {
      label: 'Systèmes de contrôle & audit',
      route: '/audit',
      icon: 'audit',
      panel: {
        title: 'SYSTÈMES DE CONTRÔLE & AUDIT',
        ctaLabel: 'Découvrir notre expertise en audit',
        ctaRoute: '/audit',
        links: [
          { label: 'Audit interne', route: '/audit/interne' },
          { label: 'Contrôle de gestion', route: '/audit/controle-gestion' },
          { label: 'Reddition des comptes', route: '/audit/reddition' },
          { label: 'Une autre demande ?', route: '/audit/contact' },
        ],
        resources: [
          { label: 'Nos articles sur l\'audit', route: '/blog/audit' },
        ],
        image: 'audit.jpg',
        imageAlt: 'Audit et contrôle KMAA',
        bannerQuestion: 'Besoin d\'un accompagnement en audit ?',
        bannerActions: [
          { label: 'Prendre RDV', route: '/contact', style: 'primary' },
          { label: 'Nous appeler', route: '/contact#telephone', style: 'secondary' },
        ],
      },
    },
  ];

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }

  toggleDropdown(label: string): void {
    this.openDropdown.set(this.openDropdown() === label ? null : label);
  }

  closeDropdowns(): void {
    this.openDropdown.set(null);
  }

  openExpertisesMenu(): void {
    this.openDropdown.set('Expertises');
    if (!this.activeExpertise()) {
      this.activeExpertise.set(this.expertises[0]?.label ?? null);
    }
  }

  toggleExpertisesMenu(): void {
    if (this.openDropdown() === 'Expertises') {
      this.closeDropdowns();
    } else {
      this.openExpertisesMenu();
    }
  }

  setActiveExpertise(label: string): void {
    this.activeExpertise.set(label);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
    if (!this.mobileMenuOpen()) {
      this.openMobileAccordion.set(null);
    }
  }

  toggleMobileAccordion(label: string): void {
    this.openMobileAccordion.set(this.openMobileAccordion() === label ? null : label);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.openMobileAccordion.set(null);
  }
}