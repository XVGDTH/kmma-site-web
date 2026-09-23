import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../shared/auth.service';
import { LiveSessionService } from '../../shared/live-session.service';
import { UpperCasePipe } from '@angular/common';

interface ResumeInfo {
  courseSlug: string;
  courseTitle: string;
  courseImage: string;
  sequenceId: string;
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

interface LiveInfo {
  courseSlug: string;
  courseTitle: string;
  roomName: string;
}

interface DeadlineInfo {
  courseSlug: string;
  courseTitle: string;
  sequenceId: string;
  title: string;
  kind: string;
}

@Component({
  selector: 'app-apprendre',
  standalone: true,
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './apprendre.html',
  styleUrl: './apprendre.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Apprendre {

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly liveService = inject(LiveSessionService);

  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  readonly userName = signal(
    this.auth.currentUser()?.name ?? 'Apprenant'
  );

  readonly loading = signal(true);
  readonly resume = signal<ResumeInfo | null>(null);
  readonly courses = signal<CourseCard[]>([]);
  readonly liveNow = signal<LiveInfo[]>([]);
  readonly deadlines = signal<DeadlineInfo[]>([]);
  readonly stats = signal({ coursesCount: 0, completedCount: 0 });

  constructor() {
    this.http
      .get<{ data: any }>(`${this.apiUrl}/my-dashboard`)
      .subscribe({
        next: (res) => {
          const d = res?.data;
          this.resume.set(d?.resume ?? null);
          this.courses.set(d?.courses ?? []);
          this.liveNow.set(d?.liveNow ?? []);
          this.deadlines.set(d?.deadlines ?? []);
          this.stats.set(d?.stats ?? { coursesCount: 0, completedCount: 0 });
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  /** ▶ Reprendre : ouvre le player directement sur la séquence. */
  openResume(): void {
    const r = this.resume();
    if (!r) return;
    this.router.navigate(['/apprentissage', r.courseSlug], {
      queryParams: { seq: r.sequenceId },
    });
  }

  /** 🔴 Rejoindre le live (le backend vérifie le niveau d'accès). */
  // joinLive(live: LiveInfo): void {
  //   this.liveService.getJoinRoom(
  //     live.courseSlug,
  //     (roomName) => window.open(`https://meet.jit.si/${roomName}`, '_blank'),
  //     (msg) => alert(msg),
  //   );
  // }

  joinLive(live: LiveInfo): void {
  this.liveService.getJoinUrl(
    live.courseSlug,
    (joinUrl, password) => {
      window.open(joinUrl, '_blank', 'noopener,noreferrer');

      if (password) {
        alert(`🔐 Mot de passe de la réunion : ${password}`);
      }
    },
    (msg) => alert(msg),
  );
}

    planLabel(level: number): string {
    const labels: Record<number, string> = {
      4: 'Entreprise',
      3: 'Premium',
      2: 'Standard',
      1: 'Basique',
    };

    return labels[level] ?? 'Aucune formule';
  }
}