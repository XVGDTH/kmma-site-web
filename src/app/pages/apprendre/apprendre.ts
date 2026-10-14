// import {
//   ChangeDetectionStrategy,
//   Component,
//   computed,
//   inject,
//   signal,
// } from '@angular/core';
// import { Router, RouterLink } from '@angular/router';
// import { UpperCasePipe } from '@angular/common';

// // ✅ Service local (simulation, aucune API)
// import { EnrollmentService } from '../../shared/enrollment.service';

// interface ResumeInfo {
//   courseSlug: string;
//   courseTitle: string;
//   courseImage: string;
//   sequenceId: string;
//   sequenceTitle: string;
//   chapterTitle: string;
//   progressPercent: number;
// }

// interface CourseCard {
//   slug: string;
//   title: string;
//   image: string;
//   category: string;
//   progressPercent: number;
//   accessLevel: number;
//   lastAccessedAt: string;
// }

// interface LiveInfo {
//   courseSlug: string;
//   courseTitle: string;
//   roomName: string;
// }

// interface DeadlineInfo {
//   courseSlug: string;
//   courseTitle: string;
//   sequenceId: string;
//   title: string;
//   kind: string;
// }

// interface UserInfo {
//   name: string;
//   email: string;
//   role: string;
// }

// @Component({
//   selector: 'app-apprendre',
//   standalone: true,
//   imports: [RouterLink, UpperCasePipe],
//   templateUrl: './apprendre.html',
//   styleUrl: './apprendre.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class Apprendre {

//   private readonly router = inject(Router);
//   private readonly enrollmentService = inject(EnrollmentService);

//   // ============================================================
//   // UTILISATEUR
//   // ============================================================
//   private readonly user = signal<UserInfo | null>(this.readUser());
//   readonly userName = computed(() => this.user()?.name ?? 'Apprenant');

//   // ============================================================
//   // ÉTAT
//   // ============================================================
//   readonly loading = signal(false);
//   readonly resume = signal<ResumeInfo | null>(null);
//   readonly courses = signal<CourseCard[]>([]);
//   readonly liveNow = signal<LiveInfo[]>([]);
//   readonly deadlines = signal<DeadlineInfo[]>([]);
//   readonly stats = signal({ coursesCount: 0, completedCount: 0 });

//   // ============================================================
//   // CONSTRUCTEUR — chargement depuis localStorage
//   // ============================================================
//   constructor() {
//     this.enrollmentService.reload();
//     this.hydrate();
//   }

//   private hydrate(): void {
//     const list = this.enrollmentService.enrollments();

//     // ---- Cours en cours ----
//     this.courses.set(
//       list.map((e) => ({
//         slug: String(e.courseId),
//         title: e.title,
//         image: e.image,
//         category: e.subject,
//         progressPercent: e.progressPercent,
//         accessLevel: 2, // Formule Standard par défaut (simulation)
//         lastAccessedAt: this.formatDate(e.lastAccessedAt),
//       }))
//     );

//     // ---- Statistiques ----
//     const inProgress = list.filter((e) => e.progressPercent < 100);
//     this.stats.set({
//       coursesCount: inProgress.length,
//       completedCount: list.filter((e) => e.progressPercent >= 100).length,
//     });

//     // ---- Reprendre (premier cours non terminé) ----
//     if (inProgress.length > 0) {
//       const c = inProgress[0];
//       this.resume.set({
//         courseSlug: String(c.courseId),
//         courseTitle: c.title,
//         courseImage: c.image,
//         sequenceId: '1',
//         sequenceTitle: 'Reprendre le cours',
//         chapterTitle: c.subject,
//         progressPercent: c.progressPercent,
//       });
//     }

//     // ---- Live : vide pour l'instant ----
//     this.liveNow.set([]);

//     // ---- Deadlines : vide pour l'instant ----
//     this.deadlines.set([]);
//   }

//   // ============================================================
//   // HELPERS
//   // ============================================================
//   private readUser(): UserInfo | null {
//     try {
//       const raw = localStorage.getItem('kmaa_user');
//       return raw ? JSON.parse(raw) : null;
//     } catch {
//       return null;
//     }
//   }

//   private formatDate(iso: string): string {
//     try {
//       return new Date(iso).toLocaleDateString('fr-FR', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       });
//     } catch {
//       return iso;
//     }
//   }

//   formatPrice(amount: number): string {
//     return amount.toLocaleString('fr-FR') + ' FCFA';
//   }

//   planLabel(level: number): string {
//     const labels: Record<number, string> = {
//       4: 'Entreprise',
//       3: 'Premium',
//       2: 'Standard',
//       1: 'Basique',
//     };
//     return labels[level] ?? 'Aucune formule';
//   }

//   // ============================================================
//   // ACTIONS
//   // ============================================================
//   openResume(): void {
//     const r = this.resume();
//     if (!r) return;
//     this.router.navigate(['/apprentissage', r.courseSlug], {
//       queryParams: { seq: r.sequenceId },
//     });
//   }

//   joinLive(live: LiveInfo): void {
//     alert(
//       `🔴 Simulation : la séance live du cours "${live.courseTitle}" serait rejointe ici.\n` +
//       `Plus tard, un appel API sera branché pour générer le vrai lien.`
//     );
//   }
// }




