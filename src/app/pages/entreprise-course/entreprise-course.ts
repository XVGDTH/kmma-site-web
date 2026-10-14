import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';

type DeliveryMode = 'En ligne' | 'Présentiel' | 'Mixte';

interface EntrepriseCourseItem {
  id: number;
  title: string;
  provider: string;
  mode: DeliveryMode;
  duration: string;
  hoursPerWeek: string;
  modulesCount: number;   // ✅ NOUVEAU CHAMP
  price: number;          // (gardé pour la page détail, non affiché)
  subject: string;
  image: string;
  imageAlt: string;
  description: string;
}

@Component({
  selector: 'app-entreprise-course',
  standalone: true,
  imports: [RouterLink, UpperCasePipe],   // ✅ DecimalPipe retiré
  templateUrl: './entreprise-course.html',
  styleUrl: './entreprise-course.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntrepriseCourse {
  // --- Filtres de domaines ---
  readonly subjects: string[] = [
    'Commissariat aux comptes',
    'Actuariat',
    'Audit & Contrôle',
    'Expertise comptable',
    'Conseil & Stratégie',
    'Finance d\'entreprise',
    'Fiscalité & Droit',
    'Data & Tech',
    'Management & Leadership',
    'Cybersécurité',
  ];

  readonly activeSubject = signal<string>('tous');
  private readonly PAGE_SIZE = 8;
  readonly visibleCount = signal<number>(this.PAGE_SIZE);

  // --- Catalogue des formations pour entreprises ---
  // ✅ IDs COMMENÇANT À 10001 pour éviter tout conflit
  readonly courses: EntrepriseCourseItem[] = [
    {
      id: 10001,
      title: 'Commissariat aux comptes : Normes OHADA et ISA pour les entreprises',
      provider: 'KMAA Entreprises',
      mode: 'Mixte',
      duration: '12 semaines',
      hoursPerWeek: '6h / semaine',
      modulesCount: 8,
      price: 1500000,
      subject: 'Commissariat aux comptes',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Commissariat aux comptes entreprise',
      description: 'Formez vos équipes aux missions de commissariat aux comptes conformément aux normes OHADA et ISA.',
    },
    {
      id: 10002,
      title: 'Actuariat : Modélisation des risques et provisionnement',
      provider: 'KMAA Entreprises',
      mode: 'En ligne',
      duration: '16 semaines',
      hoursPerWeek: '5h / semaine',
      modulesCount: 10,
      price: 2500000,
      subject: 'Actuariat',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Actuariat',
      description: 'Maîtrisez les techniques actuarielles pour évaluer et provisionner les risques de votre entreprise.',
    },
    {
      id: 10003,
      title: 'Audit interne avancé pour les grands groupes',
      provider: 'KMAA Entreprises',
      mode: 'Présentiel',
      duration: '8 semaines',
      hoursPerWeek: '12h / semaine',
      modulesCount: 6,
      price: 1800000,
      subject: 'Audit & Contrôle',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Audit interne entreprise',
      description: 'Formation intensive en présentiel pour structurer votre fonction d\'audit interne.',
    },
    {
      id: 10004,
      title: 'Expertise comptable : Consolidation et normes IFRS',
      provider: 'KMAA Entreprises',
      mode: 'Mixte',
      duration: '14 semaines',
      hoursPerWeek: '7h / semaine',
      modulesCount: 9,
      price: 2200000,
      subject: 'Expertise comptable',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Expertise comptable',
      description: 'Perfectionnez vos équipes comptables sur la consolidation et les normes internationales.',
    },
    {
      id: 10005,
      title: 'Conseil en stratégie et transformation digitale',
      provider: 'KMAA Entreprises',
      mode: 'En ligne',
      duration: '6 semaines',
      hoursPerWeek: '4h / semaine',
      modulesCount: 5,
      price: 1200000,
      subject: 'Conseil & Stratégie',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Conseil stratégie',
      description: 'Accompagnez la transformation digitale de vos clients avec une méthode éprouvée.',
    },
    {
      id: 10006,
      title: 'Finance d\'entreprise : Analyse financière et évaluation',
      provider: 'KMAA Entreprises',
      mode: 'Mixte',
      duration: '10 semaines',
      hoursPerWeek: '5h / semaine',
      modulesCount: 7,
      price: 1600000,
      subject: 'Finance d\'entreprise',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Finance entreprise',
      description: 'Maîtrisez l\'analyse financière et l\'évaluation des entreprises pour vos décisions stratégiques.',
    },
    {
      id: 10007,
      title: 'Fiscalité internationale et prix de transfert',
      provider: 'KMAA Entreprises',
      mode: 'Présentiel',
      duration: '5 semaines',
      hoursPerWeek: '10h / semaine',
      modulesCount: 4,
      price: 1900000,
      subject: 'Fiscalité & Droit',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Fiscalité internationale',
      description: 'Formation présentielle pour maîtriser la fiscalité internationale et les prix de transfert.',
    },
    {
      id: 10008,
      title: 'Data Analytics pour la finance et l\'audit',
      provider: 'KMAA Entreprises',
      mode: 'En ligne',
      duration: '8 semaines',
      hoursPerWeek: '4h / semaine',
      modulesCount: 6,
      price: 1400000,
      subject: 'Data & Tech',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Data Analytics',
      description: 'Exploitez la data pour améliorer vos missions d\'audit et de conseil.',
    },
    {
      id: 10009,
      title: 'Management et leadership pour cadres dirigeants',
      provider: 'KMAA Entreprises',
      mode: 'Présentiel',
      duration: '4 semaines',
      hoursPerWeek: '15h / semaine',
      modulesCount: 5,
      price: 1700000,
      subject: 'Management & Leadership',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Management leadership',
      description: 'Développez les compétences de leadership de vos managers et dirigeants.',
    },
    {
      id: 10010,
      title: 'Cybersécurité pour les entreprises : Stratégie et gouvernance',
      provider: 'KMAA Entreprises',
      mode: 'Mixte',
      duration: '6 semaines',
      hoursPerWeek: '5h / semaine',
      modulesCount: 4,
      price: 1300000,
      subject: 'Cybersécurité',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Cybersécurité entreprise',
      description: 'Protégez votre entreprise contre les cybermenaces avec une stratégie de gouvernance solide.',
    },
    {
      id: 10011,
      title: 'Audit des systèmes d\'information (SI)',
      provider: 'KMAA Entreprises',
      mode: 'En ligne',
      duration: '7 semaines',
      hoursPerWeek: '4h / semaine',
      modulesCount: 5,
      price: 1350000,
      subject: 'Audit & Contrôle',
      image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Audit SI',
      description: 'Auditez la sécurité et la performance des systèmes d\'information de votre entreprise.',
    },
    {
      id: 10012,
      title: 'Commissariat aux apports et fusion-acquisition',
      provider: 'KMAA Entreprises',
      mode: 'Présentiel',
      duration: '6 semaines',
      hoursPerWeek: '8h / semaine',
      modulesCount: 5,
      price: 2100000,
      subject: 'Commissariat aux comptes',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Fusion acquisition',
      description: 'Formation avancée sur le commissariat aux apports et les opérations de fusion-acquisition.',
    },
  ];

  // --- Pagination ---
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