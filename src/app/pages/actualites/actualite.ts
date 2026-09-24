import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type ArticleCategory =
  | 'formation' | 'entreprise' | 'evenement' | 'ressources' | 'vie-kmaa' | 'carriere';

interface Article {
  id: string;
  category: ArticleCategory;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  featured?: boolean;
  route: string;
}

interface CategoryFilter {
  id: ArticleCategory | 'tous';
  label: string;
}

@Component({
  selector: 'app-actualites',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './actualites.html',
  styleUrl: './actualites.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Actualites {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.convergesas.com/api';

  readonly activeCategory = signal<CategoryFilter['id']>('tous');
  readonly searchQuery = signal('');

  readonly categories: CategoryFilter[] = [
    { id: 'tous', label: 'Tout' },
    { id: 'formation', label: 'Formation' },
    { id: 'entreprise', label: 'Entreprise' },
    { id: 'evenement', label: 'Ã‰vÃ©nements' },
    { id: 'carriere', label: 'CarriÃ¨re' },
    { id: 'ressources', label: 'Ressources' },
    { id: 'vie-kmaa', label: 'Vie KMAA' },
  ];

  readonly categoryLabels: Record<ArticleCategory, string> = {
    formation: 'Formation',
    entreprise: 'Entreprise',
    evenement: 'Ã‰vÃ©nement',
    ressources: 'Ressources',
    'vie-kmaa': 'Vie KMAA',
    carriere: 'CarriÃ¨re',
  };

  /**
   * âœ… Contenu statique par dÃ©faut â€” remplacÃ© automatiquement
   * par les actualitÃ©s de la base de donnÃ©es dÃ¨s que l'API en renvoie.
   */
  readonly articles = signal<Article[]>([
    {
      id: 'art-01',
      category: 'formation',
      title: "Comment la formation continue transforme les carriÃ¨res en Afrique de l'Ouest",
      excerpt: "Une Ã©tude de terrain menÃ©e auprÃ¨s de nos anciens apprenants rÃ©vÃ¨le l'impact concret des parcours certifiants sur l'Ã©volution professionnelle.",
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80',
      imageAlt: "Jeune professionnelle noire souriante travaillant sur un ordinateur portable",
      author: 'AÃ¯cha OuÃ©draogo',
      authorRole: 'Responsable pÃ©dagogique KMAA',
      authorAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80',
      date: '28 aoÃ»t 2026',
      readTime: '6 min',
      featured: true,
      route: '/actualites/formation-continue-carrieres',
    },
    {
      id: 'art-02',
      category: 'entreprise',
      title: 'KMAA Entreprise : 12 PME accompagnÃ©es dans leur transformation digitale',
      excerpt: "Retour sur un semestre d'accompagnement auprÃ¨s d'entreprises burkinabÃ¨ engagÃ©es dans la modernisation de leurs outils de gestion.",
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
      imageAlt: "Ã‰quipe de professionnels noirs en rÃ©union autour d'un ordinateur",
      author: 'Boureima Sawadogo',
      authorRole: 'Consultant KMAA Entreprise',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      date: '24 aoÃ»t 2026',
      readTime: '5 min',
      featured: true,
      route: '/actualites/kmaa-entreprise-transformation-digitale',
    },
    {
      id: 'art-03',
      category: 'evenement',
      title: 'JournÃ©e portes ouvertes KMAA : le programme complet',
      excerpt: "Ateliers, tÃ©moignages d'anciens apprenants et rencontres avec nos formateurs â€” tout ce qu'il faut savoir avant de venir.",
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
      imageAlt: 'Public divers assistant Ã  une confÃ©rence dans une salle moderne',
      author: 'Ã‰quipe KMAA',
      authorRole: 'Communication',
      authorAvatar: 'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=200&q=80',
      date: '20 aoÃ»t 2026',
      readTime: '3 min',
      featured: true,
      route: '/actualites/journee-portes-ouvertes',
    },
    {
      id: 'art-04',
      category: 'carriere',
      title: '5 compÃ©tences Ã  mettre en avant sur votre CV aprÃ¨s une formation certifiante',
      excerpt: "Nos conseillers carriÃ¨re partagent leurs meilleures pratiques pour valoriser un parcours KMAA auprÃ¨s des recruteurs.",
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80',
      imageAlt: "Deux professionnels mÃ©tis Ã©changeant un entretien de recrutement",
      author: 'Fatou Zongo',
      authorRole: 'ConseillÃ¨re insertion professionnelle',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
      date: '17 aoÃ»t 2026',
      readTime: '4 min',
      route: '/actualites/valoriser-formation-cv',
    },
    {
      id: 'art-05',
      category: 'ressources',
      title: 'ModÃ¨le gratuit : votre premier tableau de bord de contrÃ´le de gestion',
      excerpt: "TÃ©lÃ©chargez notre modÃ¨le Excel pas Ã  pas pour structurer le suivi budgÃ©taire de votre organisation dÃ¨s aujourd'hui.",
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
      imageAlt: "Analyse de graphiques financiers sur un Ã©cran d'ordinateur",
      author: 'Moussa KaborÃ©',
      authorRole: 'Formateur contrÃ´le de gestion',
      authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
      date: '14 aoÃ»t 2026',
      readTime: '2 min',
      route: '/actualites/modele-tableau-bord-controle-gestion',
    },
    {
      id: 'art-06',
      category: 'vie-kmaa',
      title: 'Portrait : Fatou, de la reconversion Ã  la certification',
      excerpt: "AprÃ¨s 8 mois d'accompagnement personnalisÃ©, Fatou a rejoint une Ã©quipe de gestion administrative Ã  Ouagadougou.",
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&q=80',
      imageAlt: "Portrait souriant d'une jeune femme noire en tenue professionnelle",
      author: 'RÃ©daction KMAA',
      authorRole: "Vie de l'Ã©cole",
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
      date: '10 aoÃ»t 2026',
      readTime: '5 min',
      route: '/histoires/parcours-fatou',
    },
    {
      id: 'art-07',
      category: 'formation',
      title: 'Nouveau parcours : Data Analyst, la formation qui monte',
      excerpt: "Face Ã  la demande croissante des entreprises locales, KMAA lance un nouveau parcours dÃ©diÃ© Ã  l'analyse de donnÃ©es.",
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      imageAlt: 'Ã‰cran affichant des tableaux de bord de donnÃ©es colorÃ©s',
      author: 'Ibrahim TraorÃ©',
      authorRole: 'Responsable pÃ©dagogique Tech & Data',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      date: '6 aoÃ»t 2026',
      readTime: '4 min',
      route: '/actualites/nouveau-parcours-data-analyst',
    },
    {
      id: 'art-08',
      category: 'entreprise',
      title: "Pourquoi de plus en plus de PME choisissent l'audit interne externalisÃ©",
      excerpt: "DÃ©cryptage d'une tendance de fond dans la gestion des risques des petites et moyennes entreprises burkinabÃ¨.",
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
      imageAlt: 'Documents financiers et calculatrice sur un bureau',
      author: 'Boureima Sawadogo',
      authorRole: 'Consultant KMAA Entreprise',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      date: '2 aoÃ»t 2026',
      readTime: '6 min',
      route: '/actualites/audit-interne-externalise-pme',
    },
    {
      id: 'art-09',
      category: 'carriere',
      title: 'Se reconvertir aprÃ¨s 35 ans : ce que nos apprenants nous ont appris',
      excerpt: "La reconversion professionnelle n'a pas d'Ã¢ge. TÃ©moignages et conseils pratiques pour se lancer sereinement.",
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&q=80',
      imageAlt: "Professionnel noir d'Ã¢ge mÃ»r souriant lors d'un entretien",
      author: 'Fatou Zongo',
      authorRole: 'ConseillÃ¨re insertion professionnelle',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
      date: '29 juillet 2026',
      readTime: '5 min',
      route: '/actualites/reconversion-apres-35-ans',
    },
    {
      id: 'art-10',
      category: 'evenement',
      title: 'Retour sur le forum emploi KMAA x entreprises partenaires',
      excerpt: "Plus de 200 apprenants ont rencontrÃ© nos entreprises partenaires lors de cette Ã©dition placÃ©e sous le signe de l'insertion.",
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80',
      imageAlt: "Groupe de jeunes professionnels divers en discussion lors d'un Ã©vÃ©nement",
      author: 'Ã‰quipe KMAA',
      authorRole: 'Communication',
      authorAvatar: 'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=200&q=80',
      date: '25 juillet 2026',
      readTime: '4 min',
      route: '/actualites/forum-emploi-kmaa',
    },
    {
      id: 'art-11',
      category: 'ressources',
      title: 'Guide pratique : rÃ©ussir son entretien de certification',
      excerpt: "Toutes les Ã©tapes, les erreurs Ã  Ã©viter et les conseils de nos formateurs pour aborder sereinement votre Ã©valuation finale.",
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
      imageAlt: "Personne prenant des notes lors d'une session de prÃ©paration",
      author: 'Moussa KaborÃ©',
      authorRole: 'Formateur contrÃ´le de gestion',
      authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
      date: '21 juillet 2026',
      readTime: '7 min',
      route: '/actualites/guide-reussir-entretien-certification',
    },
    {
      id: 'art-12',
      category: 'vie-kmaa',
      title: 'KMAA fÃªte ses nouveaux diplÃ´mÃ©s 2026',
      excerpt: "Retour en images sur la cÃ©rÃ©monie de remise de diplÃ´mes qui a rÃ©uni apprenants, formateurs et partenaires.",
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
      imageAlt: "Groupe de diplÃ´mÃ©s noirs et mÃ©tis cÃ©lÃ©brant avec des toques de graduation",
      author: 'RÃ©daction KMAA',
      authorRole: "Vie de l'Ã©cole",
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
      date: '15 juillet 2026',
      readTime: '3 min',
      route: '/actualites/ceremonie-diplomes-2026',
    },
  ]);

  // ============================================================
  // CHARGEMENT DEPUIS L'API LARAVEL
  // ============================================================

  constructor() {
    this.http
      .get<{ data: unknown[] }>(`${this.apiUrl}/news-articles`)
      .subscribe({
        next: (res) => {
          const mapped = (res.data ?? [])
            .map((raw) => this.mapApiArticle(raw))
            .filter((a): a is Article => a !== null);

          // On ne remplace le contenu statique que si l'API
          // renvoie rÃ©ellement des articles publiÃ©s.
          if (mapped.length > 0) {
            this.articles.set(mapped);
          }
        },
        error: (err) =>
          console.warn('ActualitÃ©s API indisponible â€” contenu statique affichÃ©.', err),
      });
  }

  private mapApiArticle(raw: any): Article | null {
    if (!raw?.title) return null;
    const dateIso: string = raw.dateIso ?? new Date().toISOString().slice(0, 10);

    return {
      id: String(raw.id ?? raw.slug),
      category: raw.category,
      title: raw.title,
      excerpt: raw.excerpt ?? '',
      image: raw.image ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
      imageAlt: raw.imageAlt ?? raw.title,
      author: raw.author ?? 'Ã‰quipe KMAA',
      authorRole: raw.authorRole ?? 'Communication',
      authorAvatar: raw.authorAvatar ?? raw.authorImage ?? 'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=200&q=80',
      date: raw.date ?? dateIso,
      readTime: raw.readTime ?? '4 min',
      featured: Boolean(raw.featured),
      route: raw.route ?? `/actualites/${raw.slug ?? raw.id}`,
    };
  }

  // ============================================================
  // DÃ‰RIVÃ‰S
  // ============================================================

  readonly featuredArticles = computed(() => this.articles().filter((a) => a.featured));

  readonly filteredArticles = computed(() => {
    const category = this.activeCategory();
    const query = this.searchQuery().trim().toLowerCase();

    let list = this.articles().filter((a) => !a.featured);

    if (category !== 'tous') {
      list = list.filter((a) => a.category === category);
    }

    if (query) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query),
      );
    }

    return list;
  });

    readonly newsletterEmail = signal('');
  readonly newsletterSubmitted = signal(false);
  readonly newsletterError = signal<string | null>(null);

  subscribeNewsletter(email: string): void {
    const clean = email.trim();
    if (!clean.includes('@')) {
      this.newsletterError.set('Veuillez saisir une adresse email valide.');
      return;
    }

    this.http
      .post<{ message: string }>(`${this.apiUrl}/newsletter/subscribe`, { email: clean })
      .subscribe({
        next: () => this.newsletterSubmitted.set(true),
        error: (err) => this.newsletterError.set(
          err?.error?.message ?? "Impossible de finaliser l'inscription."
        ),
      });
  }

  // ============================================================
  // ACTIONS
  // ============================================================

  setCategory(category: CategoryFilter['id']): void {
    this.activeCategory.set(category);
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
  }
}