import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe, CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // ✅ Ajout de HttpClient

import { EnrollmentService } from '../../shared/enrollment.service';
import { toAbsoluteUrl } from '../../shared/formateur-content.service';
import { EnterpriseLicense, EntrepriseSubscriptionService } from '../../achats-entreprise/entreprise-subscription.service';

type Tab = 'cours' | 'certificats' | 'paiements' | 'maformule' | 'evaluations' | 'profil';

interface EnrollmentItem {
  courseId: string;
  progressPercent: number;
  enrolledAt: string;
  lastAccessedAt: string;
  certificateIssued: boolean;
  certificateUuid?: string;   // ✅ Ajout
  certificateType?: string;  
  courseTitle?: string;
  courseCategory?: string;
  courseImage?: string;
}


interface UserInfo {
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-student-space',
  standalone: true,
  imports: [RouterLink, DecimalPipe, CommonModule, DatePipe],
  templateUrl: './student-space.html',
  styleUrl: './student-space.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentSpace {


  private readonly subService = inject(EntrepriseSubscriptionService);

  private readonly router = inject(Router);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly http = inject(HttpClient); // ✅ Injection

  

  // ============================================================
  // INFOS DE L'APPRENANT
  // ============================================================
  private readonly user = signal<UserInfo | null>(this.readUser());

  readonly studentName = computed(() => this.user()?.name ?? 'Apprenant');
  readonly studentEmail = computed(() => this.user()?.email ?? '');

    // ✅ Expose la fonction pour les images
  readonly assetUrl = toAbsoluteUrl;
  
  // ✅ État pour le téléchargement du certificat
  readonly downloadingCert = signal<string | null>(null);

  // ✅ Signaux pour le formulaire de profil
readonly profileName = signal(this.studentName());
readonly profileEmail = signal(this.studentEmail());
readonly savingProfile = signal(false);
readonly profileSuccess = signal<string | null>(null);
readonly profileError = signal<string | null>(null);

// ✅ Méthode pour enregistrer le profil
saveProfile(): void {
  const name = this.profileName().trim();
  const email = this.profileEmail().trim();

  if (!name || !email) {
    this.profileError.set('Le nom et l\'email sont obligatoires.');
    return;
  }

  this.savingProfile.set(true);
  this.profileError.set(null);
  this.profileSuccess.set(null);

  this.http.patch<{ user: any }>('http://127.0.0.1:8000/api/auth/profile', {
    name,
    email,
  }).subscribe({
    next: (res) => {
      // Mise à jour du localStorage
      const user = res.user;
      localStorage.setItem('kmaa_user', JSON.stringify(user));
      
      // Mise à jour du signal local
      this.user.set(user);
      
      this.savingProfile.set(false);
      this.profileSuccess.set('Profil mis à jour avec succès !');
      
      // Efface le message après 3 secondes
      setTimeout(() => this.profileSuccess.set(null), 3000);
    },
    error: (err) => {
      this.savingProfile.set(false);
      this.profileError.set(
        err?.error?.message ?? 'Erreur lors de la mise à jour du profil.'
      );
    },
  });
}

// ✅ Méthode pour changer le mot de passe
changePassword(currentPassword: string, newPassword: string): void {
  if (!currentPassword || !newPassword) {
    this.profileError.set('Veuillez remplir tous les champs.');
    return;
  }
  if (newPassword.length < 6) {
    this.profileError.set('Le mot de passe doit contenir au moins 6 caractères.');
    return;
  }

  this.savingProfile.set(true);
  this.profileError.set(null);

  this.http.patch('http://127.0.0.1:8000/api/auth/password', {
    current_password: currentPassword,
    new_password: newPassword,
  }).subscribe({
    next: () => {
      this.savingProfile.set(false);
      this.profileSuccess.set('Mot de passe mis à jour !');
      setTimeout(() => this.profileSuccess.set(null), 3000);
    },
    error: (err) => {
      this.savingProfile.set(false);
      this.profileError.set(err?.error?.message ?? 'Erreur.');
    },
  });
}
  

  // ============================================================
  // ÉTAT
  // ============================================================
  readonly activeTab = signal<Tab>('cours');

  // ============================================================
  // les plans et évaluations sont gérés par CourseAccessService
  // ============================================================
    // ✅ NOUVEAU : Licences actives de l'utilisateur (pour l'onglet "Ma formule")
  readonly myLicenses = computed<EnterpriseLicense[]>(() =>
    this.subService.activeLicenses().filter(
      (lic: any) => lic.companyEmail === this.studentEmail()
    )
  );
    // ✅ NOUVEAU : Charger les évaluations pour tous les cours
  loadAllEvaluations(): void {
    const courses = this.allCourses();
    if (courses.length === 0) return;

    const allEvals: any[] = [];
    let totalGrade = 0;
    let gradeCount = 0;

    courses.forEach((course) => {
      this.http.get<{ data: { evaluations: any[]; average: number | null } }>(
        `http://127.0.0.1:8000/api/courses/${course.courseId}/my-evaluations`
      ).subscribe({
        next: (res) => {
          const evals = res.data?.evaluations ?? [];
          allEvals.push(...evals);
          
          if (res.data?.average !== null && res.data.average !== undefined) {
            totalGrade += res.data.average;
            gradeCount++;
          }

          this.evaluations.set([...allEvals]);
          this.averageGrade.set(gradeCount > 0 ? totalGrade / gradeCount : null);
        },
        error: () => {},
      });
    });
  }
    // ✅ NOUVEAU : État de visibilité du mot de passe
  readonly showPassword = signal<boolean>(false);

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  
  // ✅ NOUVEAU : Signal pour les paiements réels
  readonly orders = signal<any[]>([]);