import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
// import { DecimalPipe } from '@angular/common';

import { EnrollmentService } from '../../shared/enrollment.service';
import { LearningStatsService } from '../../shared/learning-stats.service';

interface UserInfo { name: string; email: string; role: string; }

interface ResumeInfo {
  courseSlug: string;
  courseTitle: string;
  courseImage: string;
  sequenceTitle: string;
  chapterTitle: string;
  progressPercent: number;
}

interface CourseCard {
  slug: string;
  title: string;
  image: string;
  category: string;
  progressPercent: number;
  accessLevel: number;
  lastAccessedAt: string;
}

interface LiveInfo { courseSlug: string; courseTitle: string; roomName: string; }
interface DeadlineInfo {
  courseSlug: string;
  courseTitle: string;
  sequenceId: string;
  title: string;
  kind: string;
}

type Tab = 'overview' | 'progress' | 'objectives' | 'journal';

@Component({
  selector: 'app-apprendre',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './apprendre.html',
  styleUrl: './apprendre.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Apprendre {

  private readonly router = inject(Router);
  private readonly enrollmentService = inject(EnrollmentService);
  readonly stats = inject(LearningStatsService);

  // ============================================================
  // UTILISATEUR
  // ============================================================
  private readonly user = signal<UserInfo | null>(this.readUser());
  readonly userName = computed(() => {
    const u = this.user();
    if (!u?.name) return 'Apprenant';
    // Formatage propre : "salomonbationo45" → "Salomon Bationo"
    return this.formatName(u.name);
  });

  readonly userEmail = computed(() => this.user()?.email ?? '');

  // ============================================================
  // ONGLETS
  // ============================================================
  readonly activeTab = signal<Tab>('overview');

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  // ============================================================
  // ÉTAT COURS
  // ============================================================
  readonly loading = signal(false);
  readonly resume = signal<ResumeInfo | null>(null);
  readonly courses = signal<CourseCard[]>([]);
  readonly liveNow = signal<LiveInfo[]>([]);
  readonly deadlines = signal<DeadlineInfo[]>([]);
  readonly enrollmentStats = signal({ coursesCount: 0, completedCount: 0 });

  // ============================================================
  // CONSTRUCTEUR
  // ============================================================
  constructor() {
    this.enrollmentService.reload();
    this.hydrate();
  }

  // ============================================================
  // HYDRATATION
  // ============================================================
  private hydrate(): void {
    const list = this.enrollmentService.enrollments();

    this.courses.set(
      list.map((e) => ({
        slug: String(e.courseId),
        title: e.title,
        image: e.image,
        category: e.subject,
        progressPercent: e.progressPercent,
        accessLevel: 2,
        lastAccessedAt: this.formatDate(e.lastAccessedAt),
      }))
    );

    const inProgress = list.filter((e) => e.progressPercent < 100);
    this.enrollmentStats.set({
      coursesCount: inProgress.length,
      completedCount: list.filter((e) => e.progressPercent >= 100).length,
    });

    if (inProgress.length > 0) {
      const c = inProgress[0];
      this.resume.set({
        courseSlug: String(c.courseId),
        courseTitle: c.title,
        courseImage: c.image,
        sequenceTitle: 'Reprendre la formation',
        chapterTitle: c.subject,
        progressPercent: c.progressPercent,
      });
    }

    this.liveNow.set([]);
    this.deadlines.set([]);
  }

  // ============================================================
  // HELPERS
  // ============================================================
  private readUser(): UserInfo | null {
    try {
      const raw = localStorage.getItem('kmaa_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private formatName(raw: string): string {
    // "salomonbationo45" → "Salomonbationo45" (capitalise la 1re lettre)
    // Si contient un point ou tiret, on garde tel quel
    if (!raw) return 'Apprenant';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  private formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return iso; }
  }

  planLabel(level: number): string {
    const labels: Record<number, string> = {
      4: 'Entreprise', 3: 'Premium', 2: 'Standard', 1: 'Basique',
    };
    return labels[level] ?? 'Aucune formule';
  }

  // ============================================================
  // ACTIONS
  // ============================================================
  openResume(): void {
    const r = this.resume();
    if (!r) return;
    this.router.navigate(['/apprentissage', r.courseSlug]);
  }

  joinLive(live: LiveInfo): void {
    alert(
      `Simulation : la séance "${live.courseTitle}" serait rejointe ici.`
    );
  }

  // ============================================================
  // STATS
  // ============================================================
  barHeight(minutes: number): string {
    const max = this.stats.maxWeeklyMinutes();
    return Math.round((minutes / max) * 100) + '%';
  }

  competencyPercent(hours: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((hours / target) * 100));
  }

  objectivePercent(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  }

  // ============================================================
  // COMPTEURS POUR L'EN-TÊTE
  // ============================================================
  readonly totalProgressPercent = computed(() => {
    const courses = this.courses();
    if (courses.length === 0) return 0;
    const sum = courses.reduce((acc, c) => acc + c.progressPercent, 0);
    return Math.round(sum / courses.length);
  });
}