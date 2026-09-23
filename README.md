# Kmma — Site web (Angular 22)

## Démarrage

```bash
npm install
npm start        # ou: ng serve
```

Puis ouvrir http://localhost:4200

> ⚠️ Angular 22 exige Node.js ≥ 22.12 (idéalement 22.22.3+). Si `ng serve`
> refuse de démarrer en te parlant de version de Node trop ancienne,
> mets Node à jour (`nvm install 22 && nvm use 22`).

## Ce qui est fait (Étape 1 — page d'accueil)

- **Design system** (`src/styles/`) : `_colors.scss` (palette bleu marine
  & or), `_typography.scss` (police Fraunces pour les titres, Inter pour
  le texte), `_responsive.scss` (mixins de breakpoints, équivalent de ta
  classe `Responsive` côté Flutter).
- **Header** (`src/app/components/header/`) : logo, nav avec les 5
  rubriques (Accueil, À Propos, Nos Formations ▾, Nos Services ▾,
  Compte ▾), méga-menus déroulants au survol en desktop, menu plein
  écran en accordéon sur mobile, fond transparent → navy plein au scroll.
- **Page d'accueil** (`src/app/pages/home/`), composée de 5 sections
  indépendantes dans `sections/` :
  1. `hero` — grand titre + statistiques + CTA
  2. `programs` — 4 formations phares (dernière carte en accent doré)
  3. `accompaniment` — bloc image + texte "Votre réussite, notre engagement"
  4. `philosophy` — bloc sombre + 3 cartes qui chevauchent la section suivante
  5. `why-us` — "Pourquoi nous choisir"
- **Footer** (`src/app/components/footer/`).
- **`SectionTitle`** (`src/app/shared/section-title/`) : composant
  réutilisable "eyebrow + titre", toujours aligné à gauche par défaut.

## Prochaines étapes (à faire ensemble)

- Ajouter tes vraies images / vidéo de fond dans `src/assets/images/`
  et `src/assets/videos/`, puis décommenter les `<img>`/`<video>`
  repérables par les commentaires `TODO (Salomon)` dans les templates.
- Ajouter le vrai logo Kmma (remplace le bloc `header__logo-mark` /
  `footer__logo-mark`).
- Construire les pages du menu une par une : À Propos, Nos Formations,
  Nos Services, Compte (connexion/inscription/espace).

## Où intervenir en priorité

| Besoin | Fichier |
|---|---|
| Changer une couleur | `src/styles/_colors.scss` |
| Changer une police | `src/styles/_typography.scss` |
| Modifier un point de rupture (breakpoint) | `src/styles/_responsive.scss` |
| Modifier le menu du header | `src/app/components/header/header.ts` (tableaux `simpleLinks` / `dropdowns`) |
| Modifier les 4 formations mises en avant | `src/app/pages/home/sections/programs/programs.ts` |
