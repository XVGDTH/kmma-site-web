import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

// ✅ Service local (simulation, aucune API)
import { EnrollmentService } from '../../shared/enrollment.service';

type Tab = 'cours' | 'certificats' | 'paiements' | 'maformule' | 'evaluations' | 'profil';

interface EnrollmentItem {
  courseId: string;
  progressPercent: number;
  enrolledAt: string;
  lastAccessedAt: string;
  certificateIssued: boolean;
  courseTitle?: string;
  courseCategory?: string;
  courseImage?: string;
}

interface PaymentInfo {
  planName: string;
  amount: number;
  courseId?: string;
}

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-student-space',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './student-space.html',
  styleUrl: './student-space.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentSpace {

  private readonly router = inject(Router);
  private readonly enrollmentService = inject(EnrollmentService);

  // ============================================================
  // INFOS DE L'APPRENANT (depuis localStorage)
  // ============================================================
  private readonly user = signal<UserInfo | null>(this.readUser());

  readonly studentName = computed(() => this.user()?.name ?? 'Apprenant');
  readonly studentEmail = computed(() => this.user()?.email ?? '');

  // ============================================================
  // ÉTAT
  // ============================================================
  readonly activeTab = signal<Tab>('cours');

  // ============================================================
  // INSCRIPTIONS (depuis EnrollmentService)
  // ============================================================
  readonly enrollments = computed<EnrollmentItem[]>(() =>
    this.enrollmentService.enrollments().map((e) => ({
      courseId: String(e.courseId),
      courseTitle: e.title,
      courseCategory: e.subject,
      courseImage: e.image,
      progressPercent: e.progressPercent,
      enrolledAt: this.formatDate(e.enrolledAt),
      lastAccessedAt: this.formatDate(e.lastAccessedAt),
      certificateIssued: e.certificateIssued,
    }))
  );

  // ============================================================
  // PAIEMENTS (simulation : 1 paiement par inscription)
  // ============================================================
  readonly payments = computed<PaymentInfo[]>(() =>
    this.enrollmentService.enrollments().map((e) => ({
      planName: e.title,
      amount: 0, // À remplacer plus tard par le vrai montant
      courseId: String(e.courseId),
    }))
  );

  // ============================================================
  // DÉRIVÉS
  // ============================================================
  readonly inProgress = computed(() =>
    this.enrollments().filter((e) => e.progressPercent < 100)
  );

  readonly completed = computed(() =>
    this.enrollments().filter((e) => e.progressPercent === 100)
  );

  // ============================================================
  // MA FORMULE + ÉVALUATIONS (simulation locale)
  // ============================================================
  readonly selectedCourseSlug = signal('');
  readonly myPlanLoaded = signal(false);

  selectCourseForPlan(courseSlug: string): void {
    this.selectedCourseSlug.set(courseSlug);
    this.myPlanLoaded.set(true);
  }

  // Simulation d'une formule pour l'affichage
  readonly myPlan = computed(() => ({
    planName: 'Standard',
    level: 2,
    allPlans: [
      {
        id: 'basic',
        name: 'Basique',
        price: 0,
        isCurrent: false,
        badge: null,
        features: ['Accès aux vidéos', 'Quiz de validation'],
      },
      {
        id: 'standard',
        name: 'Standard',
        price: 25000,
        isCurrent: true,
        badge: 'Recommandé',
        features: ['Accès aux vidéos', 'Quiz de validation', 'Correction des devoirs', 'Séances live'],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 75000,
        isCurrent: false,
        badge: null,
        features: ['Tout Standard', 'Coaching individuel', 'Certificat accéléré'],
      },
    ],
  }));

  // Simulation des évaluations (vide pour l'instant)
  readonly evaluations = signal<any[]>([]);
  readonly averageGrade = computed(() => null);

  // ============================================================
  // MENU UTILISATEUR
  // ============================================================
  readonly userMenuOpen = signal(false);

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  // ============================================================
  // NOTIFICATIONS (simulation)
  // ============================================================
  readonly notifService = {
    unreadCount: () => 0,
    load: () => {},
  };

  // ============================================================
  // CONSTRUCTEUR
  // ============================================================
  constructor() {
    this.enrollmentService.reload();
  }

  // ============================================================
  // HELPERS
  // ============================================================
  private readUser(): UserInfo | null {
    try {
      const raw = localStorage.getItem('kmaa_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  // ============================================================
  // NAVIGATION
  // ============================================================
  goToDashboard(): void {
    this.router.navigate(['/apprendre']);
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  paymentForCourse(courseId: string): PaymentInfo | undefined {
    return this.payments().find((p) => p.courseId === courseId);
  }

  // ============================================================
  // CERTIFICAT (simulation)
  // ============================================================
  generateCertificate(courseId: string): void {
    alert(
      `🎉 Simulation : le certificat du cours #${courseId} serait téléchargé ici.\n` +
      `Plus tard, un appel API sera branché pour générer le vrai PDF.`
    );
  }

  // ============================================================
  // DÉCONNEXION
  // ============================================================
  logout(): void {
    this.userMenuOpen.set(false);
    try {
      localStorage.removeItem('kmaa_user');
    } catch { /* ignore */ }
    this.router.navigate(['/compte/connexion']);
  }
}