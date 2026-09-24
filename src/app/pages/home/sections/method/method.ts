import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface MethodStep {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly route: string;
  readonly tone: 'gold' | 'blue' | 'purple' | 'cyan';
}

@Component({
  selector: 'app-method',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './method.html',
  styleUrl: './method.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Method implements AfterViewInit, OnDestroy {
  readonly eyebrow = 'NOTRE MÉTHODE';

  readonly title = 'Votre projet, notre méthode.';

  readonly description =
    'Chaque accompagnement commence par une écoute attentive et se poursuit par une démarche structurée, pragmatique et orientée vers des résultats durables.';

  readonly steps: readonly MethodStep[] = [
    {
      number: '01',
      title: 'Écouter',
      description:
        'Comprendre votre situation, vos objectifs et les réalités de votre organisation.',
      image: '/images/method/ecouter.png',
      route: '/notre_method/ecouter',
      tone: 'gold',
    },
    {
      number: '02',
      title: 'Analyser',
      description:
        'Étudier vos données, vos processus et vos risques pour faire émerger les priorités.',
      image: '/images/notre_method/analyser.png',
      route: '/notre_methode/analyser',
      tone: 'blue',
    },
    {
      number: '03',
      title: 'Construire',
      description:
        'Élaborer avec vous une réponse personnalisée, claire et adaptée à votre contexte.',
      image: '/images/notre_method/construire.png',
      route: '/notre-methode/construire',
      tone: 'purple',
    },
    {
      number: '04',
      title: 'Accompagner',
      description:
        'Mettre la solution en œuvre et mesurer les progrès réalisés dans la durée.',
      image: '/images/notre_method/vous_accompagner.png',
      route: '/notre-methode/accompagner',
      tone: 'cyan',
    },
  ];

  /**
   * Écart (ms) entre l'apparition de chaque alvéole (Écouter → Analyser →
   * Construire → Accompagner). Volontairement long pour bien voir
   * l'enchaînement des figures et de la ligne de progression.
   */
  readonly stepStaggerMs = 1200;

  /** Délai avant la toute première alvéole. */
  readonly firstStepDelayMs = 400;

  /** Durée totale de l'animation de la ligne de progression (ms). */
  readonly pathDurationMs = 6500;

  /** Passe à `true` une seule fois, quand la section entre dans le viewport. */
  readonly visible = signal(false);

  private observer?: IntersectionObserver;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.visible.set(true);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          this.visible.set(true);
          this.observer?.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
    );

    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /** Délai (ms) de l'alvéole n°`index`, dans l'ordre Écouter → Accompagner. */
  stepDelay(index: number): number {
    return this.firstStepDelayMs + index * this.stepStaggerMs;
  }
}