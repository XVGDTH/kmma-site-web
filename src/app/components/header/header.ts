import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavLink {
  label: string;
  route?: string;
}

export interface ExpertisePanelLink {
  label: string;
  route: string;
  queryParams?: Record<string, string>; // ✅ Ajout
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

export interface EmploiItem {
  label: string;
  route: string;
  icon: 'carrieres' | 'partenaires';
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

// interface ressources
export interface RessourceLink {
  label: string;
  route: string;
}

export interface RessourceArticle {
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  route: string;
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
  readonly activeExpertise = signal<string | null>(null);
  readonly activeEmploi = signal<string | null>(null);

  readonly simpleLinks: NavLink[] = [
    // { label: 'Accueil', route: '/' },
    { label: 'Actualités', route: '/actualites' },  
    // { label: 'Équipe', route: '/equipe' },
  ];

  readonly expertiseIcons: Record<ExpertiseItem['icon'], string> = {
    formations: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z',
    accompagnement: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    gestion: 'M9 11H3v11h6V11Z M15 4H9v18h6V4Z M21 15h-6v7h6v-7Z',
    audit: 'M9 12l2 2 4-4 M12 3l8 4v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4Z',
  };

  readonly emploiIcons: Record<EmploiItem['icon'], string> = {
    carrieres: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    partenaires: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  };



readonly expertises: ExpertiseItem[] = [
    {
    label: 'Commissariat aux comptes',
    route: '/commissariat',
    icon: 'audit',
    panel: {
      title: 'COMMISSARIAT AUX COMPTES',
      ctaLabel: 'Découvrir cette expertise',
      ctaRoute: '/commissariat',
      links: [
        { label: 'Audit légal et certification des comptes', route: '/commissariat', queryParams: { subject: 'Audit et contrôle de gestion' } },
        { label: 'Normes d\'audit (ISA) et méthodologie', route: '/commissariat', queryParams: { subject: 'Audit et contrôle de gestion' } },
        { label: 'Comptabilité et états financiers', route: '/commissariat', queryParams: { subject: 'Comptabilité et finance' } },
        { label: 'Contrôle interne et évaluation des risques', route: '/commissariat', queryParams: { subject: 'Affaires et gestion' } },
        { label: 'Nous contacter', route: '/contact' },
      ],
      resources: [
        { label: 'Actualités audit et comptabilité', route: '/actualites' },
        { label: 'Catalogue complet', route: '/catalogue' },
      ],
      image: 'commissariat.png',
      imageAlt: 'Commissariat aux comptes KMAA',
      bannerQuestion: 'Besoin d\'un accompagnement en commissariat aux comptes ?',
      bannerActions: [
        { label: 'Prendre RDV', route: '/contact', style: 'primary' },
        { label: 'Nous contacter', route: '/contact', style: 'secondary' },
      ],
    },
  },

  {
    label: 'Expertise comptable',
    route: '/expertise-comptable',
    icon: 'gestion',
    panel: {
      title: 'EXPERTISE COMPTABLE',
      ctaLabel: 'Découvrir',
      ctaRoute: '/expertise-comptable',
      links: [
        { label: 'Comptabilité et finance', route: '/catalogue', queryParams: { subject: 'Comptabilité et finance' } },
        { label: 'Comptabilité OHADA', route: '/catalogue', queryParams: { subject: 'Comptabilité et finance' } },
        { label: 'Contrôle de gestion', route: '/catalogue', queryParams: { subject: 'Audit et contrôle de gestion' } },
        { label: 'Nous contacter', route: '/contact' },
      ],
      resources: [
        { label: 'Catalogue Academy', route: '/catalogue' },
      ],
      image: '/ressources/expertise_comptable.png',
      imageAlt: 'Expertise comptable KMAA',
      bannerQuestion: 'Besoin d\'un appui en comptabilité ?',
      bannerActions: [
        { label: 'Prendre RDV', route: '/contact', style: 'primary' },
        { label: 'Nous contacter', route: '/contact', style: 'secondary' },
      ],
    },
  },
  {
    label: 'Audit fraude et investigations',
    route: '/audit',
    icon: 'audit',
    panel: {
      title: 'AUDIT, FRAUDE ET INVESTIGATIONS',
      ctaLabel: 'Découvrir',
      ctaRoute: '/audit',
      links: [
        { label: 'Audit et contrôle de gestion', route: '/catalogue', queryParams: { subject: 'Audit et contrôle de gestion' } },
        { label: 'Audit financier', route: '/catalogue', queryParams: { subject: 'Comptabilité et finance' } },
        { label: 'Assurance et gestion des sinistres', route: '/catalogue', queryParams: { subject: 'Affaires et gestion' } },
        { label: 'Nous contacter', route: '/contact' },
      ],
      resources: [
        { label: 'Articles & actualités', route: '/actualites' },
      ],
      image: 'audit_externe.png',
      imageAlt: 'Audit et fraude KMAA',
      bannerQuestion: 'Besoin d\'un accompagnement en audit ?',
      bannerActions: [
        { label: 'Prendre RDV', route: '/contact', style: 'primary' },
        { label: 'Nous contacter', route: '/contact', style: 'secondary' },
      ],
    },
  },

  {
    label: 'Formation',
    route: '/catalogue',
    icon: 'formations',
    panel: {
      title: 'FORMATION',
      ctaLabel: 'Découvrir nos formations',
      ctaRoute: '/catalogue',
      links: [
        { label: 'Toutes nos formations', route: '/catalogue' },
        { label: 'Affaires et gestion', route: '/catalogue', queryParams: { subject: 'Affaires et gestion' } },
        { label: 'Comptabilité et finance', route: '/catalogue', queryParams: { subject: 'Comptabilité et finance' } },
        { label: 'Informatique et tech', route: '/catalogue', queryParams: { subject: 'Informatique et technologie' } },
        { label: 'Audit et contrôle', route: '/catalogue', queryParams: { subject: 'Audit et contrôle de gestion' } },
      ],
      resources: [
        { label: 'Guide pour choisir sa formation', route: '/actualites' },
        { label: 'Catalogue complet', route: '/catalogue' },
      ],
      image: 'formations.png',
      imageAlt: 'Formation KMAA',
      bannerQuestion: 'Besoin d\'aide pour choisir votre formation ?',
      bannerActions: [
        { label: 'Prendre RDV', route: '/contact', style: 'primary' },
        { label: 'Nous contacter', route: '/contact', style: 'secondary' },
      ],
    },
  },
  {
    label: 'Conseil',
    route: '/conseil',
    icon: 'accompagnement',
    panel: {
      title: 'CONSEIL',
      ctaLabel: 'Découvrir nos missions de conseil',
      ctaRoute: '/contact',
      links: [
        { label: 'Conseil en stratégie et organisation', route: '/catalogue', queryParams: { subject: 'Affaires et gestion' } },
        { label: 'Conseil en gestion et performance', route: '/catalogue', queryParams: { subject: 'Audit et contrôle de gestion' } },
        { label: 'Conseil financier et comptable', route: '/catalogue', queryParams: { subject: 'Comptabilité et finance' } },
        { label: 'Conseil en management et leadership', route: '/catalogue', queryParams: { subject: 'Direction et leadership' } },
        { label: 'Conseil en ressources humaines', route: '/catalogue', queryParams: { subject: 'Ressources humaines' } },
        { label: 'Nous contacter', route: '/contact' },
      ],
      resources: [
        { label: 'Nos conseils et analyses', route: '/actualites' },
        { label: 'My Academy', route: '/academy' },
      ],
      image: 'accompagnement_sur_mesure.png',
      imageAlt: 'Conseil KMAA',
      bannerQuestion: 'Besoin de conseils pour votre organisation ?',
      bannerActions: [
        { label: 'Prendre RDV', route: '/contact', style: 'primary' },
        { label: 'Nous contacter', route: '/contact', style: 'secondary' },
      ],
    },
  },


];




