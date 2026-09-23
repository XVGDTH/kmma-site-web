import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

type CardTone = 'gold' | 'purple' | 'blue' | 'cyan';

interface ServiceCard {
  readonly title: string;
  readonly route: string;
  readonly tone: CardTone;
}

@Component({
  selector: 'app-philosophy',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './philosophy.html',
  styleUrl: './philosophy.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Philosophy implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Passe à true dès que la section entre dans le viewport -> déclenche le tourbillon en cascade */
  readonly visible = signal(false);

  readonly title = 'Des connexions personnelles, des solutions concrètes.';

  readonly subtitle =
    'KMAA accompagne apprenants et organisations avec une approche humaine, pragmatique et orientée résultats.';

  readonly cards: readonly ServiceCard[] = [
    { title: 'Audit', route: '/audit', tone: 'gold' },
    { title: 'Fiscalité', route: '/fiscalite', tone: 'purple' },
    { title: 'Conseil & accompagnement', route: '/advisory', tone: 'blue' },
    { title: 'Services aux entreprises', route: '/services-aux-entreprises', tone: 'cyan' },
  ];

  /**
   * Rang d'apparition de chaque carte (index -> ordre dans la séquence) :
   * 0 = Audit (1er), 1 = Fiscalité (3e), 2 = Conseil (4e), 3 = Services (2e)
   */
  readonly cardOrder: readonly number[] = [0, 2, 3, 1];

  /** Direction d'entrée : 1 = depuis la droite, -1 = depuis la gauche */
  readonly cardDirection: readonly number[] = [1, -1, 1, -1];

  ngAfterViewInit(): void {
    // Pas d'IntersectionObserver côté serveur (SSR) -> on affiche direct
    if (!isPlatformBrowser(this.platformId) || typeof IntersectionObserver === 'undefined') {
      this.visible.set(true);
      return;
    }

    const target = this.host.nativeElement.querySelector('.philosophy__cards');
    if (!target) {
      this.visible.set(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.visible.set(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -80px 0px' },
    );

    observer.observe(target);
  }
}