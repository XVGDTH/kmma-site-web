import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/auth.service';
import { LiveSessionService } from '../../../shared/live-session.service';
import { DatePipe } from '@angular/common';

const API_URL = 'http://127.0.0.1:8000/api';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  completionRate: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
  averageGrade: number | null;
}

interface CourseStat {
  id: number;
  title: string;
  image: string;
  type: 'individual' | 'enterprise'; 
  enrolledCount: number;
  chaptersCount: number;
}

interface PendingSubmission {
  id: string;
  studentName: string;
  sequenceTitle: string;
  courseTitle: string;
  fileUrl: string | null;
  comment: string | null;
  submittedAt: string;
}

interface RecentEnrollment {
  studentName: string;
  courseTitle: string;
  enrolledAt: string;
}

@Component({
  selector: 'app-formateur-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe,],
   
  templateUrl: './formateur-dashboard.html',
  styleUrl: './formateur-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormateurDashboard implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly liveService = inject(LiveSessionService); 

  // ---- Infos formateur ----
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly instructorName = computed(() => this.currentUser()?.name?.trim() || 'Formateur');
  readonly instructorEmail = computed(() => this.currentUser()?.email ?? '');
  readonly instructorInitials = computed(() =>
    this.instructorName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p.charAt(0).toUpperCase())
      .join('')
  );
  readonly instructorAvatar = computed(() => this.currentUser()?.avatar ?? null);

  // ---- État ----
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
    // ✅ Signaux pour les avis et discussions
  readonly recentFeedbacks = signal<any[]>([]);
  readonly recentDiscussions = signal<any[]>([]);

    // ✅ Signaux pour les notifications et le chargement
  readonly toastMessage = signal<string | null>(null);
  readonly toastType = signal<'success' | 'error'>('success');
  readonly loadingCourseId = signal<number | null>(null);
  readonly upcomingSchedules = signal<any[]>([]);

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  // ✅ Mise à jour de startZoomSession
  startZoomSession(courseId: number): void {
    this.loadingCourseId.set(courseId);
    this.liveService.startSession(
      String(courseId),
      (hostUrl) => {
        this.loadingCourseId.set(null);
        this.showToast('Session Zoom lancée avec succès !');
        window.open(hostUrl, '_blank', 'noopener,noreferrer');
      },
      (error) => {
        this.loadingCourseId.set(null);
        this.showToast(error, 'error');
      }
    );
  }

    loadUpcomingSchedules(): void {
    // On suppose que tu as une route API qui renvoie TOUTES les séances à venir du formateur
    this.http.get<{ data: any[] }>(`${API_URL}/formateur/live/upcoming-schedules`)
      .subscribe({
        next: (res) => this.upcomingSchedules.set(res.data.slice(0, 3)),
        error: () => {}
      });
  }


  readonly stats = signal<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    completionRate: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
    averageGrade: null,
  });
  

  readonly courses = signal<CourseStat[]>([]);
  readonly pendingSubmissions = signal<PendingSubmission[]>([]);
  readonly upcomingLiveSessions = signal<any[]>([]);
  readonly recentEnrollments = signal<RecentEnrollment[]>([]);

  readonly gradingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
     this.loadUpcomingSchedules();
  }

  protected  loadDashboard(): void {
    this.isLoading.set(true);
    this.error.set(null);
    

    this.http.get<{ data: any }>(`${API_URL}/formateur/dashboard`).subscribe({
      next: (res) => {
        const data = res.data;
        this.stats.set(data.stats);
        this.courses.set(data.courses ?? []);
        this.pendingSubmissions.set(data.pendingSubmissions ?? []);
        this.upcomingLiveSessions.set(data.upcomingLiveSessions ?? []);
        this.recentEnrollments.set(data.recentEnrollments ?? []);
        this.isLoading.set(false);
        this.recentFeedbacks.set(data.recentFeedbacks ?? []);
        this.recentDiscussions.set(data.recentDiscussions ?? []);
      },
      error: (err) => {
        console.error('Erreur dashboard formateur', err);
        this.error.set('Impossible de charger le tableau de bord.');
        this.isLoading.set(false);
      },
    });
  }

  gradeSubmission(sub: PendingSubmission, grade: number, feedback: string): void {
    if (isNaN(grade) || grade < 0 || grade > 20) {
      alert('Note invalide (0 à 20).');
      return;
    }

    this.gradingId.set(sub.id);

    this.http.patch<{ message: string }>(`${API_URL}/formateur/submissions/${sub.id}`, {
      grade: Math.round(grade),
      instructor_feedback: feedback,
      status: 'corrige',
    }).subscribe({
      next: () => {
        this.pendingSubmissions.update(list => list.filter(s => s.id !== sub.id));
        this.stats.update(s => ({
          ...s,
          pendingSubmissions: s.pendingSubmissions - 1,
          gradedSubmissions: s.gradedSubmissions + 1,
        }));
        this.gradingId.set(null);
      },
      error: (err) => {
        alert(err?.error?.message ?? 'Erreur lors de la correction.');
        this.gradingId.set(null);
      },
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  assetUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const value = url.trim();
    if (!value) return null;

    // URL absolue → on garde
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    // /storage/... → on préfixe avec le domaine Laravel
    if (value.startsWith('/storage/')) {
      return `http://127.0.0.1:8000${value}`;
    }

    // storage/... → on préfixe avec le domaine + /
    if (value.startsWith('storage/')) {
      return `http://127.0.0.1:8000/${value}`;
    }

    // Chemin relatif → on ajoute /storage/
    const path = value.replace(/^\/+/, '');
    return `http://127.0.0.1:8000/storage/${path}`;
  }

  submissionFileUrl(sub: PendingSubmission): string | null {
    if (!sub.fileUrl) return null;
    if (sub.fileUrl.startsWith('http')) return sub.fileUrl;
    return `http://127.0.0.1:8000${sub.fileUrl}`;
  }

    readonly uploadingAvatar = signal(false);

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingAvatar.set(true);
    this.authService.updateAvatar(file).subscribe({
      next: () => {
        this.uploadingAvatar.set(false);
        alert('Photo de profil mise à jour !');
      },
      error: (err) => {
        this.uploadingAvatar.set(false);
        alert('Erreur lors de l\'upload de la photo.');
      }
    });
  }

  // ✅ Méthode pour démarrer une session Zoom
  // startZoomSession(courseId: number): void {
  //   this.liveService.startSession(
  //     String(courseId),
  //     (hostUrl) => {
  //       // Ouvre Zoom dans un nouvel onglet
  //       window.open(hostUrl, '_blank', 'noopener,noreferrer');
  //     },
  //     (error) => {
  //       alert(error);
  //     }
  //   );
  // }

    scheduleZoomSession(courseId: number): void {
    const dateStr = prompt("Entrez la date et l'heure (format: 2026-11-05 18:00) :");
    if (!dateStr) return;

    const scheduledAt = new Date(dateStr).toISOString();

    this.liveService.scheduleSession(courseId.toString(), scheduledAt).subscribe({
      next: () => alert('Session programmée avec succès !'),
      error: (err) => alert(err?.error?.message ?? 'Erreur lors de la programmation.'),
    });
  }
}