  readonly emplois: EmploiItem[] = [
  {
    label: 'Offres d\'emploi',
    route: '/emploi',
    icon: 'carrieres',
    panel: {
      title: 'OFFRES D\'EMPLOI',
      ctaLabel: 'Voir les offres d\'emploi',
      ctaRoute: '/emploi',
      links: [
        { label: 'Toutes les offres', route: '/emploi' },
        { label: 'Candidature spontanée', route: '/contact' },
        { label: 'Pourquoi rejoindre KMAA ?', route: '/emploi' },
      ],
      resources: [
        { label: 'Découvrir l\'équipe', route: '/equipe' },
      ],
      image: 'faire_carriere.png',
      imageAlt: 'Carrières chez KMAA',
      bannerQuestion: 'Envie de rejoindre l\'équipe KMAA ?',
      bannerActions: [
        { label: 'Voir les offres', route: '/emploi', style: 'primary' },
        { label: 'Nous contacter', route: '/contact', style: 'secondary' },
      ],
    },
  },
  {
    label: 'Recrutements partenaires',
    route: '/emploi',
    icon: 'partenaires',
    panel: {
      title: 'RECRUTEMENTS PARTENAIRES',
      ctaLabel: 'Devenir partenaire',
      ctaRoute: '/emploi',
      links: [
        { label: 'Offres partenaires', route: '/emploi' },
        { label: 'Devenir partenaire', route: '/contact' },
        { label: 'Conditions de collaboration', route: '/contact' },
      ],
      resources: [
        { label: 'Contact partenariats', route: '/contact' },
      ],
      image: 'partenaire_carriere.png',
      imageAlt: 'Recrutements partenaires KMAA',
      bannerQuestion: 'Vous souhaitez collaborer avec nous ?',
      bannerActions: [
        { label: 'Devenir partenaire', route: '/contact', style: 'primary' },
        { label: 'Nous contacter', route: '/contact', style: 'secondary' },
      ],
    },
  },
];

// les données du menu ressources
readonly ressourcesLinks: RessourceLink[] = [
  { label: 'Blog', route: '/blog' },
  { label: 'Newsletter', route: '/newsletter' },
  { label: 'Masterclass', route: '/masterclass' },
  // { label: 'Guides', route: '/actualites' },
  { label: 'Modèles de documents', route: '/modeles-documents' },
  { label: 'Calendrier fiscal', route: '/calendrier-fiscal' },
  { label: 'Simulateurs', route: '/simulateur' },
];

readonly ressourcesArticles: RessourceArticle[] = [
  {
    title: 'Quelles sont les étapes clés d\'une dématérialisation fiscale réussie ?',
    excerpt: 'La réforme démarre le 1er septembre 2026 pour la réception de factures électroniques...',
    image: 'dematerialisation_fiscale.png',
    imageAlt: 'Dématérialisation fiscale',
    route: '/actualites',
  },
  {
    title: 'Quels services attendre d\'un expert-comptable pour une TPE ?',
    excerpt: 'Découvrez les missions essentielles d\'un cabinet pour accompagner efficacement votre entreprise.',
    image: 'expertise_comptable.png',
    imageAlt: 'Services expert-comptable TPE',
    route: '/actualites',
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

  openEmploiMenu(): void {
    this.openDropdown.set('Emploi');
    if (!this.activeEmploi()) {
      this.activeEmploi.set(this.emplois[0]?.label ?? null);
    }
  }

  toggleEmploiMenu(): void {
    if (this.openDropdown() === 'Emploi') {
      this.closeDropdowns();
    } else {
      this.openEmploiMenu();
    }
  }

  setActiveEmploi(label: string): void {
    this.activeEmploi.set(label);
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