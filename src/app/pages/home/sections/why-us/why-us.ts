import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  WritableSignal,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface WhyUsCard {
  title: string;
  description: string;
  /** Chemin relatif depuis public/, ex: 'images/pourquoi_nous_choisir/xxx.png' */
  image: string;
  linkLabel: string;
  route: string;
}

@Component({
  selector: 'app-why-us',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './why-us.html',
  styleUrl: './why-us.scss',
})
export class WhyUs implements AfterViewInit, OnDestroy {
  readonly cards: WhyUsCard[] = [
    {
      title: 'KMAA',
      description:
        "Nos valeurs nous guident et nous rendent forts. Elles reflètent ce que nous tenons pour essentiel, en tant qu'individus et en tant qu'organisation. La Voie Kmma, c'est notre façon de vivre nos valeurs, en faisant les bonnes choses, au bon moment, pour les bonnes raisons.",
      image: 'images/pourquoi_nous_choisir/pourquoi_nous_choisir.png',
      linkLabel: 'En savoir plus sur la Voie Kmma',
      route: '/a-propos',
    },
    {
      title: "Osez l'excellence sur-mesure",
      description:
        "Parce que votre réussite ne se copie pas, elle se construit. Contactez-nous pour co-écrire le prochain chapitre de votre progression.",
      image: 'images/pourquoi_nous_choisir/oser_excellence.png',
      linkLabel: 'Nous contacter',
      route: '/a-propos',
    },
  ];

  readonly presence = {
    titleLine1: 'Des experts à vos côtés.',
    titleLine2: 'Où que vous en soyez dans votre parcours.',
    left: {
      title: 'Formations & certifications',
      description: 'Parcours individuels, sessions certifiantes et formations à distance',
      ctaLabel: 'Découvrir nos formations',
      route: '/formations',
    },
    right: {
      title: 'Conseil & accompagnement',
      description: 'Audit, gestion administrative et suivi pédagogique sur mesure',
      ctaLabel: 'Parler à un expert',
      route: '/contact',
    },
  };

  // ---------------------------------------------------------------------
  // Deux vagues d'apparition indépendantes, chacune déclenchée par son
  // propre passage à l'écran :
  //  1) le haut de la section (titre + les 2 cartes)
  //  2) la bande "Présence" tout en bas (titre, arc qui se dessine,
  //     globe, puis les deux colonnes)
  // Délais volontairement longs — effet lent et posé, comme demandé.
  // ---------------------------------------------------------------------

  readonly headerDelay = 0;
  readonly introDelay = 450;
  readonly cardStaggerMs = 550;
  readonly cardStartMs = 950;

  readonly presenceTitleLine2Delay = 550;
  readonly presenceArcDelay = 1150;
  readonly presenceArcDurationMs = 1700;
  readonly presenceIconDelay = 2650;
  readonly presenceColLeftDelay = 3250;
  readonly presenceColRightDelay = 3850;

  readonly visible = signal(false);
  readonly presenceVisible = signal(false);

  @ViewChild('mainBlock') private readonly mainBlock!: ElementRef<HTMLElement>;
  @ViewChild('presenceBlock') private readonly presenceBlock!: ElementRef<HTMLElement>;

  private mainObserver?: IntersectionObserver;
  private presenceObserver?: IntersectionObserver;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.visible.set(true);
      this.presenceVisible.set(true);
      return;
    }

    this.mainObserver = this.watch(this.mainBlock.nativeElement, this.visible, 0.3);
    this.presenceObserver = this.watch(this.presenceBlock.nativeElement, this.presenceVisible, 0.25);
  }

  ngOnDestroy(): void {
    this.mainObserver?.disconnect();
    this.presenceObserver?.disconnect();
  }

  private watch(
    element: HTMLElement,
    target: WritableSignal<boolean>,
    threshold: number,
  ): IntersectionObserver {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          this.zone.run(() => target.set(true));
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(element);
    return observer;
  }

  cardDelay(index: number): number {
    return this.cardStartMs + index * this.cardStaggerMs;
  }
}