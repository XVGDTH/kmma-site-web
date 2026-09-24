import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export interface CourseAccess {
  level: number;
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

// ============================================================
// ðŸ† Ã‰VALUATIONS (devoirs notÃ©s + quiz de l'apprenant)
// ============================================================

export interface EvaluationItem {
  type: 'devoir' | 'quiz';
  id: string;
  sequenceId: string;
  title: string;
  kind: string;
  status: string;        // soumis|corrige|retourne|reussi
  grade?: number | null;
  feedback?: string | null;
  submittedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CourseAccessService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.convergesas.com/api';

  // ============================================================
  // DROITS D'ACCÃˆS
  // ============================================================

  readonly access = signal<CourseAccess>({
    level: 0,
    can: {
      course_content: false, certificate: false, live_sessions: false,
      assignment_review: false, coaching: false, team_management: false,
    },
  });

  // ============================================================
  // FORMULE ACTUELLE + COMPARATIF
  // ============================================================

  readonly myPlan = signal<MyPlanInfo>({
    level: 0,
    planName: 'Aucune formule',
    allPlans: [],
  });

  // ============================================================
  // ðŸ† MES Ã‰VALUATIONS (devoirs notÃ©s + quiz)
  // ============================================================

  readonly evaluations = signal<EvaluationItem[]>([]);
  readonly averageGrade = signal<number | null>(null);

  // ============================================================
  // CHARGEMENT GLOBAL (appelÃ© par le player ET l'espace Ã©tudiant)
  // ============================================================

  loadAccess(courseSlug: string): void {
    if (!courseSlug) return;

    // ----------------------------------------------------------
    // 1. Droits d'accÃ¨s
    // ----------------------------------------------------------

    this.http
      .get<{ data: CourseAccess }>(
        `${this.apiUrl}/courses/${encodeURIComponent(courseSlug)}/access`
      )
      .subscribe({
        next: (res) => this.access.set(res.data),
        error: () => {},
      });

    // ----------------------------------------------------------
    // 2. Formule actuelle + toutes les formules (comparatif)
    // ----------------------------------------------------------

    this.http
      .get<{ data: MyPlanInfo }>(
        `${this.apiUrl}/courses/${encodeURIComponent(courseSlug)}/my-plan`
      )
      .subscribe({
        next: (res) => this.myPlan.set(res.data),
        error: () => {},
      });

    // ----------------------------------------------------------
    // 3. âœ… MES Ã‰VALUATIONS â€” C'EST ICI QU'IL VAIT !
    //    (notes de devoirs + quiz, moyenne)
    // ----------------------------------------------------------

    this.loadEvaluations(courseSlug);
  }

  // ============================================================
  // ðŸ† CHARGEMENT DES Ã‰VALUATIONS
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
  // TEST RAPIDE D'UNE FONCTIONNALITÃ‰
  // ============================================================

  can(feature: keyof CourseAccess['can']): boolean {
    return this.access().can[feature] ?? false;
  }
}