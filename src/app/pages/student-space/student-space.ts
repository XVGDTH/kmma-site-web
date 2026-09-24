import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { CourseAccessService } from '../../shared/course-access.service';
import { DecimalPipe } from '@angular/common'; 
import { NotificationService } from '../../shared/notification.service';

type Tab = 'cours' | 'certificats' | 'paiements' | 'maformule' | 'evaluations' | 'profil';

interface EnrollmentItem {
  courseId: string;
  progressPercent: number;
  enrolledAt: string;
  lastAccessedAt: string;
  certificateIssued: boolean;
  courseTitle?: string;
  courseCategory?: string;
}

interface PaymentInfo {
  planName: string;
  amount: number;
  courseId?: string;
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

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // ============================================================
  // SERVICES
  // ============================================================

  readonly accessService = inject(CourseAccessService);
  readonly notifService = inject(NotificationService);

  // ============================================================
  // INFOS DE L'APPRENANT CONNECTÃ‰
  // ============================================================

  readonly studentName = computed(
    () => this.auth.currentUser()?.name ?? 'Apprenant'
  );

  readonly studentEmail = computed(
    () => this.auth.currentUser()?.email ?? ''
  );

  // ============================================================
  // Ã‰TAT
  // ============================================================

  readonly activeTab = signal<Tab>('cours');

  readonly enrollments = signal<EnrollmentItem[]>([]);
  readonly payments = signal<PaymentInfo[]>([]);

  // ============================================================
  // ðŸ  NAVIGATION VERS LE DASHBOARD
  // ============================================================

  goToDashboard(): void {
    this.router.navigate(['/apprendre']);
  }

  // ============================================================
  // ðŸ’³ MA FORMULE + ðŸ† Ã‰VALUATIONS (par cours)
  // ============================================================

  readonly selectedCourseSlug = signal('');
  readonly myPlanLoaded = signal(false);

  selectCourseForPlan(courseSlug: string): void {
    this.selectedCourseSlug.set(courseSlug);
    this.accessService.loadAccess(courseSlug);   // charge access + myPlan + Ã©valuations
    this.myPlanLoaded.set(true);
  }

  // ============================================================
  // MENU UTILISATEUR (dropdown sur l'avatar)
  // ============================================================

  readonly userMenuOpen = signal(false);

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  constructor() {
    this.loadEnrollments();
        // ðŸ”” Notifications : chargement initial + polling 60 s (badge Ã  jour)
    this.notifService.load();
    setInterval(() => this.notifService.load(), 60000);
  }

  // ============================================================
  // CHARGEMENT DES INSCRIPTIONS
  // ============================================================

  private loadEnrollments(): void {
    this.http
      .get<{ data: EnrollmentItem[] }>(
        'https://api.convergesas.com/api/me/enrollments'
      )
      .subscribe({
        next: (res) => {
          this.enrollments.set(res.data ?? []);
        },
        error: (err) => {
          console.error('Erreur chargement des inscriptions :', err);

          // Session expirÃ©e ou non connectÃ© â†’ retour au login
          if (err?.status === 401) {
            this.auth.logout();
            this.router.navigate(['/compte/connexion'], {
              queryParams: { redirect: '/compte/espace' },
            });
            return;
          }

          this.enrollments.set([]);
        },
      });
  }

  // ============================================================
  // DÃ‰RIVÃ‰S
  // ============================================================

  readonly inProgress = computed(() =>
    this.enrollments().filter((e) => e.progressPercent < 100)
  );

  readonly completed = computed(() =>
    this.enrollments().filter((e) => e.progressPercent === 100)
  );

  // ============================================================
  // ACTIONS
  // ============================================================

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  paymentForCourse(courseId: string): PaymentInfo | undefined {
    return this.payments().find((p) => p.courseId === courseId);
  }

  generateCertificate(courseId: string): void {
    this.http
      .post<{ data: { downloadUrl: string } }>(
        `https://api.convergesas.com/api/courses/${courseId}/certificate`,
        {}
      )
      .subscribe({
        next: (res) => {
          window.open(res.data.downloadUrl, '_blank');
        },
        error: (err) => {
          alert(err.error?.message ?? 'Impossible de gÃ©nÃ©rer le certificat.');
        },
      });
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/compte/connexion']);
  }
}