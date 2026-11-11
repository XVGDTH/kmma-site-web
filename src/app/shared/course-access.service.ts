import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export interface CourseAccess {
  level: number;
  role: 'owner' | 'member' | null;
  licenseId: string | null;
  can: {
    course_content: boolean;
    certificate: boolean;
    live_sessions: boolean;
    assignment_review: boolean;
    coaching: boolean;
    team_management: boolean;
  };
}

export interface PlanInfo {
  id: string;
  name: string;
  level: number;
  price: number;
  badge?: string;
  features: string[];
  featured: boolean;
  isCurrent: boolean;
}

export interface MyPlanInfo {
  level: number;
  planName: string;
  allPlans: PlanInfo[];
}

export interface EvaluationItem {
  type: 'devoir' | 'quiz';
  id: string;
  sequenceId: string;
  title: string;
  kind: string;
  status: string;
  grade?: number | null;
  feedback?: string | null;
  submittedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CourseAccessService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  // ============================================================
  // DROITS D'ACCÈS
  // ============================================================
  readonly access = signal<CourseAccess>({
    level: 0,
    role: null,
    licenseId: null,
    can: {
      course_content: false,
      certificate: false,
      live_sessions: false,
      assignment_review: false,
      coaching: false,
      team_management: false,
    },
  });

  // ============================================================
  // FORMULE ACTUELLE
  // ============================================================
  readonly myPlan = signal<MyPlanInfo>({
    level: 0,
    planName: 'Aucune formule',
    allPlans: [],
  });

  // ============================================================
  // ÉVALUATIONS
  // ============================================================
  readonly evaluations = signal<EvaluationItem[]>([]);
  readonly averageGrade = signal<number | null>(null);

  // ============================================================
  // CHARGEMENT GLOBAL
  // ============================================================
  loadAccess(courseSlug: string): void {
    if (!courseSlug) return;

    // 1. Droits d'accès + rôle (owner/member)
    this.http
      .get<{ data: CourseAccess }>(
        `${this.apiUrl}/courses/${encodeURIComponent(courseSlug)}/access`
      )
      .subscribe({
        next: (res) => this.access.set(res.data),
        error: () => {},
      });

    // 2. Formule actuelle
    this.http
      .get<{ data: MyPlanInfo }>(
        `${this.apiUrl}/courses/${encodeURIComponent(courseSlug)}/my-plan`
      )
      .subscribe({
        next: (res) => this.myPlan.set(res.data),
        error: () => {},
      });

    // 3. Évaluations
    this.loadEvaluations(courseSlug);
  }

  // ============================================================
  // CHARGEMENT DES ÉVALUATIONS
  // ============================================================
  loadEvaluations(courseSlug: string): void {
    if (!courseSlug) return;

    this.http
      .get<{ data: { evaluations: EvaluationItem[]; average: number | null } }>(
        `${this.apiUrl}/courses/${encodeURIComponent(courseSlug)}/my-evaluations`
      )
      .subscribe({
        next: (res) => {
          this.evaluations.set(res.data?.evaluations ?? []);
          this.averageGrade.set(res.data?.average ?? null);
        },
        error: () => {},
      });
  }

  // ============================================================
  // TEST RAPIDE D'UNE FONCTIONNALITÉ
  // ============================================================
  can(feature: keyof CourseAccess['can']): boolean {
    return this.access().can[feature] ?? false;
  }
}