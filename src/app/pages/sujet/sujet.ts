import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';

type CourseBadge = 'Nouveau' | 'Best-seller' | 'Certifiant' | null;

interface Course {
  id: number;
  title: string;
  provider: string;
  badge: CourseBadge;
  duration: string;
  weeklyHours: string;
  subject: string;
  image: string;
  imageAlt: string;
}

interface ExpertTrack {
  title: string;
  description: string;
  coursesCount: number;
  duration: string;
  image: string;
  imageAlt: string;
}

interface MicroCredential {
  title: string;
  description: string;
  duration: string;
  level: string;
  image: string;
  imageAlt: string;
}

interface NewsArticle {
  title: string;
  category: string;
  date: string;
  image: string;
  imageAlt: string;
}

@Component({
  selector: 'app-sujet',
  standalone: true,
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './sujet.html',
  styleUrl: './sujet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sujet {
  readonly subjects: string[] = [
    'Audit & Contrôle',
    'Expertise Comptable',
    'Fiscalité & Droit',
    'Finance & Banque',
    'Conseil & Stratégie',
    'Data & Tech',
    'Management & RH',
    'Entrepreneuriat',
    'Santé & Administration',
    'Langues & Soft Skills',
  ];

  readonly activeSubject = signal<string>('tous');
  private readonly PAGE_SIZE = 8;
  readonly visibleCount = signal<number>(this.PAGE_SIZE);

  readonly courses: Course[] = [
    {
      id: 1,
      title: 'Fondamentaux de l\'audit interne et gestion des risques',
      provider: 'KMAA Academy',
      badge: 'Nouveau',
      duration: '6 semaines',
      weeklyHours: '3h / semaine',
      subject: 'Audit & Contrôle',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Audit interne',
    },
    {
      id: 2,
      title: 'Commissariat aux comptes : Normes OHADA et ISA',
      provider: 'KMAA Audit',
      badge: 'Best-seller',
      duration: '8 semaines',
      weeklyHours: '4h / semaine',
      subject: 'Expertise Comptable',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Commissariat aux comptes',
    },
    {
      id: 3,
      title: 'Consolidation des comptes et normes IFRS',
      provider: 'KMAA Academy',
      badge: 'Certifiant',
      duration: '10 semaines',
      weeklyHours: '5h / semaine',
      subject: 'Expertise Comptable',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Consolidation comptable',
    },
    {
      id: 4,
      title: 'Stratégie de digitalisation pour les PME africaines',
      provider: 'KMAA Conseil',
      badge: 'Nouveau',
      duration: '4 semaines',
      weeklyHours: '2h / semaine',
      subject: 'Conseil & Stratégie',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Digitalisation PME',
    },
    {
      id: 5,
      title: 'Contrôle de gestion : Outils et pilotage de la performance',
      provider: 'KMAA Academy',
      badge: null,
      duration: '6 semaines',
      weeklyHours: '3h / semaine',
      subject: 'Finance & Banque',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Contrôle de gestion',
    },
    {
      id: 6,
      title: 'Fiscalité des entreprises : Optimisation et contentieux',
      provider: 'KMAA Juridique',
      badge: null,
      duration: '8 semaines',
      weeklyHours: '3h / semaine',
      subject: 'Fiscalité & Droit',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Fiscalité entreprise',
    },
    {
      id: 7,
      title: 'Analyse de données avec Excel et Power BI',
      provider: 'KMAA Tech',
      badge: 'Best-seller',
      duration: '5 semaines',
      weeklyHours: '3h / semaine',
      subject: 'Data & Tech',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Analyse de données',
    },
    {
      id: 8,
      title: 'Cybersécurité pour les dirigeants et managers',
      provider: 'KMAA Tech',
      badge: 'Nouveau',
      duration: '3 semaines',
      weeklyHours: '2h / semaine',
      subject: 'Data & Tech',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Cybersécurité',
    },
    {
      id: 9,
      title: 'Leadership et Management d\'équipe à distance',
      provider: 'KMAA RH',
      badge: null,
      duration: '4 semaines',
      weeklyHours: '2h / semaine',
      subject: 'Management & RH',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Management équipe',
    },
    {
      id: 10,
      title: 'Création et gestion d\'une entreprise individuelle',
      provider: 'KMAA Conseil',
      badge: null,
      duration: '6 semaines',
      weeklyHours: '3h / semaine',
      subject: 'Entrepreneuriat',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Entrepreneuriat',
    },
    {
      id: 11,
      title: 'Anglais professionnel : Finance et Audit',
      provider: 'KMAA Langues',
      badge: null,
      duration: '8 semaines',
      weeklyHours: '2h / semaine',
      subject: 'Langues & Soft Skills',
      image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Anglais professionnel',
    },
    {
      id: 12,
      title: 'Gestion administrative des structures de santé',
      provider: 'KMAA Santé',
      badge: null,
      duration: '4 semaines',
      weeklyHours: '2h / semaine',
      subject: 'Santé & Administration',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Gestion santé',
    },
  ];

  readonly expertTracks: ExpertTrack[] = [
    {
      title: 'Devenez Auditeur Interne Certifié',
      description: 'Un parcours complet pour maîtriser les normes IIA et les techniques d\'audit opérationnel.',
      coursesCount: 4,
      duration: '4 mois',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Auditeur Interne',
    },
    {
      title: 'Expertise Comptable & Finance de Marché',
      description: 'Maîtrisez les rouages de la finance d\'entreprise et des marchés financiers avec des cas pratiques.',
      coursesCount: 5,
      duration: '6 mois',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Expertise Comptable',
    },
    {
      title: 'Digital & Data pour les Métiers de la Finance',
      description: 'Transformez votre pratique : Excel avancé, Power BI, automatisation et analyse de données.',
      coursesCount: 3,
      duration: '3 mois',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Data Finance',
    },
  ];

  readonly microCredentials: MicroCredential[] = [
    {
      title: 'Certificat en Contrôle Interne (COSO)',
      description: 'Structurez et évaluez le dispositif de contrôle interne de toute organisation.',
      duration: '6 semaines',
      level: 'Niveau Fondation',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Contrôle Interne',
    },
    {
      title: 'Big Data & Analyse pour l\'Audit',
      description: 'Utilisez la data pour accroître l\'efficacité de vos missions d\'audit et de conseil.',
      duration: '10 semaines',
      level: 'Niveau Avancé',
      image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Big Data Audit',
    },
    {
      title: 'Certificat de Base en Pratique RH',
      description: 'Maîtrisez les compétences essentielles en gestion des ressources humaines.',
      duration: '8 semaines',
      level: 'Niveau Fondation',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Pratique RH',
    },
  ];

  readonly newsArticles: NewsArticle[] = [
    {
      title: 'Un guide étape par étape pour rédiger un business plan',
      category: 'Entrepreneuriat',
      date: '12 Oct 2026',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Business Plan',
    },
    {
      title: 'Introduction à l\'audit interne : tout ce qu\'il faut savoir',
      category: 'Audit',
      date: '08 Oct 2026',
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Audit Interne',
    },
    {
      title: 'Comment créer une stratégie marketing efficace en 2027',
      category: 'Marketing',
      date: '01 Oct 2026',
      image: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Stratégie Marketing',
    },
    {
      title: 'Compétences relationnelles : lesquelles développer ?',
      category: 'Soft Skills',
      date: '28 Sep 2026',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Soft Skills',
    },
  ];


    // ✅ NOUVELLE SECTION : Dernières actualités (5 cartes différentes)
  readonly latestNews: NewsArticle[] = [
    {
      title: 'Les 5 tendances fiscales à surveiller au Burkina Faso en 2027',
      category: 'Fiscalité',
      date: '15 Oct 2026',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Tendances fiscales',
    },
    {
      title: 'Comment l\'IA transforme le métier d\'auditeur interne',
      category: 'Technologie',
      date: '10 Oct 2026',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'IA et audit',
    },
    {
      title: 'OHADA : ce qui change pour les entreprises en 2027',
      category: 'Droit des affaires',
      date: '05 Oct 2026',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Réforme OHADA',
    },
    {
      title: 'Leadership au féminin : briser le plafond de verre en Afrique',
      category: 'Management',
      date: '30 Sep 2026',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Leadership féminin',
    },
    {
      title: 'Cybersécurité : 7 erreurs fatales que commettent les PME',
      category: 'Sécurité',
      date: '25 Sep 2026',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Cybersécurité PME',
    },
  ];

  readonly totalFiltered = computed(() => {
    const subject = this.activeSubject();
    return subject === 'tous'
      ? this.courses.length
      : this.courses.filter((c) => c.subject === subject).length;
  });

  readonly visibleCourses = computed(() => {
    const subject = this.activeSubject();
    const filtered =
      subject === 'tous'
        ? this.courses
        : this.courses.filter((c) => c.subject === subject);
    return filtered.slice(0, this.visibleCount());
  });

  readonly hasMore = computed(
    () => this.visibleCount() < this.totalFiltered(),
  );

  setSubject(subject: string): void {
    this.activeSubject.set(subject);
    this.visibleCount.set(this.PAGE_SIZE);
  }

  showMore(): void {
    this.visibleCount.update((count) => count + this.PAGE_SIZE);
  }
}