  // ✅ NOUVEAU : Charge les paiements depuis l'API
  loadOrders(): void {
    this.http.get<{ data: any[] }>('http://127.0.0.1:8000/api/me/orders')
      .subscribe({
        next: (res) => this.orders.set(res.data ?? []),
        error: () => this.orders.set([]),
      });
  }


    // ✅ NOUVEAU : Évaluations de tous les cours
  readonly evaluations = signal<any[]>([]);
  readonly averageGrade = signal<number | null>(null);


 // ============================================================
  // INSCRIPTIONS
  // ============================================================
  readonly enrollments = computed<EnrollmentItem[]>(() =>
    this.enrollmentService.enrollments().map((e: any) => ({
      courseId: e.courseId,
      courseTitle: e.title ?? 'Cours ' + e.courseId,
      courseCategory: e.subject ?? 'Général',
      courseImage: e.image ?? 'assets/placeholder.jpg',
      progressPercent: e.progressPercent,
      enrolledAt: e.enrolledAt,
      lastAccessedAt: e.lastAccessedAt,
      certificateIssued: e.certificateIssued,
      // ✅ Récupération des nouveaux champs
      certificateUuid: e.certificateUuid,
      certificateType: e.certificateType,
    }))
  );

  // ============================================================
  // PAIEMENTS
  // ============================================================


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
  // MA FORMULE + ÉVALUATIONS
  // ============================================================
  readonly selectedCourseSlug = signal('');
  readonly myPlanLoaded = signal(false);

  selectCourseForPlan(courseSlug: string): void {
    this.selectedCourseSlug.set(courseSlug);
    this.myPlanLoaded.set(true);
  }
  // readonly evaluations = signal<any[]>([]);
  // readonly averageGrade = computed(() => null);

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
  // NOTIFICATIONS
  // ============================================================
  readonly notifService = {
    unreadCount: () => 0,
    load: () => {},
  };

    // ✅ NOUVEAU : Signal pour les licences entreprises
  readonly enterpriseLicenses = computed(() => this.subService.activeLicenses());
  // ✅ NOUVEAU : Détecte si l'utilisateur est propriétaire d'une licence
  readonly isLicenseOwner = computed(() => {
    const email = this.studentEmail();
    if (!email) return false;
    return this.enterpriseLicenses().some(
      (lic: any) => lic.companyEmail === email
    );
  });
  // ============================================================
  // CONSTRUCTEUR
  // ============================================================
  constructor() {
    this.enrollmentService.reload();
      this.subService.reload(); // ✅ Charge aussi les licences
          this.loadOrders(); // ✅ Charge les paiements
      // ✅ Charge les évaluations après un petit délai (le temps que les cours arrivent)
    setTimeout(() => this.loadAllEvaluations(), 1000);
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



  // ============================================================
  // CERTIFICAT
  // ============================================================
  generateCertificate(courseId: string, certificateUuid?: string): void {
    // Si on n'a pas l'UUID, c'est que le certificat n'est pas encore prêt
    if (!certificateUuid) {
      alert("Le certificat n'est pas encore disponible. Assurez-vous d'avoir validé tous les quiz du cours.");
      return;
    }

    if (this.downloadingCert() === courseId) return;
    this.downloadingCert.set(courseId);

    // ✅ Utilise la route publique de ton backend
    this.http.get(`http://127.0.0.1:8000/api/certificates/${certificateUuid}/download`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `KMAA_Certificat_${courseId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.downloadingCert.set(null);
      },
      error: (err) => {
        console.error('Erreur téléchargement certificat', err);
        alert("Impossible de télécharger le certificat. Vérifiez que vous avez terminé le cours à 100%.");
        this.downloadingCert.set(null);
      }
    });
  }


  // ============================================================
  // DÉCONNEXION
  // ============================================================
  logout(): void {
    this.userMenuOpen.set(false);
    try {
      localStorage.clear();
      this.enrollmentService.clear();
    } catch { /* ignore */ }
    
    this.router.navigate(['/compte/connexion']);
  }

    // ✅ NOUVEAU : Fusionner les cours et les licences pour l'affichage
  readonly allCourses = computed(() => {
    const individual = this.enrollments();
    const enterprise = this.enterpriseLicenses().map((lic: any) => ({
      courseId: lic.courseSlug || lic.courseId,
      courseTitle: lic.courseTitle,
      courseCategory: 'Entreprise',
      courseImage: lic.courseImage,
      progressPercent: 0, // On pourra calculer plus tard
      enrolledAt: lic.purchasedAt,
      lastAccessedAt: 'Jamais',
      certificateIssued: false,
      isEnterprise: true,
    }));
    return [...individual, ...enterprise];
  });
}
  
