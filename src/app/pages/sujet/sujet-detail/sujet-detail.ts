import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DecimalPipe, UpperCasePipe } from '@angular/common';

import {
  CoursesApiService,
  ApiCourseDetail,
} from '../../../shared/courses-api.service';
import { toAbsoluteUrl } from '../../../shared/formateur-content.service';

interface FaqItem {
  question: string;
  answer: string;
}

interface NewsArticle {
  title: string;
  category: string;
  date: string;
  image: string;
  imageAlt: string;
}

@Component({
  selector: 'app-sujet-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, UpperCasePipe, CommonModule],
  templateUrl: './sujet-detail.html',
  styleUrl: './sujet-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SujetDetail implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesApi = inject(CoursesApiService);

  // ============================================================
  // ÉTAT
  // ============================================================
  readonly course = signal<ApiCourseDetail | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
   readonly assetUrl = toAbsoluteUrl; // Ajoute ceci

  readonly activeTab = signal<string>('apercu');
  readonly openFaqIndex = signal<number | null>(null);
  readonly openWeekIndex = signal<number | null>(null);

  // ============================================================
  // FAQ
  // ============================================================
  readonly faqs: FaqItem[] = [
    { question: 'Comment puis-je payer pour cette formation ?', answer: 'Orange Money, Moov Money, Wave, virements bancaires.' },
    { question: 'Puis-je changer d\'avis ?', answer: 'Oui, sous 14 jours si le cours n\'a pas commencé.' },
    { question: 'Le certificat est-il reconnu ?', answer: 'Oui, nos certifications sont reconnues par les entreprises locales.' },
    { question: 'Y a-t-il des prérequis ?', answer: 'Aucune connaissance préalable n\'est requise.' },
    { question: 'Dois-je être disponible à des heures précises ?', answer: 'Non, la formation est 100% en ligne et asynchrone.' },
  ];

  // ============================================================
  // ACTUALITÉS
  // ============================================================
  readonly latestNews: NewsArticle[] = [
    { title: 'Les 5 tendances fiscales à surveiller au Burkina Faso en 2027', category: 'Fiscalité', date: '15 Oct 2026', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60', imageAlt: 'Tendances fiscales' },
    { title: 'Comment l\'IA transforme le métier d\'auditeur interne', category: 'Technologie', date: '10 Oct 2026', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=60', imageAlt: 'IA et audit' },
    { title: 'OHADA : ce qui change pour les entreprises en 2027', category: 'Droit des affaires', date: '05 Oct 2026', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=60', imageAlt: 'Réforme OHADA' },
    { title: 'Leadership au féminin : briser le plafond de verre en Afrique', category: 'Management', date: '30 Sep 2026', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=60', imageAlt: 'Leadership féminin' },
    { title: 'Cybersécurité : 7 erreurs fatales que commettent les PME', category: 'Sécurité', date: '25 Sep 2026', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=60', imageAlt: 'Cybersécurité PME' },
    { title: 'Comment réussir sa transformation digitale en Afrique de l\'Ouest', category: 'Digital', date: '20 Sep 2026', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=60', imageAlt: 'Transformation digitale' },
    { title: 'Financement des PME : les nouvelles opportunités en 2027', category: 'Finance', date: '15 Sep 2026', image: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=800&q=60', imageAlt: 'Financement PME' },
    { title: 'Les soft skills les plus recherchées par les recruteurs en 2027', category: 'Carrière', date: '10 Sep 2026', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=60', imageAlt: 'Soft skills' },
  ];

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit(): void {
    const slugParam = this.route.snapshot.paramMap.get('id');
    if (!slugParam) {
      this.isLoading.set(false);
      return;
    }
    this.loadCourse(slugParam);
  }

  private loadCourse(slug: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.coursesApi.getCourseDetail(slug).subscribe({
      next: (course) => {
        this.course.set(course);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement cours :', err);
        this.errorMessage.set('Cours introuvable ou erreur réseau.');
        this.isLoading.set(false);
      },
    });
  }

  // ============================================================
  // ACTIONS
  // ============================================================
  setTab(tab: string): void {
    this.activeTab.set(tab);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  toggleFaq(index: number): void {
    this.openFaqIndex.update((c) => (c === index ? null : index));
  }

  toggleWeek(index: number): void {
    this.openWeekIndex.update((c) => (c === index ? null : index));
  }

  goToEnroll(): void {
    const c = this.course();
    if (!c) return;

    this.router.navigate(['/compte/connexion'], {
      queryParams: { redirect: `/achats-cours/paiement/${c.slug}` },
    });
  }
}