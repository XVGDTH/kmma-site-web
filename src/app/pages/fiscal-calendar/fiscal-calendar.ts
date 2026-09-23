import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  signal,
} from '@angular/core';

type TaxRegime = 'RNI' | 'RSI' | 'CME' | 'CSE' | 'RND';

type FiscalProfile =
  | 'entreprise'
  | 'entrepreneur'
  | 'liberal'
  | 'association'
  | 'particulier'
  | 'expert';

type TaxCategory =
  | 'declaration'
  | 'paiement'
  | 'tva'
  | 'retenue'
  | 'social'
  | 'entreprise'
  | 'audit';

type DeadlinePriority = 'low' | 'medium' | 'high' | 'critical';

type DeadlineStatus = 'upcoming' | 'completed' | 'overdue';

type CalendarView = 'calendar' | 'list' | 'timeline';

interface TaxDeadline {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  date: string;

  category: TaxCategory;

  regimes: TaxRegime[] | 'all';

  priority: DeadlinePriority;

  documents?: string[];

  amountLabel?: string;

  verified: boolean;

  sourceLabel?: string;
  sourceUrl?: string;

  demo?: boolean;
}

interface CalendarDay {
  date: Date;
  key: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

interface CategoryOption {
  id: 'all' | TaxCategory;
  label: string;
}

@Component({
  selector: 'app-fiscal-calendar',
  standalone: true,
  imports: [],
  templateUrl: './fiscal-calendar.html',
  styleUrl: './fiscal-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiscalCalendar implements OnDestroy {
  /* =========================================================
   * ÉTAT GLOBAL
   * ========================================================= */

  readonly now = signal(new Date());

  readonly selectedYear = signal(2026);

  readonly selectedMonth = signal(8); // septembre = 8

  readonly selectedDate = signal('2026-09-04');

  readonly selectedRegime = signal<TaxRegime | 'all'>('RNI');

  readonly selectedProfile = signal<FiscalProfile>('entreprise');

  readonly selectedCategory = signal<'all' | TaxCategory>('all');

  readonly selectedStatus = signal<'all' | DeadlineStatus>('all');

  readonly searchTerm = signal('');

  readonly currentView = signal<CalendarView>('calendar');

  readonly completedIds = signal<Set<string>>(new Set());

  readonly reminderIds = signal<Set<string>>(new Set());

  readonly favoriteIds = signal<Set<string>>(new Set());

  private clockInterval?: ReturnType<typeof setInterval>;

  /* =========================================================
   * CONFIGURATION
   * ========================================================= */

  readonly years = [2026, 2027, 2028];

  readonly regimes: { id: TaxRegime | 'all'; label: string }[] = [
    { id: 'all', label: 'Tous les régimes' },
    { id: 'RNI', label: 'RNI' },
    { id: 'RSI', label: 'RSI' },
    { id: 'CME', label: 'CME' },
    { id: 'CSE', label: 'CSE' },
    { id: 'RND', label: 'RND' },
  ];

  readonly profiles: { id: FiscalProfile; label: string }[] = [
    {
      id: 'entreprise',
      label: 'Entreprise',
    },
    {
      id: 'entrepreneur',
      label: 'Entrepreneur',
    },
    {
      id: 'liberal',
      label: 'Profession libérale',
    },
    {
      id: 'association',
      label: 'Association / ONG',
    },
    {
      id: 'particulier',
      label: 'Particulier',
    },
    {
      id: 'expert',
      label: 'Comptable / Expert-comptable',
    },
  ];

  readonly categories: CategoryOption[] = [
    {
      id: 'all',
      label: 'Toutes',
    },
    {
      id: 'declaration',
      label: 'Déclarations',
    },
    {
      id: 'paiement',
      label: 'Paiements',
    },
    {
      id: 'tva',
      label: 'TVA',
    },
    {
      id: 'retenue',
      label: 'Retenues',
    },
    {
      id: 'social',
      label: 'Social',
    },
    {
      id: 'entreprise',
      label: 'Entreprise',
    },
    {
      id: 'audit',
      label: 'Audit',
    },
  ];

  readonly weekDays = [
    'Lun',
    'Mar',
    'Mer',
    'Jeu',
    'Ven',
    'Sam',
    'Dim',
  ];

  readonly monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  /* =========================================================
   * DONNÉES FISCALES
   *
   * IMPORTANT :
   * Ces données servent de démonstration fonctionnelle.
   * Remplace les dates par tes données fiscales officielles.
   * ========================================================= */

  readonly deadlines: TaxDeadline[] = [
    {
      id: 'fiscal-001',
      title: 'Déclaration périodique des obligations fiscales',
      shortTitle: 'Déclaration périodique',
      description:
        'Préparer et vérifier les éléments nécessaires à la déclaration fiscale périodique de l’entreprise.',
      date: '2026-09-11',
      category: 'declaration',
      regimes: ['RNI'],
      priority: 'critical',
      documents: [
        'Pièces comptables',
        'Journal des opérations',
        'États récapitulatifs',
      ],
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-002',
      title: 'Contrôle des retenues à la source',
      shortTitle: 'Retenues à la source',
      description:
        'Vérifier les retenues effectuées et préparer les justificatifs associés.',
      date: '2026-09-15',
      category: 'retenue',
      regimes: ['RNI', 'RSI'],
      priority: 'high',
      documents: [
        'Factures fournisseurs',
        'Bordereaux de retenue',
        'Justificatifs de paiement',
      ],
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-003',
      title: 'Préparation du dossier TVA',
      shortTitle: 'Dossier TVA',
      description:
        'Centraliser les pièces nécessaires au suivi et au contrôle de la TVA.',
      date: '2026-09-18',
      category: 'tva',
      regimes: ['RNI', 'RSI'],
      priority: 'high',
      documents: [
        'Factures de ventes',
        'Factures fournisseurs',
        'Livre de TVA',
      ],
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-004',
      title: 'Révision des pièces comptables',
      shortTitle: 'Révision comptable',
      description:
        'Contrôler la cohérence des pièces comptables avant la clôture périodique.',
      date: '2026-09-22',
      category: 'audit',
      regimes: ['RNI', 'RSI'],
      priority: 'medium',
      documents: [
        'Grand livre',
        'Balance',
        'Pièces justificatives',
      ],
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-005',
      title: 'Paiement fiscal périodique',
      shortTitle: 'Paiement fiscal',
      description:
        'Préparer les montants et justificatifs relatifs aux paiements fiscaux de la période.',
      date: '2026-09-25',
      category: 'paiement',
      regimes: ['RNI', 'RSI'],
      priority: 'critical',
      amountLabel: 'Montant selon déclaration',
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-006',
      title: 'Contrôle social et déclaratif',
      shortTitle: 'Obligations sociales',
      description:
        'Contrôler la cohérence des éléments sociaux et des déclarations associées.',
      date: '2026-09-28',
      category: 'social',
      regimes: 'all',
      priority: 'medium',
      documents: [
        'État du personnel',
        'Bulletins de paie',
        'Déclarations sociales',
      ],
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-007',
      title: 'Clôture fiscale mensuelle',
      shortTitle: 'Clôture mensuelle',
      description:
        'Finaliser le contrôle fiscal et comptable de la période avant archivage.',
      date: '2026-09-30',
      category: 'entreprise',
      regimes: ['RNI'],
      priority: 'high',
      documents: [
        'Balance générale',
        'Grand livre',
        'Justificatifs',
      ],
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-008',
      title: 'Préparation du trimestre fiscal',
      shortTitle: 'Préparation trimestrielle',
      description:
        'Préparer les éléments nécessaires au contrôle des obligations trimestrielles.',
      date: '2026-10-05',
      category: 'declaration',
      regimes: ['RSI'],
      priority: 'medium',
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-009',
      title: 'Audit interne des obligations fiscales',
      shortTitle: 'Audit fiscal',
      description:
        'Effectuer une revue interne des obligations, pièces et justificatifs disponibles.',
      date: '2026-10-12',
      category: 'audit',
      regimes: ['RNI', 'RSI'],
      priority: 'medium',
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-010',
      title: 'Revue documentaire fiscale',
      shortTitle: 'Revue documentaire',
      description:
        'Vérifier l’archivage et la conformité documentaire avant les prochaines échéances.',
      date: '2026-10-20',
      category: 'entreprise',
      regimes: 'all',
      priority: 'low',
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-011',
      title: 'Préparation des obligations de fin d’année',
      shortTitle: 'Préparation annuelle',
      description:
        'Anticiper les travaux fiscaux et comptables nécessaires à la clôture annuelle.',
      date: '2026-11-20',
      category: 'entreprise',
      regimes: ['RNI', 'RSI'],
      priority: 'high',
      verified: false,
      demo: true,
    },

    {
      id: 'fiscal-012',
      title: 'Contrôle préalable à la clôture annuelle',
      shortTitle: 'Pré-clôture',
      description:
        'Effectuer une revue générale avant les opérations de clôture fiscale et comptable.',
      date: '2026-12-15',
      category: 'audit',
      regimes: ['RNI', 'RSI'],
      priority: 'critical',
      verified: false,
      demo: true,
    },
  ];

  /* =========================================================
   * INITIALISATION
   * ========================================================= */

  constructor() {
    this.restoreLocalState();

    this.clockInterval = setInterval(() => {
      this.now.set(new Date());
    }, 30_000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  /* =========================================================
   * COMPUTED — PROFIL
   * ========================================================= */

  readonly profileDeadlines = computed(() => {
    const regime = this.selectedRegime();

    return this.deadlines.filter((deadline) => {
      if (regime === 'all') {
        return true;
      }

      return (
        deadline.regimes === 'all' ||
        deadline.regimes.includes(regime)
      );
    });
  });

  readonly filteredDeadlines = computed(() => {
    const category = this.selectedCategory();
    const status = this.selectedStatus();
    const term = this.searchTerm().trim().toLowerCase();

    return this.profileDeadlines().filter((deadline) => {
      const categoryMatch =
        category === 'all' ||
        deadline.category === category;

      const statusMatch =
        status === 'all' ||
        this.deadlineStatus(deadline) === status;

      const text =
        `${deadline.title} ${deadline.description} ${deadline.shortTitle}`.toLowerCase();

      const searchMatch =
        !term ||
        text.includes(term);

      return (
        categoryMatch &&
        statusMatch &&
        searchMatch
      );
    });
  });

  /* =========================================================
   * KPIs
   * ========================================================= */

  readonly totalObligations = computed(
    () => this.profileDeadlines().length
  );

  readonly completedCount = computed(
    () =>
      this.profileDeadlines().filter((deadline) =>
        this.completedIds().has(deadline.id)
      ).length
  );

  readonly overdueCount = computed(
    () =>
      this.profileDeadlines().filter(
        (deadline) =>
          this.deadlineStatus(deadline) === 'overdue'
      ).length
  );

  readonly upcomingCount = computed(
    () =>
      this.profileDeadlines().filter(
        (deadline) =>
          this.deadlineStatus(deadline) === 'upcoming'
      ).length
  );

  readonly urgentCount = computed(
    () =>
      this.profileDeadlines().filter((deadline) => {
        if (
          this.deadlineStatus(deadline) !== 'upcoming'
        ) {
          return false;
        }

        return (
          deadline.priority === 'critical' ||
          this.daysUntil(deadline.date) <= 7
        );
      }).length
  );

  readonly complianceScore = computed(() => {
    const total = this.totalObligations();

    if (total === 0) {
      return 100;
    }

    const completed = this.completedCount();
    const overdue = this.overdueCount();

    const completedPart =
      (completed / total) * 100;

    const overduePenalty =
      (overdue / total) * 30;

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          55 +
            completedPart * 0.45 -
            overduePenalty
        )
      )
    );
  });

  readonly scoreLabel = computed(() => {
    const score = this.complianceScore();

    if (score >= 90) {
      return 'Excellent suivi';
    }

    if (score >= 75) {
      return 'Suivi maîtrisé';
    }

    if (score >= 55) {
      return 'À surveiller';
    }

    return 'Attention requise';
  });

  /* =========================================================
   * PROCHAINE ÉCHÉANCE
   * ========================================================= */

  readonly nextDeadline = computed(() => {
    const today = this.toDateKey(this.now());

    return [...this.profileDeadlines()]
      .filter(
        (deadline) =>
          deadline.date >= today &&
          !this.completedIds().has(deadline.id)
      )
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      )[0];
  });

