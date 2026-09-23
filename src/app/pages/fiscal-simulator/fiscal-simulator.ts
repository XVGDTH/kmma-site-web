import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

type SimulatorType =
  | 'tva'
  | 'salary'
  | 'company-tax'
  | 'withholding'
  | 'ht-ttc'
  | 'diagnostic';

type Audience = 'particulier' | 'entreprise' | 'comptable';

interface SimulatorDefinition {
  id: SimulatorType;
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  steps: string[];
}

interface SimulationResult {
  id: string;
  simulator: SimulatorType;
  title: string;
  subtitle: string;
  date: string;
  values: {
    label: string;
    value: string;
    emphasis?: boolean;
  }[];
  explanation: string;
  score?: number;
}

interface HistoryItem {
  id: string;
  simulator: SimulatorType;
  title: string;
  amount: string;
  date: string;
  favorite: boolean;
}

interface DiagnosticQuestion {
  id: string;
  question: string;
  description: string;
  options: {
    value: string;
    label: string;
    icon: string;
  }[];
}

@Component({
  selector: 'app-fiscal-simulator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fiscal-simulator.html',
  styleUrl: './fiscal-simulator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiscalSimulator {

  // ============================================================
  // CONFIGURATION
  // ============================================================

  readonly simulatorDefinitions: SimulatorDefinition[] = [
    {
      id: 'tva',
      icon: '🧾',
      eyebrow: 'TAXE SUR LA VALEUR AJOUTÉE',
      title: 'Simulateur TVA',
      description:
        'Calculez rapidement la TVA, le montant TTC et, à titre indicatif, la TVA nette.',
      accent: 'gold',
      steps: ['Opération', 'Données', 'Résultat']
    },
    {
      id: 'salary',
      icon: '💰',
      eyebrow: 'RÉMUNÉRATION',
      title: 'Salaire & retenues',
      description:
        'Obtenez une estimation du passage du salaire brut au salaire net.',
      accent: 'blue',
      steps: ['Profil', 'Salaire', 'Résultat']
    },
    {
      id: 'company-tax',
      icon: '🏢',
      eyebrow: 'FISCALITÉ DES ENTREPRISES',
      title: 'Impôt entreprise',
      description:
        'Estimez l’impôt théorique à partir du résultat imposable renseigné.',
      accent: 'violet',
      steps: ['Entreprise', 'Résultat', 'Analyse']
    },
    {
      id: 'withholding',
      icon: '📊',
      eyebrow: 'RETENUE À LA SOURCE',
      title: 'Retenue à la source',
      description:
        'Estimez le montant d’une retenue à partir d’une base et d’un taux.',
      accent: 'green',
      steps: ['Nature', 'Montant', 'Résultat']
    },
    {
      id: 'ht-ttc',
      icon: '🧮',
      eyebrow: 'CALCUL COMMERCIAL',
      title: 'HT ↔ TTC',
      description:
        'Convertissez instantanément un montant hors taxes en TTC ou inversement.',
      accent: 'orange',
      steps: ['Conversion', 'Montant', 'Résultat']
    },
    {
      id: 'diagnostic',
      icon: '🧭',
      eyebrow: 'ORIENTATION FISCALE',
      title: 'Diagnostic fiscal',
      description:
        'Obtenez une première cartographie des sujets fiscaux à vérifier.',
      accent: 'cyan',
      steps: ['Profil', 'Situation', 'Diagnostic']
    }
  ];

  readonly audiences: {
    value: Audience;
    label: string;
    icon: string;
  }[] = [
    {
      value: 'entreprise',
      label: 'Entreprise',
      icon: '🏢'
    },
    {
      value: 'particulier',
      label: 'Particulier',
      icon: '👤'
    },
    {
      value: 'comptable',
      label: 'Comptable',
      icon: '📚'
    }
  ];

  // ============================================================
  // STATE
  // ============================================================

  readonly activeSimulator = signal<SimulatorType>('tva');

  readonly currentStep = signal(1);

  readonly selectedAudience = signal<Audience>('entreprise');

  readonly isCalculating = signal(false);

  readonly result = signal<SimulationResult | null>(null);

  readonly history = signal<HistoryItem[]>(
    this.loadHistory()
  );

  readonly showHistory = signal(false);

  readonly showResult = signal(false);

  readonly showAllSimulators = signal(false);

  readonly copied = signal(false);

  // TVA
  readonly tvaAmount = signal(1000000);
  readonly tvaRate = signal(18);
  readonly tvaDeductible = signal(0);

  // Salary
  readonly grossSalary = signal(300000);
  readonly salaryBenefits = signal(0);
  readonly salaryOtherDeductions = signal(0);

  // Company
  readonly taxableProfit = signal(5000000);
  readonly companyRate = signal(27.5);

  // Withholding
  readonly withholdingAmount = signal(1000000);
  readonly withholdingRate = signal(5);
  readonly withholdingNature = signal('prestation');

  // HT / TTC
  readonly conversionAmount = signal(1000000);
  readonly conversionRate = signal(18);
  readonly conversionDirection = signal<'ht-to-ttc' | 'ttc-to-ht'>(
    'ht-to-ttc'
  );

  // Diagnostic
  readonly diagnosticAnswers = signal<Record<string, string>>({});

  // ============================================================
  // DIAGNOSTIC QUESTIONS
  // ============================================================

  readonly diagnosticQuestions: DiagnosticQuestion[] = [
    {
      id: 'activity',
      question: 'Quel est votre profil principal ?',
      description: 'Cela nous permet d’adapter les pistes d’analyse.',
      options: [
        {
          value: 'company',
          label: 'Entreprise',
          icon: '🏢'
        },
        {
          value: 'individual',
          label: 'Particulier',
          icon: '👤'
        },
        {
          value: 'professional',
          label: 'Professionnel indépendant',
          icon: '💼'
        }
      ]
    },
    {
      id: 'employees',
      question: 'Employez-vous du personnel ?',
      description: 'La gestion des rémunérations peut générer plusieurs obligations.',
      options: [
        {
          value: 'yes',
          label: 'Oui',
          icon: '👥'
        },
        {
          value: 'no',
          label: 'Non',
          icon: '○'
        }
      ]
    },
    {
      id: 'vat',
      question: 'Votre activité implique-t-elle des opérations soumises à TVA ?',
      description: 'Répondez selon votre situation actuelle.',
      options: [
        {
          value: 'yes',
          label: 'Oui',
          icon: '🧾'
        },
        {
          value: 'no',
          label: 'Non',
          icon: '○'
        },
        {
          value: 'unknown',
          label: 'Je ne sais pas',
          icon: '❔'
        }
      ]
    },
    {
      id: 'transactions',
      question: 'Effectuez-vous des prestations ou ventes à des entreprises ?',
      description: 'Cette information peut orienter la vérification des retenues.',
      options: [
        {
          value: 'yes',
          label: 'Oui',
          icon: '🤝'
        },
        {
          value: 'no',
          label: 'Non',
          icon: '○'
        }
      ]
    }
  ];

  // ============================================================
  // COMPUTED
  // ============================================================

  readonly activeDefinition = computed(() =>
    this.simulatorDefinitions.find(
      item => item.id === this.activeSimulator()
    ) ?? this.simulatorDefinitions[0]
  );

  readonly visibleSimulatorDefinitions = computed(() =>
    this.showAllSimulators()
      ? this.simulatorDefinitions
      : this.simulatorDefinitions.slice(0, 6)
  );

  readonly historyCount = computed(() => this.history().length);

  readonly favoriteCount = computed(
    () => this.history().filter(item => item.favorite).length
  );

  readonly completedDiagnosticCount = computed(
    () => Object.keys(this.diagnosticAnswers()).length
  );

  readonly diagnosticScore = computed(() => {
    const answers = this.diagnosticAnswers();

    if (!Object.keys(answers).length) {
      return 0;
    }

    let score = 55;

    if (answers['employees'] === 'yes') {
      score += 10;
    }

    if (answers['vat'] === 'yes') {
      score += 15;
    }

    if (answers['transactions'] === 'yes') {
      score += 10;
    }

    if (answers['vat'] === 'unknown') {
      score -= 5;
    }

    return Math.min(score, 100);
  });

  readonly diagnosticLevel = computed(() => {
    const score = this.diagnosticScore();

    if (score >= 85) {
      return 'Très bonne visibilité';
    }

    if (score >= 70) {
      return 'Bonne visibilité';
    }

    if (score >= 50) {
      return 'Visibilité à renforcer';
    }

    return 'Informations insuffisantes';
  });

  // ============================================================
  // SIMULATOR SELECTION
  // ============================================================

  selectSimulator(type: SimulatorType): void {
    this.activeSimulator.set(type);
    this.currentStep.set(1);
    this.result.set(null);
    this.showResult.set(false);
    this.copied.set(false);

    window.setTimeout(() => {
      document
        .querySelector('.simulator-workspace')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
    }, 50);
  }

  // ============================================================
  // INPUT HELPERS
  // ============================================================

  updateNumber(
    event: Event,
    target:
      | 'tvaAmount'
      | 'tvaRate'
      | 'tvaDeductible'
      | 'grossSalary'
      | 'salaryBenefits'
      | 'salaryOtherDeductions'
      | 'taxableProfit'
      | 'companyRate'
      | 'withholdingAmount'
      | 'withholdingRate'
      | 'conversionAmount'
      | 'conversionRate'
  ): void {
    const input = event.target as HTMLInputElement;

    const value = Number(
      input.value.replace(/\s/g, '').replace(',', '.')
    );

    const safeValue = Number.isFinite(value) ? value : 0;

    switch (target) {
      case 'tvaAmount':
        this.tvaAmount.set(safeValue);
        break;

      case 'tvaRate':
        this.tvaRate.set(safeValue);
        break;

      case 'tvaDeductible':
        this.tvaDeductible.set(safeValue);
        break;

      case 'grossSalary':
        this.grossSalary.set(safeValue);
        break;

      case 'salaryBenefits':
        this.salaryBenefits.set(safeValue);
        break;

      case 'salaryOtherDeductions':
        this.salaryOtherDeductions.set(safeValue);
        break;

      case 'taxableProfit':
        this.taxableProfit.set(safeValue);
        break;

      case 'companyRate':
        this.companyRate.set(safeValue);
        break;

      case 'withholdingAmount':
        this.withholdingAmount.set(safeValue);
        break;

      case 'withholdingRate':
        this.withholdingRate.set(safeValue);
        break;

      case 'conversionAmount':
        this.conversionAmount.set(safeValue);
        break;

      case 'conversionRate':
        this.conversionRate.set(safeValue);
        break;
    }
  }

  updateSelect(
    event: Event,
    target:
      | 'withholdingNature'
      | 'conversionDirection'
  ): void {
    const value = (event.target as HTMLSelectElement).value;

    if (target === 'withholdingNature') {
      this.withholdingNature.set(value);
    }

    if (target === 'conversionDirection') {
      this.conversionDirection.set(
        value as 'ht-to-ttc' | 'ttc-to-ht'
      );
    }
  }

  // ============================================================
  // STEP NAVIGATION
  // ============================================================

  nextStep(): void {
    if (this.currentStep() < 3) {
      this.currentStep.update(step => step + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  // ============================================================
  // SIMULATION
  // ============================================================

  runSimulation(): void {
    this.isCalculating.set(true);

    window.setTimeout(() => {
      let calculated: SimulationResult;

      switch (this.activeSimulator()) {
        case 'tva':
          calculated = this.calculateTva();
          break;

        case 'salary':
          calculated = this.calculateSalary();
          break;

        case 'company-tax':
          calculated = this.calculateCompanyTax();
          break;

        case 'withholding':
          calculated = this.calculateWithholding();
          break;

        case 'ht-ttc':
          calculated = this.calculateHtTtc();
          break;

        case 'diagnostic':
          calculated = this.calculateDiagnostic();
          break;

        default:
          calculated = this.calculateTva();
      }

      this.result.set(calculated);
      this.showResult.set(true);
      this.currentStep.set(3);
      this.isCalculating.set(false);

      this.addToHistory(calculated);
    }, 500);
  }

  // ============================================================
  // TVA
  // ============================================================

  private calculateTva(): SimulationResult {
    const amount = Math.max(0, this.tvaAmount());
    const rate = Math.max(0, this.tvaRate());
    const deductible = Math.max(0, this.tvaDeductible());

    const tax = amount * rate / 100;
    const ttc = amount + tax;
    const net = Math.max(0, tax - deductible);

    return {
      id: this.generateId(),
      simulator: 'tva',
      title: 'Simulation TVA',
      subtitle: `Base HT de ${this.formatCurrency(amount)}`,
      date: this.now(),
      values: [
        {
          label: 'Montant HT',
          value: this.formatCurrency(amount)
        },
        {
          label: 'TVA calculée',
          value: this.formatCurrency(tax),
          emphasis: true
        },
        {
          label: 'Montant TTC',
          value: this.formatCurrency(ttc),
          emphasis: true
        },
        {
          label: 'TVA déductible renseignée',
          value: this.formatCurrency(deductible)
        },
        {
          label: 'TVA nette estimée',
          value: this.formatCurrency(net),
          emphasis: true
        }
      ],
      explanation:
        'La TVA nette correspond ici à la différence entre la TVA calculée sur l’opération et la TVA déductible que vous avez renseignée.',
      score: 86
    };
  }

  // ============================================================
  // SALARY
  // ============================================================

  private calculateSalary(): SimulationResult {
    const gross = Math.max(0, this.grossSalary());
    const benefits = Math.max(0, this.salaryBenefits());
    const other = Math.max(0, this.salaryOtherDeductions());

    /*
     * Estimation pédagogique.
     * Les retenues sociales/fiscales réelles doivent être adaptées
     * aux règles et paramètres applicables à la situation du salarié.
     */
    const socialRate = 5.5;
    const estimatedSocial = gross * socialRate / 100;

    const taxableBase = Math.max(
      0,
      gross + benefits - estimatedSocial
    );

    const estimatedTax = this.progressiveSalaryTax(taxableBase);

    const net = Math.max(
      0,
      gross + benefits - estimatedSocial - estimatedTax - other
    );

    return {
      id: this.generateId(),
      simulator: 'salary',
      title: 'Simulation salaire',
      subtitle: `À partir d’un brut de ${this.formatCurrency(gross)}`,
      date: this.now(),
      values: [
        {
          label: 'Salaire brut',
          value: this.formatCurrency(gross)
        },
        {
          label: 'Avantages renseignés',
          value: this.formatCurrency(benefits)
        },
        {
          label: 'Retenue sociale estimative',
          value: this.formatCurrency(estimatedSocial)
        },
        {
          label: 'Impôt estimatif',
          value: this.formatCurrency(estimatedTax)
        },
        {
          label: 'Autres retenues',
          value: this.formatCurrency(other)
        },
        {
          label: 'Salaire net estimé',
          value: this.formatCurrency(net),
          emphasis: true
        }
      ],
      explanation:
        'Cette estimation utilise un modèle simplifié. Le montant réellement dû peut dépendre du profil du salarié, des déductions, avantages et paramètres réglementaires applicables.',
      score: 72
    };
  }

  private progressiveSalaryTax(base: number): number {
    if (base <= 100000) {
      return 0;
    }

    if (base <= 300000) {
      return (base - 100000) * 0.05;
    }

    if (base <= 600000) {
      return 10000 + (base - 300000) * 0.10;
    }

    if (base <= 1000000) {
      return 40000 + (base - 600000) * 0.15;
    }

    return 100000 + (base - 1000000) * 0.20;
  }

  // ============================================================
  // COMPANY TAX
  // ============================================================

  private calculateCompanyTax(): SimulationResult {
    const profit = Math.max(0, this.taxableProfit());
    const rate = Math.max(0, this.companyRate());

    const tax = profit * rate / 100;
    const afterTax = Math.max(0, profit - tax);

    return {
      id: this.generateId(),
      simulator: 'company-tax',
      title: 'Simulation impôt entreprise',
      subtitle: `Résultat imposable de ${this.formatCurrency(profit)}`,
      date: this.now(),
      values: [
        {
          label: 'Résultat imposable',
          value: this.formatCurrency(profit)
        },
        {
          label: 'Taux utilisé',
          value: `${this.formatNumber(rate)} %`
        },
        {
          label: 'Impôt théorique',
          value: this.formatCurrency(tax),
          emphasis: true
        },
        {
          label: 'Résultat après impôt',
          value: this.formatCurrency(afterTax),
          emphasis: true
        }
      ],
      explanation:
        'Le résultat présenté est une estimation mathématique basée sur le résultat imposable et le taux renseigné. Le régime fiscal réel de l’entreprise doit être vérifié avant toute décision.',
      score: 78
    };
  }

  // ============================================================
  // WITHHOLDING
  // ============================================================

  private calculateWithholding(): SimulationResult {
    const amount = Math.max(0, this.withholdingAmount());
    const rate = Math.max(0, this.withholdingRate());

    const withholding = amount * rate / 100;
    const net = Math.max(0, amount - withholding);

    const natureLabels: Record<string, string> = {
      prestation: 'Prestation de services',
      loyer: 'Loyer',
      commission: 'Commission',
      autre: 'Autre opération'
    };

    return {
      id: this.generateId(),
      simulator: 'withholding',
      title: 'Simulation retenue à la source',
      subtitle:
        natureLabels[this.withholdingNature()] ??
        'Opération',
      date: this.now(),
      values: [
        {
          label: 'Montant brut',
          value: this.formatCurrency(amount)
        },
        {
          label: 'Taux de retenue',
          value: `${this.formatNumber(rate)} %`
        },
        {
          label: 'Retenue estimée',
          value: this.formatCurrency(withholding),
          emphasis: true
        },
        {
          label: 'Montant net estimé',
          value: this.formatCurrency(net),
          emphasis: true
        }
      ],
      explanation:
        'Le taux doit être vérifié selon la nature exacte de l’opération, le bénéficiaire et le régime fiscal concerné.',
      score: 69
    };
  }

  // ============================================================
  // HT / TTC
  // ============================================================

  private calculateHtTtc(): SimulationResult {
    const amount = Math.max(0, this.conversionAmount());
    const rate = Math.max(0, this.conversionRate());

    let ht = 0;
    let tva = 0;
    let ttc = 0;

    if (this.conversionDirection() === 'ht-to-ttc') {
      ht = amount;
      tva = ht * rate / 100;
      ttc = ht + tva;
    } else {
      ttc = amount;
      ht = ttc / (1 + rate / 100);
      tva = ttc - ht;
    }

    return {
      id: this.generateId(),
      simulator: 'ht-ttc',
      title: 'Conversion HT ↔ TTC',
      subtitle:
        this.conversionDirection() === 'ht-to-ttc'
          ? 'Conversion HT vers TTC'
          : 'Conversion TTC vers HT',
      date: this.now(),
      values: [
        {
          label: 'Montant HT',
          value: this.formatCurrency(ht),
          emphasis: true
        },
        {
          label: 'TVA',
          value: this.formatCurrency(tva)
        },
        {
          label: 'Montant TTC',
          value: this.formatCurrency(ttc),
          emphasis: true
        },
        {
          label: 'Taux',
          value: `${this.formatNumber(rate)} %`
        }
      ],
      explanation:
        'Le calcul applique simplement le taux renseigné pour convertir le montant HT et TTC.',
      score: 95
    };
  }

  // ============================================================
  // DIAGNOSTIC
  // ============================================================

  private calculateDiagnostic(): SimulationResult {
    const answers = this.diagnosticAnswers();
    const score = this.diagnosticScore();

    const recommendations: string[] = [];

    if (answers['employees'] === 'yes') {
      recommendations.push(
        'Vérifier les obligations liées aux rémunérations et retenues.'
      );
    }

    if (answers['vat'] === 'yes') {
      recommendations.push(
        'Vérifier les obligations déclaratives liées à la TVA.'
      );
    }

    if (answers['vat'] === 'unknown') {
      recommendations.push(
        'Déterminer le régime TVA applicable à votre activité.'
      );
    }

    if (answers['transactions'] === 'yes') {
      recommendations.push(
        'Vérifier les règles applicables aux retenues sur les opérations concernées.'
      );
    }

    if (!recommendations.length) {
      recommendations.push(
        'Complétez votre profil fiscal pour obtenir une orientation plus précise.'
      );
    }

    return {
      id: this.generateId(),
      simulator: 'diagnostic',
      title: 'Diagnostic fiscal',
      subtitle: this.diagnosticLevel(),
      date: this.now(),
      values: [
        {
          label: 'Niveau de visibilité',
          value: `${score} / 100`,
          emphasis: true
        },
        {
          label: 'Questions complétées',
          value: `${Object.keys(answers).length} / ${this.diagnosticQuestions.length}`
        },
        {
          label: 'Pistes identifiées',
          value: `${recommendations.length}`
        }
      ],
      explanation: recommendations.join(' '),
      score
    };
  }

  // ============================================================
  // DIAGNOSTIC ANSWERS
  // ============================================================

  answerDiagnostic(questionId: string, value: string): void {
    this.diagnosticAnswers.update(current => ({
      ...current,
      [questionId]: value
    }));
  }

  isDiagnosticSelected(
    questionId: string,
    value: string
  ): boolean {
    return this.diagnosticAnswers()[questionId] === value;
  }

  // ============================================================
  // HISTORY
  // ============================================================

  private addToHistory(result: SimulationResult): void {
    const amount =
      result.values.find(item =>
        item.label.includes('estimé') ||
        item.label.includes('calculée') ||
        item.label.includes('TTC') ||
        item.label.includes('HT')
      )?.value ?? 'Simulation';

    const item: HistoryItem = {
      id: result.id,
      simulator: result.simulator,
      title: result.title,
      amount,
      date: result.date,
      favorite: false
    };

    const updated = [
      item,
      ...this.history().filter(existing => existing.id !== item.id)
    ].slice(0, 12);

    this.history.set(updated);
    this.saveHistory(updated);
  }

  toggleFavorite(itemId: string): void {
    const updated = this.history().map(item =>
      item.id === itemId
        ? {
            ...item,
            favorite: !item.favorite
          }
        : item
    );

    this.history.set(updated);
    this.saveHistory(updated);
  }

  isFavorite(itemId: string): boolean {
    return this.history().some(
      item => item.id === itemId && item.favorite
    );
  }

  clearHistory(): void {
    this.history.set([]);
    this.saveHistory([]);
  }

  openHistory(): void {
    this.showHistory.set(true);
  }

  closeHistory(): void {
    this.showHistory.set(false);
  }

  // ============================================================
  // SHARE / EXPORT
  // ============================================================

  async shareResult(): Promise<void> {
    const currentResult = this.result();

    if (!currentResult) {
      return;
    }

    const text = [
      currentResult.title,
      currentResult.subtitle,
      '',
      ...currentResult.values.map(
        item => `${item.label}: ${item.value}`
      ),
      '',
      currentResult.explanation
    ].join('\n');

    if (
      typeof navigator !== 'undefined' &&
      'share' in navigator
    ) {
      try {
        await navigator.share({
          title: currentResult.title,
          text
        });

        return;
      } catch {
        // User cancelled sharing.
      }
    }

    await this.copyText(text);
  }

  async copyResult(): Promise<void> {
    const currentResult = this.result();

    if (!currentResult) {
      return;
    }

    const text = [
      currentResult.title,
      currentResult.subtitle,
      '',
      ...currentResult.values.map(
        item => `${item.label}: ${item.value}`
      ),
      '',
      currentResult.explanation
    ].join('\n');

    await this.copyText(text);
  }

  private async copyText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);

      this.copied.set(true);

      window.setTimeout(() => {
        this.copied.set(false);
      }, 2200);
    } catch {
      this.copied.set(false);
    }
  }

  printResult(): void {
    window.print();
  }

  // ============================================================
  // UI
  // ============================================================

  resetSimulation(): void {
    this.result.set(null);
    this.showResult.set(false);
    this.currentStep.set(1);
    this.copied.set(false);
  }

  toggleAllSimulators(): void {
    this.showAllSimulators.update(value => !value);
  }

  // ============================================================
  // FORMATTERS
  // ============================================================

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0
    }).format(Math.round(value)) + ' FCFA';
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 2
    }).format(value);
  }

  simulatorLabel(type: SimulatorType): string {
    return (
      this.simulatorDefinitions.find(item => item.id === type)
        ?.title ?? 'Simulation'
    );
  }

  simulatorIcon(type: SimulatorType): string {
    return (
      this.simulatorDefinitions.find(item => item.id === type)
        ?.icon ?? '🧮'
    );
  }

  private now(): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  }

  // ============================================================
  // LOCAL STORAGE
  // ============================================================

  private loadHistory(): HistoryItem[] {
    try {
      const raw = localStorage.getItem(
        'fiscal-simulator-history'
      );

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveHistory(items: HistoryItem[]): void {
    try {
      localStorage.setItem(
        'fiscal-simulator-history',
        JSON.stringify(items)
      );
    } catch {
      // Storage unavailable.
    }
  }
}