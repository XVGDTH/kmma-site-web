import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DecimalPipe, UpperCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import {
  CoursesApiService,
  ApiCourseDetail,
} from '../../../shared/courses-api.service';
import { toAbsoluteUrl } from '../../../shared/formateur-content.service';

// ============================================================
// TYPES
// ============================================================
interface FaqItem {
  question: string;
  answer: string;
}

interface EnterprisePlan {
  id: string;
  slug: string;
  name: string;
  pricePerSeat: number;
  minSeats: number;
  maxSeats: number;
  badge?: string | null;
  description?: string;
  features: string[];
  featured: boolean;
}

@Component({
  selector: 'app-entreprise-course-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, DecimalPipe, UpperCasePipe],
  templateUrl: './entreprise-course-detail.html',
  styleUrl: './entreprise-course-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntrepriseCourseDetail implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesApi = inject(CoursesApiService);
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl = 'http://127.0.0.1:8000';

  // ============================================================
  // ÉTAT
  // ============================================================
  readonly course = signal<ApiCourseDetail | null>(null);
  readonly enterprisePlans = signal<EnterprisePlan[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
    // ✅ Ajoute cette ligne
  readonly assetUrl = toAbsoluteUrl;

  readonly activeTab = signal<string>('apercu');
  readonly openFaqIndex = signal<number | null>(null);
  readonly openWeekIndex = signal<number | null>(null);
  readonly selectedPlan = signal<string | null>(null);
  readonly teamSize = signal<number>(1);

  // ============================================================
  // FAQ
  // ============================================================
  readonly faqs: FaqItem[] = [
    { question: 'Comment fonctionne la facturation entreprise ?', answer: 'Nous émettons une facture officielle avec TVA applicable.' },
    { question: 'Puis-je former plus de 20 personnes ?', answer: 'Oui ! Contactez-nous pour un devis sur mesure.' },
    { question: 'Les sessions sont-elles personnalisables ?', answer: 'Absolument. Nous adaptons le contenu à vos réalités.' },
    { question: 'Y a-t-il un suivi de progression ?', answer: 'Oui, un tableau de bord manager est inclus.' },
    { question: 'Les formations sont-elles certifiantes ?', answer: 'Oui, chaque participant reçoit une attestation KMAA.' },
  ];

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.isLoading.set(false);
      return;
    }

    this.loadCourse(idParam);
    this.loadEnterprisePlans();
  }

  private loadCourse(slugOrId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.coursesApi.getCourseDetail(slugOrId).subscribe({
      next: (course) => {
        this.course.set(course);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement formation :', err);
        this.errorMessage.set('Formation introuvable.');
        this.isLoading.set(false);
      },
    });
  }

  private loadEnterprisePlans(): void {
    this.http
      .get<{ data: EnterprisePlan[] }>(`${this.apiBaseUrl}/api/enterprise/plans`)
      .subscribe({
        next: (res) => this.enterprisePlans.set(res.data ?? []),
        error: (err) => {
          console.error('Erreur chargement formules :', err);
          // Fallback : plans par défaut si l'API n'est pas encore prête
          this.enterprisePlans.set([
            {
              id: '1', slug: 'basique', name: 'Basique',
              pricePerSeat: 210000, minSeats: 1, maxSeats: 5,
              description: 'Accès individuel',
              features: ['Accès complet', 'Certificat', 'Support email'],
              featured: false,
            },
            {
              id: '2', slug: 'standard', name: 'Standard',
              pricePerSeat: 380000, minSeats: 2, maxSeats: 5,
              description: 'Équipes de 2 à 5',
              features: ['Tout Basique', 'Corrections', 'Live', 'Tableau de bord'],
              featured: true,
            },
          ]);
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

  selectPlan(planId: string): void {
    const c = this.course();
    if (!c) return;

    this.selectedPlan.set(planId);

    this.router.navigate(['/compte/connexion'], {
      queryParams: {
        redirect: `/achats-entreprise/devis?courseId=${c.courseId}&plan=${planId}&teamSize=${this.teamSize()}`,
      },
    });
  }

  goToCheckout(): void {
    const c = this.course();
    const plan = this.selectedPlan();
    if (!c || !plan) return;

    this.router.navigate(['/achats-entreprise/devis'], {
      queryParams: {
        courseId: c.courseId,
        plan: plan,
        teamSize: this.teamSize(),
      },
    });
  }

  requestCustomQuote(): void {
    const c = this.course();
    if (!c) return;

    this.router.navigate(['/contact'], {
      queryParams: { subject: 'devis-entreprise', courseId: c.courseId },
    });
  }

  setTeamSize(size: number): void {
    if (size >= 1 && size <= 100) this.teamSize.set(size);
  }

  scrollToFormules(): void {
    this.activeTab.set('formules');
    setTimeout(() => {
      const el = document.getElementById('formules');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}