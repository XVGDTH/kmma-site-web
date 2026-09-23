import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  signal,
} from '@angular/core';

interface AboutValue {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About implements AfterViewInit, OnDestroy {
  readonly eyebrow = 'À PROPOS DE KMAA';

  readonly title =
    'Expertise, conseil et solutions concrètes pour faire progresser vos organisations.';

  readonly intro =
    "KMAA accompagne les entreprises, les organisations et les porteurs de projets dans la compréhension de leurs enjeux, la maîtrise de leurs ressources et la construction de résultats durables.";

  readonly paragraphs = [
    "Née d'une volonté de rendre l'expertise plus accessible, plus pratique et plus proche des réalités du terrain, KMAA combine analyse, accompagnement et transmission des compétences.",
    "Notre approche s'appuie sur l'écoute active, la rigueur professionnelle, l'innovation et l'adaptation. Nous ne proposons pas de solution standard : nous construisons avec chaque client une réponse alignée sur ses objectifs, ses moyens et son environnement.",
  ];

  readonly values: readonly AboutValue[] = [
    {
      icon: '◎',
      title: 'Expertise',
      description: 'Des analyses structurées pour éclairer chaque décision.',
    },
    {
      icon: '✦',
      title: 'Éthique',
      description: 'Une relation fondée sur la confiance, la confidentialité et la responsabilité.',
    },
    {
      icon: '↗',
      title: 'Impact',
      description: 'Des solutions pensées pour produire des résultats mesurables.',
    },
    {
      icon: '⌁',
      title: 'Proximité',
      description: 'Un accompagnement humain, disponible et adapté au contexte local.',
    },
  ];

  readonly focusAreas = [
    'Conseil stratégique et organisationnel',
    'Gestion financière et contrôle de gestion',
    'Fiscalité, juridique et conformité',
    'Audit interne et gestion des risques',
  ];

  /** Petites paillettes décoratives semées autour du visuel (nombre arbitraire). */
  readonly sparkles = Array.from({ length: 9 }, (_, i) => i);

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

  // ---------------------------------------------------------------------
  // Chorégraphie de la révélation "étape par étape".
  // Chaque groupe d'éléments démarre après la fin (approximative) du groupe
  // précédent, pour un effet de scintillement en cascade, pas en vrac.
  // ---------------------------------------------------------------------

private readonly VALUE_STAGGER = 340;
private readonly PARAGRAPH_STAGGER = 420;
private readonly FOCUS_STAGGER = 200;

readonly imageDelay = 0;
readonly badgeDelay = 650;
readonly captionDelay = 1050;
readonly eyebrowDelay = 400;
readonly titleDelay = 800;

  get valuesStart(): number {
    return this.titleDelay + 380;
  }

  get copyStart(): number {
    return this.valuesStart + this.values.length * this.VALUE_STAGGER + 250;
  }

  get focusStart(): number {
    return this.copyStart + (this.paragraphs.length + 1) * this.PARAGRAPH_STAGGER + 200;
  }

  valueDelay(index: number): number {
    return this.valuesStart + index * this.VALUE_STAGGER;
  }

  paragraphDelay(index: number): number {
    // +1 car l'intro (this.intro) occupe le premier créneau avant les paragraphes.
    return this.copyStart + (index + 1) * this.PARAGRAPH_STAGGER;
  }

  focusItemDelay(index: number): number {
    return this.focusStart + index * this.FOCUS_STAGGER;
  }

  sparkleDelay(index: number): number {
    return (index * 240) % 1800;
  }
}