import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface StoryCard {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  route: string;
}

@Component({
  selector: 'app-accompaniment',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './accompaniment.html',
  styleUrl: './accompaniment.scss',
})
export class Accompaniment implements AfterViewInit, OnDestroy {
  readonly stories: StoryCard[] = [
    {
      image: 'images/notre_accompagnement/fatou.png',
      imageAlt: 'Formation certifiante réussie',
      title: 'De la reconversion à la certification : le parcours de Fatou',
      description:
        "Après 8 mois d'accompagnement personnalisé, Fatou a obtenu sa certification et rejoint une équipe de gestion administrative dans une entreprise de Ouagadougou.",
      route: '/histoires/parcours-fatou',
    },
    {
      image: 'images/notre_accompagnement/accompagnement_sur_mesure.png',
      imageAlt: 'Audit et contrôle de gestion',
      title: "Un audit interne qui a transformé la gestion d'une PME",
      description:
        "KMAA a accompagné une PME locale dans la mise en place d'un système de contrôle de gestion. Résultat : une meilleure lisibilité des coûts et des décisions plus rapides.",
      route: '/histoires/audit-pme',
    },
    {
      image: 'images/notre_accompagnement/former_une_equipe.png',
      imageAlt: "Accompagnement d'équipe",
      title: "Former une équipe entière, sans ralentir l'activité",
      description:
        "Un cabinet a confié à KMAA la montée en compétences de 12 collaborateurs. Formations en entreprise + suivi individuel : 95 % de satisfaction.",
      route: '/histoires/formation-equipe',
    },
  ];

  // ---------------------------------------------------------------------
  // Chorégraphie — délais volontairement importants pour bien observer
  // chaque étape : d'abord le titre (ligne par ligne), puis l'escalier
  // d'images/textes, du bas vers le haut.
  // ---------------------------------------------------------------------

  /** Écart (ms) entre la 1ère et la 2ème ligne du titre. */
  readonly titleLineStaggerMs = 750;

  /** Délai avant que la galerie ne commence, une fois le titre affiché. */
  readonly galleryStartMs = 1900;

  /** Écart (ms) entre le déclenchement de chaque marche de l'escalier. */
  readonly staggerMs = 1300;

  /** Durée (ms) de l'animation de vague sur une image. */
  readonly waveDurationMs = 2000;

  /** Passe à `true` une seule fois, quand la section entre dans le viewport. */
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
          // `zone.run` garantit le rafraîchissement de la vue même sur un
          // projet Angular sans zone.js (callback IntersectionObserver =
          // API navigateur "brute", hors du radar d'Angular par défaut).
          this.zone.run(() => this.visible.set(true));
          this.observer?.disconnect();
        }
      },
      {
        // On exige que la section soit bien engagée dans l'écran (40%)
        // avant de démarrer, pour ne pas jouer l'animation trop tôt et
        // donner l'impression qu'"il ne se passe rien" au scroll.
        threshold: 0.4,
        rootMargin: '0px 0px -15% 0px',
      },
    );

    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /** Délai (ms) appliqué à la marche n°`index`, du bas de l'escalier vers le haut. */
  delayFor(index: number): number {
    return this.galleryStartMs + index * this.staggerMs;
  }
}