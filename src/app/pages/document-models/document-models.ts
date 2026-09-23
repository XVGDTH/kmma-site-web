import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  DocumentCategory,
  DocumentAudience,
  FiscalDocument
} from './models-documents';


@Component({
  selector: 'app-document-models',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './document-models.html',

  styleUrl: './document-models.scss',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentModels {

  /* =========================================================
     SEARCH
  ========================================================= */

  readonly searchTerm = signal('');

  readonly activeCategory =
    signal<DocumentCategory | 'all'>('all');

  readonly activeAudience =
    signal<DocumentAudience | 'all'>('all');

  readonly selectedDocument =
    signal<FiscalDocument | null>(null);

  readonly favorites =
    signal<string[]>([]);

  readonly showOnlyFavorites =
    signal(false);


  /* =========================================================
     CATEGORIES
  ========================================================= */

  readonly categories = [

    {
      id: 'all' as const,
      label: 'Tous',
      icon: '▦'
    },

    {
      id: 'declaration' as DocumentCategory,
      label: 'Déclarations',
      icon: '▤'
    },

    {
      id: 'retenue' as DocumentCategory,
      label: 'Retenues',
      icon: '◈'
    },

    {
      id: 'tva' as DocumentCategory,
      label: 'TVA',
      icon: '◇'
    },

    {
      id: 'entreprise' as DocumentCategory,
      label: 'Entreprise',
      icon: '▣'
    },

    {
      id: 'attestation' as DocumentCategory,
      label: 'Attestations',
      icon: '✓'
    },

    {
      id: 'comptabilite' as DocumentCategory,
      label: 'Comptabilité',
      icon: '▥'
    },

    {
      id: 'juridique' as DocumentCategory,
      label: 'Juridique',
      icon: '§'
    }

  ];


  /* =========================================================
     DOCUMENTS OFFICIELS
  ========================================================= */

  readonly documents: FiscalDocument[] = [

    {
      id: 'remboursement-credit-tva',

      title: 'Demande de remboursement de crédit TVA',

      shortTitle: 'Remboursement crédit TVA',

      description:
        'Formulaire officiel destiné aux entreprises pouvant prétendre au remboursement d’un crédit de TVA.',

      category: 'tva',

      categoryLabel: 'TVA',

      audience: [
        'entreprise',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      version: 'Version DGI',

      date: '2026',

      url:
        'https://dgi.bf/wp-content/uploads/2023/10/DEMANDE-DE-REMBOURSEMENT-DE-CREDIT-TVA.pdf',

      source: 'Direction Générale des Impôts',

      tags: [
        'TVA',
        'remboursement',
        'entreprise',
        'crédit TVA'
      ],

      popular: true,

      featured: true
    },


    {
      id: 'etat-retenue-salaires',

      title:
        'État annexe de la déclaration de retenue obligatoire sur salaires',

      shortTitle:
        'Retenue obligatoire sur salaires',

      description:
        'Modèle d’état annexe permettant de détailler les salaires et les retenues correspondantes.',

      category: 'retenue',

      categoryLabel: 'Retenues',

      audience: [
        'entreprise',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      version: 'DGI',

      date: '2026',

      url:
        'https://dgi.bf/wp-content/uploads/2023/10/modele-etat-detaille-de-la-retenue-obligatoire-sur-salaires.pdf',

      source: 'Direction Générale des Impôts',

      tags: [
        'salaires',
        'retenue',
        'RH',
        'paie'
      ],

      popular: true
    },


    {
      id: 'retenue-salaires',

      title:
        'Déclaration de retenue obligatoire sur les salaires',

      shortTitle:
        'Déclaration retenue salaires',

      description:
        'Modèle officiel relatif à la déclaration des retenues obligatoires sur les salaires.',

      category: 'retenue',

      categoryLabel: 'Retenues',

      audience: [
        'entreprise',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      date: '2026',

      url:
        'https://dgi.bf/imprimes/',

      source: 'DGI Burkina Faso',

      tags: [
        'salaires',
        'retenue',
        'IUTS',
        'entreprise'
      ]
    },


    {
      id: 'benefices-bic',

      title:
        'Déclaration des bénéfices industriels et commerciaux',

      shortTitle:
        'Déclaration BIC',

      description:
        'Modèle de déclaration relatif aux bénéfices industriels et commerciaux.',

      category: 'declaration',

      categoryLabel: 'Déclarations',

      audience: [
        'entreprise',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      date: '2026',

      url:
        'https://dgi.bf/imprimes/',

      source: 'DGI Burkina Faso',

      tags: [
        'BIC',
        'bénéfices',
        'déclaration',
        'entreprise'
      ],

      popular: true
    },


    {
      id: 'benefices-bnc',

      title:
        'Déclaration des bénéfices non commerciaux',

      shortTitle:
        'Déclaration BNC',

      description:
        'Modèle de déclaration relatif aux bénéfices issus des activités non commerciales.',

      category: 'declaration',

      categoryLabel: 'Déclarations',

      audience: [
        'entreprise',
        'particulier',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      date: '2026',

      url:
        'https://dgi.bf/imprimes/',

      source: 'DGI Burkina Faso',

      tags: [
        'BNC',
        'déclaration',
        'revenus'
      ]
    },


    {
      id: 'societes-is',

      title:
        'Déclaration des bénéfices soumis à l’impôt sur les sociétés',

      shortTitle:
        'Déclaration IS',

      description:
        'Document destiné à la déclaration des bénéfices soumis à l’impôt sur les sociétés.',

      category: 'entreprise',

      categoryLabel: 'Entreprise',

      audience: [
        'entreprise',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      date: '2026',

      url:
        'https://dgi.bf/imprimes/',

      source: 'DGI Burkina Faso',

      tags: [
        'IS',
        'société',
        'bénéfices',
        'entreprise'
      ],

      featured: true
    },


    {
      id: 'acomptes-provisionnels',

      title:
        'Déclaration des acomptes provisionnels',

      shortTitle:
        'Acomptes provisionnels',

      description:
        'Modèle officiel destiné à la déclaration des acomptes provisionnels.',

      category: 'declaration',

      categoryLabel: 'Déclarations',

      audience: [
        'entreprise',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      date: '2026',

      url:
        'https://dgi.bf/imprimes/',

      source: 'DGI Burkina Faso',

      tags: [
        'acomptes',
        'impôts',
        'entreprise'
      ]
    },


    {
      id: 'remboursement-tva-ong',

      title:
        'Demande de remboursement de TVA des ONG et associations',

      shortTitle:
        'Remboursement TVA ONG',

      description:
        'Formulaire destiné aux organisations et associations concernées par les dispositifs de remboursement de TVA.',

      category: 'tva',

      categoryLabel: 'TVA',

      audience: [
        'entreprise',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      date: '2026',

      url:
        'https://dgi.bf/imprimes/',

      source: 'DGI Burkina Faso',

      tags: [
        'TVA',
        'ONG',
        'association'
      ]
    },


    {
      id: 'retenue-prestataires',

      title:
        'Déclaration de retenue à la source sur les sommes versées aux prestataires',

      shortTitle:
        'Retenue prestataires',

      description:
        'Modèle de déclaration des retenues à la source opérées sur les sommes versées aux prestataires établis au Burkina Faso.',

      category: 'retenue',

      categoryLabel: 'Retenues',

      audience: [
        'entreprise',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      date: '2026',

      url:
        'https://dgi.bf/imprimes/',

      source: 'DGI Burkina Faso',

      tags: [
        'retenue',
        'prestataire',
        'source'
      ]
    },


    {
      id: 'commandes-publiques',

      title:
        'Déclaration de retenues à la source sur les commandes publiques',

      shortTitle:
        'Retenue commandes publiques',

      description:
        'Document relatif aux retenues opérées dans le cadre des commandes publiques.',

      category: 'entreprise',

      categoryLabel: 'Entreprise',

      audience: [
        'entreprise',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      date: '2026',

      url:
        'https://dgi.bf/imprimes/',

      source: 'DGI Burkina Faso',

      tags: [
        'commande publique',
        'retenue',
        'marchés publics'
      ]
    },


    {
      id: 'liasse-fiscale',

      title:
        'Liasse fiscale',

      shortTitle:
        'Liasse fiscale',

      description:
        'Ensemble des documents et états nécessaires à la production de la liasse fiscale.',

      category: 'comptabilite',

      categoryLabel: 'Comptabilité',

      audience: [
        'entreprise',
        'comptable'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      date: '2026',

      url:
        'https://dgi.bf/imprimes/',

      source: 'DGI Burkina Faso',

      tags: [
        'liasse',
        'comptabilité',
        'OHADA',
        'fiscalité'
      ],

      popular: true,

      featured: true
    },


    {
      id: 'droits-timbre',

      title:
        'Déclaration des droits de timbre payés sur états',

      shortTitle:
        'Droits de timbre',

      description:
        'Modèle relatif à la déclaration des droits de timbre payés sur états.',

      category: 'juridique',

      categoryLabel: 'Juridique',

      audience: [
        'entreprise',
        'comptable',
        'particulier'
      ],

      format: 'PDF',

      size: 'PDF',

      official: true,

      verified: true,

      date: '2026',

      url:
        'https://dgi.bf/imprimes/',

      source: 'DGI Burkina Faso',

      tags: [
        'timbre',
        'droits',
        'déclaration'
      ]
    }

  ];


  /* =========================================================
     COMPUTED
  ========================================================= */

  readonly filteredDocuments =
    computed(() => {

      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const category =
        this.activeCategory();

      const audience =
        this.activeAudience();

      const onlyFavorites =
        this.showOnlyFavorites();

      return this.documents.filter(document => {

        const matchesSearch =
          !search ||
          document.title.toLowerCase().includes(search) ||
          document.description.toLowerCase().includes(search) ||
          document.tags.some(tag =>
            tag.toLowerCase().includes(search)
          );

        const matchesCategory =
          category === 'all' ||
          document.category === category;

        const matchesAudience =
          audience === 'all' ||
          document.audience.includes(audience) ||
          document.audience.includes('tous');

        const matchesFavorite =
          !onlyFavorites ||
          this.isFavorite(document.id);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesAudience &&
          matchesFavorite
        );

      });

    });


  readonly featuredDocuments =
    computed(() =>
      this.documents.filter(
        document => document.featured
      )
    );


  readonly popularDocuments =
    computed(() =>
      this.documents.filter(
        document => document.popular
      )
    );


  readonly totalDocuments =
    computed(() =>
      this.documents.length
    );


  readonly totalCategories =
    computed(() =>
      new Set(
        this.documents.map(
          document => document.category
        )
      ).size
    );


  readonly officialDocuments =
    computed(() =>
      this.documents.filter(
        document => document.official
      ).length
    );


  /* =========================================================
     ACTIONS
  ========================================================= */

  setCategory(
    category: DocumentCategory | 'all'
  ): void {

    this.activeCategory.set(category);

  }


  setAudience(
    audience: DocumentAudience | 'all'
  ): void {

    this.activeAudience.set(audience);

  }


  onSearch(value: string): void {

    this.searchTerm.set(value);

  }


  openDocument(
    document: FiscalDocument
  ): void {

    this.selectedDocument.set(document);

  }


  closeDocument(): void {

    this.selectedDocument.set(null);

  }


  toggleFavorite(
    id: string
  ): void {

    const current =
      this.favorites();

    if (current.includes(id)) {

      this.favorites.set(
        current.filter(
          item => item !== id
        )
      );

    } else {

      this.favorites.set([
        ...current,
        id
      ]);

    }

  }


  isFavorite(
    id: string
  ): boolean {

    return this.favorites()
      .includes(id);

  }


  toggleFavoritesOnly(): void {

    this.showOnlyFavorites.update(
      value => !value
    );

  }


  resetFilters(): void {

    this.searchTerm.set('');

    this.activeCategory.set('all');

    this.activeAudience.set('all');

    this.showOnlyFavorites.set(false);

  }


  categoryIcon(
    category: DocumentCategory
  ): string {

    return this.categories
      .find(
        item => item.id === category
      )?.icon ?? '▦';

  }


  openOfficialSource(): void {

    window.open(
      'https://dgi.bf/imprimes/',
      '_blank',
      'noopener,noreferrer'
    );

  }

}