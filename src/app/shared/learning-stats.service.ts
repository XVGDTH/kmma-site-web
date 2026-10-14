import { Injectable, computed, signal } from '@angular/core';

export interface CompetencyProgress {
  id: string;
  label: string;
  hours: number;
  target: number;
  completed: boolean;
}

export interface MonthlyActivity {
  month: string;
  daysActive: number;
  hours: number;
}

export interface LearningObjective {
  id: string;
  label: string;
  description: string;
  targetHours: number;
  currentHours: number;
  deadline: string;   // ISO
  completed: boolean;
}

export interface LearningJournalEntry {
  id: string;
  date: string;
  activity: string;      // "Module 3 — Analyse financière"
  course: string;        // "Finance d'entreprise"
  durationMinutes: number;
  type: 'lecture' | 'quiz' | 'exercice' | 'projet';
}

export interface LearningStatsState {
  totalHours: number;
  hoursThisMonth: number;
  daysActiveThisMonth: number;
  completedCourses: number;
  ongoingCourses: number;
  certificatesEarned: number;
  competencies: CompetencyProgress[];
  monthlyActivity: MonthlyActivity[];
  objectives: LearningObjective[];
  journal: LearningJournalEntry[];
}

@Injectable({ providedIn: 'root' })
export class LearningStatsService {

  private readonly STORAGE_KEY = 'kmaa_learning_stats';

  readonly state = signal<LearningStatsState>(this.loadFromStorage());

  // ============================================================
  // COMPUTED
  // ============================================================
  readonly totalHours = computed(() => this.state().totalHours);
  readonly hoursThisMonth = computed(() => this.state().hoursThisMonth);
  readonly daysActiveThisMonth = computed(() => this.state().daysActiveThisMonth);
  readonly completedCourses = computed(() => this.state().completedCourses);
  readonly ongoingCourses = computed(() => this.state().ongoingCourses);
  readonly certificatesEarned = computed(() => this.state().certificatesEarned);
  readonly competencies = computed(() => this.state().competencies);
  readonly objectives = computed(() => this.state().objectives);
  readonly recentJournal = computed(() => this.state().journal.slice(0, 6));

  // Objectif du mois (heures)
  readonly monthlyGoalHours = computed(() => 40); // 40h / mois par défaut

  readonly monthlyProgressPercent = computed(() => {
    const goal = this.monthlyGoalHours();
    if (goal <= 0) return 100;
    return Math.min(100, Math.round((this.hoursThisMonth() / goal) * 100));
  });

