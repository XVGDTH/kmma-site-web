import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface AcademyMetric {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-my-academie',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-academie.html',
  styleUrl: './my-academie.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyAcademie implements AfterViewInit, OnDestroy {
  readonly eyebrow = 'MY ACADÉMIE ·';

  readonly title = 'Apprendre aujourd’hui pour décider mieux demain.';

  readonly description =
    'Une académie pratique pour développer vos compétences en comptabilité, gestion, finance, crédit et pilotage des organisations.';

  readonly metrics: readonly AcademyMetric[] = [
    { value: '100 %', label: 'contenus pratiques' },
    { value: '24/7', label: 'accès aux ressources' },
    { value: 'KMAA', label: 'compétences certifiées' },
  ];

  readonly highlights = [
    'Des parcours conçus pour votre réalité professionnelle',
    'Des exercices directement applicables sur le terrain',
    'Une progression suivie depuis votre espace personnel',
  ];

  // ---------------------------------------------------------------------
  // Chorégraphie "rideau" — la colonne gauche et la colonne droite se
  // révèlent PAR ÉTAPES SYNCHRONISÉES : à chaque étape, un élément de
  // gauche ET son vis-à-vis de droite s'ouvrent en même temps, l'un
  // glissant vers la droite, l'autre vers la gauche.
  // ---------------------------------------------------------------------
  private readonly STAGE_GAP_MS = 600;
  private readonly FIRST_STAGE_MS = 350;

  /** Délai (ms) de l'étape n° `stage` (0 = eyebrow/statut, 1 = titre/icône, ...). */
  stageDelay(stage: number): number {
    return this.FIRST_STAGE_MS + stage * this.STAGE_GAP_MS;
  }

  readonly visible = signal(false);

  private observer?: IntersectionObserver;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.visible.set(true);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          this.zone.run(() => this.visible.set(true));
          this.observer?.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: '0px 0px -15% 0px' },
    );

    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}