  readonly countdown = computed(() => {
    const deadline = this.nextDeadline();

    if (!deadline) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
      };
    }

    const target =
      new Date(`${deadline.date}T23:59:59`);

    const diff =
      target.getTime() -
      this.now().getTime();

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
      };
    }

    const days =
      Math.floor(diff / 86_400_000);

    const hours =
      Math.floor(
        (diff % 86_400_000) /
          3_600_000
      );

    const minutes =
      Math.floor(
        (diff % 3_600_000) /
          60_000
      );

    return {
      days,
      hours,
      minutes,
    };
  });

  /* =========================================================
   * CALENDRIER
   * ========================================================= */

  readonly monthLabel = computed(
    () =>
      `${this.monthNames[this.selectedMonth()]} ${this.selectedYear()}`
  );

  readonly calendarDays = computed<
    CalendarDay[]
  >(() => {
    const year = this.selectedYear();
    const month = this.selectedMonth();

    const first =
      new Date(year, month, 1);

    const firstWeekday =
      (first.getDay() + 6) % 7;

    const start =
      new Date(
        year,
        month,
        1 - firstWeekday
      );

    const todayKey =
      this.toDateKey(this.now());

    return Array.from(
      { length: 42 },
      (_, index) => {
        const date = new Date(start);

        date.setDate(
          start.getDate() + index
        );

        const key =
          this.toDateKey(date);

        return {
          date,
          key,
          day: date.getDate(),
          inCurrentMonth:
            date.getMonth() === month,
          isToday:
            key === todayKey,
        };
      }
    );
  });

  readonly selectedDayDeadlines = computed(
    () =>
      this.filteredDeadlines().filter(
        (deadline) =>
          deadline.date ===
          this.selectedDate()
      )
  );

  readonly sortedFilteredDeadlines =
    computed(() =>
      [...this.filteredDeadlines()].sort(
        (a, b) =>
          a.date.localeCompare(b.date)
      )
    );

  readonly upcoming30Days = computed(() =>
    this.profileDeadlines()
      .filter((deadline) => {
        if (
          this.deadlineStatus(deadline) !==
          'upcoming'
        ) {
          return false;
        }

        const days =
          this.daysUntil(deadline.date);

        return days >= 0 && days <= 30;
      })
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      )
  );

  /* =========================================================
   * ACTIONS PROFIL
   * ========================================================= */

  setProfile(value: string): void {
    if (
      this.profiles.some(
        (item) => item.id === value
      )
    ) {
      this.selectedProfile.set(
        value as FiscalProfile
      );
    }
  }

  setRegime(value: string): void {
    if (
      value === 'all' ||
      this.regimes.some(
        (item) => item.id === value
      )
    ) {
      this.selectedRegime.set(
        value as TaxRegime | 'all'
      );
    }
  }

  setYear(value: string): void {
    const year = Number(value);

    if (!Number.isNaN(year)) {
      this.selectedYear.set(year);

      this.selectedDate.set(
        this.toDateKey(
          new Date(
            year,
            this.selectedMonth(),
            1
          )
        )
      );
    }
  }

  /* =========================================================
   * FILTRES
   * ========================================================= */

  setCategory(
    category: 'all' | TaxCategory
  ): void {
    this.selectedCategory.set(category);
  }

  setStatus(value: string): void {
    if (
      value === 'all' ||
      value === 'upcoming' ||
      value === 'completed' ||
      value === 'overdue'
    ) {
      this.selectedStatus.set(
        value as
          | 'all'
          | DeadlineStatus
      );
    }
  }

  setSearch(value: string): void {
    this.searchTerm.set(value);
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.selectedStatus.set('all');
    this.searchTerm.set('');
  }

  /* =========================================================
   * VUES
   * ========================================================= */

  setView(view: CalendarView): void {
    this.currentView.set(view);
  }

  /* =========================================================
   * NAVIGATION CALENDRIER
   * ========================================================= */

  previousMonth(): void {
    let month =
      this.selectedMonth() - 1;

    let year =
      this.selectedYear();

    if (month < 0) {
      month = 11;
      year--;
    }

    this.selectedMonth.set(month);
    this.selectedYear.set(year);

    this.selectedDate.set(
      this.toDateKey(
        new Date(year, month, 1)
      )
    );
  }

  nextMonth(): void {
    let month =
      this.selectedMonth() + 1;

    let year =
      this.selectedYear();

    if (month > 11) {
      month = 0;
      year++;
    }

    this.selectedMonth.set(month);
    this.selectedYear.set(year);

    this.selectedDate.set(
      this.toDateKey(
        new Date(year, month, 1)
      )
    );
  }

  goToToday(): void {
    const today =
      this.now();

    this.selectedYear.set(
      today.getFullYear()
    );

    this.selectedMonth.set(
      today.getMonth()
    );

    this.selectedDate.set(
      this.toDateKey(today)
    );
  }

  selectDate(day: CalendarDay): void {
    this.selectedDate.set(day.key);

    if (!day.inCurrentMonth) {
      this.selectedYear.set(
        day.date.getFullYear()
      );

      this.selectedMonth.set(
        day.date.getMonth()
      );
    }
  }

  /* =========================================================
   * ÉVÉNEMENTS
   * ========================================================= */

  eventsForDate(
    date: string
  ): TaxDeadline[] {
    return this.filteredDeadlines().filter(
      (deadline) =>
        deadline.date === date
    );
  }

  hasEvents(date: string): boolean {
    return this.eventsForDate(date).length > 0;
  }

  /* =========================================================
   * STATUTS
   * ========================================================= */

  deadlineStatus(
    deadline: TaxDeadline
  ): DeadlineStatus {
    if (
      this.completedIds().has(deadline.id)
    ) {
      return 'completed';
    }

    const today =
      this.toDateKey(this.now());

    if (deadline.date < today) {
      return 'overdue';
    }

    return 'upcoming';
  }

  statusLabel(
    deadline: TaxDeadline
  ): string {
    const status =
      this.deadlineStatus(deadline);

    switch (status) {
      case 'completed':
        return 'Terminé';

      case 'overdue':
        return 'En retard';

      default:
        return 'À venir';
    }
  }

  priorityLabel(
    priority: DeadlinePriority
  ): string {
    const labels: Record<
      DeadlinePriority,
      string
    > = {
      low: 'Faible',
      medium: 'Modérée',
      high: 'Élevée',
      critical: 'Critique',
    };

    return labels[priority];
  }

  categoryLabel(
    category: TaxCategory
  ): string {
    const labels: Record<
      TaxCategory,
      string
    > = {
      declaration: 'Déclaration',
      paiement: 'Paiement',
      tva: 'TVA',
      retenue: 'Retenue',
      social: 'Social',
      entreprise: 'Entreprise',
      audit: 'Audit',
    };

    return labels[category];
  }

  /* =========================================================
   * OBLIGATION TERMINÉE
   * ========================================================= */

  toggleCompleted(
    deadline: TaxDeadline
  ): void {
    const next =
      new Set(this.completedIds());

    if (next.has(deadline.id)) {
      next.delete(deadline.id);
    } else {
      next.add(deadline.id);
    }

    this.completedIds.set(next);

    this.persistLocalState();
  }

  isCompleted(id: string): boolean {
    return this.completedIds().has(id);
  }

  /* =========================================================
   * RAPPELS
   * ========================================================= */

  toggleReminder(
    deadline: TaxDeadline
  ): void {
    const next =
      new Set(this.reminderIds());

    if (next.has(deadline.id)) {
      next.delete(deadline.id);
    } else {
      next.add(deadline.id);
    }

    this.reminderIds.set(next);

    this.persistLocalState();
  }

  hasReminder(id: string): boolean {
    return this.reminderIds().has(id);
  }

  /* =========================================================
   * FAVORIS
   * ========================================================= */

  toggleFavorite(
    deadline: TaxDeadline
  ): void {
    const next =
      new Set(this.favoriteIds());

    if (next.has(deadline.id)) {
      next.delete(deadline.id);
    } else {
      next.add(deadline.id);
    }

    this.favoriteIds.set(next);

    this.persistLocalState();
  }

  isFavorite(id: string): boolean {
    return this.favoriteIds().has(id);
  }

  /* =========================================================
   * DATES
   * ========================================================= */

  formatDate(
    dateString: string
  ): string {
    return new Intl.DateTimeFormat(
      'fr-FR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    ).format(
      new Date(`${dateString}T12:00:00`)
    );
  }

  formatShortDate(
    dateString: string
  ): string {
    return new Intl.DateTimeFormat(
      'fr-FR',
      {
        day: '2-digit',
        month: 'short',
      }
    ).format(
      new Date(`${dateString}T12:00:00`)
    );
  }

  daysUntil(
    dateString: string
  ): number {
    const today =
      new Date(this.now());

    today.setHours(0, 0, 0, 0);

    const target =
      new Date(
        `${dateString}T00:00:00`
      );

    return Math.ceil(
      (target.getTime() -
        today.getTime()) /
        86_400_000
    );
  }

  urgencyText(
    deadline: TaxDeadline
  ): string {
    const status =
      this.deadlineStatus(deadline);

    if (status === 'completed') {
      return 'Traitée';
    }

    if (status === 'overdue') {
      return `${Math.abs(
        this.daysUntil(deadline.date)
      )} j de retard`;
    }

    const days =
      this.daysUntil(deadline.date);

    if (days === 0) {
      return 'Aujourd’hui';
    }

    if (days === 1) {
      return 'Demain';
    }

    return `J-${days}`;
  }

  /* =========================================================
   * EXPORT ICS
   * ========================================================= */

  exportDeadlineIcs(
    deadline: TaxDeadline
  ): void {
    const content =
      this.buildIcs([deadline]);

    this.downloadFile(
      `${this.slugify(
        deadline.shortTitle
      )}.ics`,
      content,
      'text/calendar;charset=utf-8'
    );
  }

  exportFilteredIcs(): void {
    const deadlines =
      this.sortedFilteredDeadlines();

    if (!deadlines.length) {
      return;
    }

    const content =
      this.buildIcs(deadlines);

    this.downloadFile(
      `kmaa-fiscal-radar-${this.selectedYear()}.ics`,
      content,
      'text/calendar;charset=utf-8'
    );
  }

  private buildIcs(
    deadlines: TaxDeadline[]
  ): string {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KMAA//Fiscal Radar//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    deadlines.forEach((deadline) => {
      const start =
        deadline.date.replace(/-/g, '');

      const nextDate =
        new Date(
          `${deadline.date}T12:00:00`
        );

      nextDate.setDate(
        nextDate.getDate() + 1
      );

      const end =
        this.toDateKey(nextDate).replace(
          /-/g,
          ''
        );

      lines.push(
        'BEGIN:VEVENT',
        `UID:${deadline.id}@kmaa-fiscal`,
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${this.escapeIcs(
          deadline.title
        )}`,
        `DESCRIPTION:${this.escapeIcs(
          deadline.description
        )}`,
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');

    return lines.join('\r\n');
  }

  /* =========================================================
   * EXPORT CSV
   * ========================================================= */

  exportCsv(): void {
    const rows = [
      [
        'Date',
        'Échéance',
        'Catégorie',
        'Priorité',
        'Statut',
        'Régime',
      ],
      ...this.sortedFilteredDeadlines().map(
        (deadline) => [
          deadline.date,
          deadline.title,
          this.categoryLabel(
            deadline.category
          ),
          this.priorityLabel(
            deadline.priority
          ),
          this.statusLabel(deadline),
          deadline.regimes === 'all'
            ? 'Tous'
            : deadline.regimes.join(' / '),
        ]
      ),
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(';')
      )
      .join('\n');

    this.downloadFile(
      `kmaa-fiscal-radar-${this.selectedYear()}.csv`,
      '\uFEFF' + csv,
      'text/csv;charset=utf-8'
    );
  }

  /* =========================================================
   * PERSISTENCE LOCALE
   * ========================================================= */

  private persistLocalState(): void {
    if (
      typeof localStorage ===
      'undefined'
    ) {
      return;
    }

    localStorage.setItem(
      'kmaa-fiscal-completed',
      JSON.stringify([
        ...this.completedIds(),
      ])
    );

    localStorage.setItem(
      'kmaa-fiscal-reminders',
      JSON.stringify([
        ...this.reminderIds(),
      ])
    );

    localStorage.setItem(
      'kmaa-fiscal-favorites',
      JSON.stringify([
        ...this.favoriteIds(),
      ])
    );
  }

  private restoreLocalState(): void {
    if (
      typeof localStorage ===
      'undefined'
    ) {
      return;
    }

    try {
      const completed =
        JSON.parse(
          localStorage.getItem(
            'kmaa-fiscal-completed'
          ) ?? '[]'
        );

      const reminders =
        JSON.parse(
          localStorage.getItem(
            'kmaa-fiscal-reminders'
          ) ?? '[]'
        );

      const favorites =
        JSON.parse(
          localStorage.getItem(
            'kmaa-fiscal-favorites'
          ) ?? '[]'
        );

      this.completedIds.set(
        new Set(completed)
      );

      this.reminderIds.set(
        new Set(reminders)
      );

      this.favoriteIds.set(
        new Set(favorites)
      );
    } catch {
      this.completedIds.set(
        new Set()
      );

      this.reminderIds.set(
        new Set()
      );

      this.favoriteIds.set(
        new Set()
      );
    }
  }

  /* =========================================================
   * UTILITAIRES
   * ========================================================= */

  private toDateKey(
    date: Date
  ): string {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private escapeIcs(
    value: string
  ): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  private slugify(
    value: string
  ): string {
    return value
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private downloadFile(
    filename: string,
    content: string,
    type: string
  ): void {
    if (
      typeof document ===
      'undefined'
    ) {
      return;
    }

    const blob =
      new Blob([content], {
        type,
      });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}