  // Semaine d'activité (Lun-Dim)
  readonly weeklyActivity = computed(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    // Simulation : distribution basée sur le journal
    const journal = this.state().journal;
    return days.map((day, index) => {
      const today = new Date();
      const target = new Date(today);
      const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
      const offset = dayIndex - index;
      target.setDate(today.getDate() - offset);
      const iso = target.toISOString().split('T')[0];

      const minutes = journal
        .filter((j) => j.date.split('T')[0] === iso)
        .reduce((sum, j) => sum + j.durationMinutes, 0);

      return { day, minutes };
    });
  });

  readonly maxWeeklyMinutes = computed(() => {
    const max = Math.max(...this.weeklyActivity().map((d) => d.minutes));
    return max > 0 ? max : 60;
  });

  // ============================================================
  // ACTIONS
  // ============================================================
  addJournalEntry(entry: Omit<LearningJournalEntry, 'id'>): void {
    const current = this.state();
    const newEntry: LearningJournalEntry = {
      ...entry,
      id: 'j_' + Date.now().toString(36),
    };

    const minutes = entry.durationMinutes;
    const hours = minutes / 60;

    this.state.set({
      ...current,
      totalHours: Math.round((current.totalHours + hours) * 10) / 10,
      hoursThisMonth: Math.round((current.hoursThisMonth + hours) * 10) / 10,
      journal: [newEntry, ...current.journal].slice(0, 50),
    });

    this.persist();
  }

  completeObjective(id: string): void {
    const current = this.state();
    this.state.set({
      ...current,
      objectives: current.objectives.map((o) =>
        o.id === id ? { ...o, completed: true, currentHours: o.targetHours } : o
      ),
    });
    this.persist();
  }

  updateObjectiveProgress(id: string, hours: number): void {
    const current = this.state();
    this.state.set({
      ...current,
      objectives: current.objectives.map((o) =>
        o.id === id
          ? {
              ...o,
              currentHours: Math.min(hours, o.targetHours),
              completed: hours >= o.targetHours,
            }
          : o
      ),
    });
    this.persist();
  }

  // ============================================================
  // HELPERS
  // ============================================================
  formatHours(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
  }

  formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  formatRelative(iso: string): string {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
      if (diffMin < 1) return "à l'instant";
      if (diffMin < 60) return `il y a ${diffMin} min`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return `il y a ${diffH}h`;
      const diffD = Math.floor(diffH / 24);
      if (diffD < 7) return `il y a ${diffD}j`;
      return this.formatDate(iso);
    } catch {
      return iso;
    }
  }

  // ============================================================
  // PERSISTANCE
  // ============================================================
  private loadFromStorage(): LearningStatsState {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }

    // Données de démo professionnelles
    const today = new Date();
    const isoDaysAgo = (days: number): string => {
      const d = new Date(today);
      d.setDate(d.getDate() - days);
      return d.toISOString();
    };

    return {
      totalHours: 47.5,
      hoursThisMonth: 12.5,
      daysActiveThisMonth: 9,
      completedCourses: 2,
      ongoingCourses: 2,
      certificatesEarned: 1,

      competencies: [
        { id: 'audit', label: 'Audit & Contrôle interne', hours: 18, target: 30, completed: false },
        { id: 'finance', label: 'Analyse financière', hours: 12, target: 20, completed: false },
        { id: 'fiscal', label: 'Fiscalité des entreprises', hours: 10, target: 25, completed: false },
        { id: 'data', label: 'Data & Outils analytiques', hours: 7.5, target: 15, completed: false },
      ],

      monthlyActivity: [
        { month: 'Juin',    daysActive: 14, hours: 22 },
        { month: 'Juillet', daysActive: 11, hours: 18 },
        { month: 'Août',    daysActive: 8,  hours: 12 },
        { month: 'Septembre', daysActive: 16, hours: 25 },
        { month: 'Octobre', daysActive: 9,  hours: 12.5 },
      ],

      objectives: [
        {
          id: 'obj_1',
          label: 'Finaliser le module Audit interne',
          description: 'Terminer les 4 chapitres et réussir le quiz final',
          targetHours: 12,
          currentHours: 8,
          deadline: isoDaysAgo(-15),
          completed: false,
        },
        {
          id: 'obj_2',
          label: 'Obtenir la certification Fiscalité',
          description: 'Compléter le parcours et passer l\'examen',
          targetHours: 25,
          currentHours: 10,
          deadline: isoDaysAgo(-30),
          completed: false,
        },
      ],

      journal: [
        {
          id: 'j_1',
          date: isoDaysAgo(0),
          activity: 'Normes IFRS — IAS 16 Immobilisations',
          course: 'Consolidation des comptes et normes IFRS',
          durationMinutes: 45,
          type: 'lecture',
        },
        {
          id: 'j_2',
          date: isoDaysAgo(1),
          activity: 'Quiz — Analyse du cycle achats-ventes',
          course: 'Audit interne avancé',
          durationMinutes: 25,
          type: 'quiz',
        },
        {
          id: 'j_3',
          date: isoDaysAgo(2),
          activity: 'Étude de cas — Consolidation groupe familial',
          course: 'Consolidation des comptes et normes IFRS',
          durationMinutes: 60,
          type: 'projet',
        },
        {
          id: 'j_4',
          date: isoDaysAgo(3),
          activity: 'Fiscalité internationale — Prix de transfert',
          course: 'Fiscalité des entreprises',
          durationMinutes: 40,
          type: 'lecture',
        },
        {
          id: 'j_5',
          date: isoDaysAgo(5),
          activity: 'Exercice — Calcul du résultat fiscal',
          course: 'Fiscalité des entreprises',
          durationMinutes: 35,
          type: 'exercice',
        },
      ],
    };
  }

  private persist(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state()));
    } catch { /* ignore */ }
  }

  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.state.set(this.loadFromStorage());
  }
}