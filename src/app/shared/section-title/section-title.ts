import { Component, input } from '@angular/core';

/**
 * Bloc "eyebrow + titre + (sous-titre)" réutilisé en tête de chaque section.
 * Équivalent Angular du widget `SectionTitle` du projet Flutter kmaa_1.
 *
 * Toujours aligné à gauche par défaut (choix de design intentionnel,
 * voir principe équivalent côté Flutter : ne pas centrer les titres de section).
 */
@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [],
  templateUrl: './section-title.html',
  styleUrl: './section-title.scss',
})
export class SectionTitle {
  /** Petit label au-dessus du titre, ex: "NOS FORMATIONS" */
  readonly eyebrow = input<string>('');

  /** Titre principal de la section */
  readonly title = input.required<string>();

  /** Texte d'accompagnement optionnel sous le titre */
  readonly description = input<string>('');

  /** Centrer le bloc (à utiliser avec parcimonie — l'alignement gauche est le défaut voulu) */
  readonly centered = input<boolean>(false);

  /** Thème clair (texte sombre, sur fond ivoire) ou sombre (texte clair, sur fond navy) */
  readonly theme = input<'light' | 'dark'>('light');
}
