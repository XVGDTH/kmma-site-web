import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type BlogCategory =
  | 'tous'
  | 'finance'
  | 'comptabilite'
  | 'fiscalite'
  | 'audit'
  | 'gestion'
  | 'entreprise'
  | 'carriere'
  | 'formation';

type ContentKind = 'tous' | 'article' | 'guide' | 'actualite' | 'conseil';
type SortMode = 'recent' | 'popular' | 'reading';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: Exclude<BlogCategory, 'tous'>;
  kind: Exclude<ContentKind, 'tous'>;
  image: string;
  imageAlt: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  date: string;
  dateIso: string;
  readTime: string;
  readMinutes: number;
  featured?: boolean;
  popular?: boolean;
  route: string;
  tags: string[];
  level?: 'Débutant' | 'Intermédiaire' | 'Avancé';
  audience?: string;
}

interface GuideCollection {
  id: string;
  icon: string;
  title: string;
  description: string;
  count: number;
  category: Exclude<BlogCategory, 'tous'>;
  accent: string;
}

interface BlogTool {
  icon: string;
  title: string;
  description: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blog {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  readonly apiLoaded = signal(false);

  readonly activeCategory = signal<BlogCategory>('tous');
  readonly activeKind = signal<ContentKind>('tous');
  readonly searchTerm = signal('');
  readonly sortMode = signal<SortMode>('recent');
  readonly newsletterEmail = signal('');
  readonly newsletterSubmitted = signal(false);
  readonly newsletterError = signal<string | null>(null);
  readonly favorites = signal<Set<string>>(new Set());

  readonly categories: { id: BlogCategory; label: string; icon: string }[] = [
    { id: 'tous', label: 'Tous', icon: '◈' },
    { id: 'finance', label: 'Finance', icon: '₣' },
    { id: 'comptabilite', label: 'Comptabilité', icon: '▤' },
    { id: 'fiscalite', label: 'Fiscalité', icon: '◫' },
    { id: 'audit', label: 'Audit', icon: '✓' },
    { id: 'gestion', label: 'Gestion', icon: '↗' },
    { id: 'entreprise', label: 'Entreprise', icon: '⌂' },
    { id: 'carriere', label: 'Carrière', icon: '◆' },
    { id: 'formation', label: 'Formation', icon: '▣' },
  ];

  readonly kinds: { id: ContentKind; label: string }[] = [
    { id: 'tous', label: 'Tous les formats' },
    { id: 'article', label: 'Articles' },
    { id: 'guide', label: 'Guides' },
    { id: 'actualite', label: 'Actualités' },
    { id: 'conseil', label: 'Conseils' },
  ];

  /**
   * ✅ Contenu statique par défaut (affiché immédiatement).
   * Remplacé automatiquement par les articles de la base de
   * données dès que l'API /blog-posts en renvoie.
   */
  readonly posts = signal<BlogPost[]>([
    {
      id: 'finance-tresorerie',
      title: 'Gestion de trésorerie : les indicateurs financiers que tout dirigeant devrait suivre',
      excerpt: 'Trésorerie nette, BFR, capacité d’autofinancement et cash-flow : découvrez les indicateurs essentiels pour piloter la santé financière d’une entreprise.',
      category: 'finance', kind: 'article',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=85',
      imageAlt: 'Analyse financière et gestion de trésorerie',
      author: 'Issouf Ouédraogo', authorRole: 'Expert financier',
      authorAvatar: 'https://i.pravatar.cc/100?img=12',
      date: '03 septembre 2026', dateIso: '2026-09-03', readTime: '9 min', readMinutes: 9,
      featured: true, popular: true,
      route: '/blog/gestion-tresorerie-indicateurs',
      tags: ['trésorerie', 'finance', 'PME', 'gestion financière'],
      level: 'Intermédiaire', audience: 'Dirigeants & PME',
    },
    {
      id: 'guide-tva-burkina',
      title: 'Guide pratique de la TVA : comprendre, calculer et préparer sa déclaration',
      excerpt: 'Un parcours structuré pour comprendre la logique de la TVA, organiser ses pièces et éviter les erreurs courantes avant la déclaration.',
      category: 'fiscalite', kind: 'guide',
      image: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=1200&q=85',
      imageAlt: 'Documents fiscaux et calculatrice',
      author: 'Équipe KMAA', authorRole: 'Pôle fiscalité', authorAvatar: 'https://i.pravatar.cc/100?img=8',
      date: '02 septembre 2026', dateIso: '2026-09-02', readTime: '14 min', readMinutes: 14,
      popular: true, route: '/blog/guide-tva',
      tags: ['TVA', 'déclaration', 'fiscalité', 'entreprise'], level: 'Débutant', audience: 'Entrepreneurs & comptables',
    },
    {
      id: 'expert-comptable',
      title: 'Expert-comptable : quelles sont réellement ses missions auprès d’une PME ?',
      excerpt: 'Bien plus qu’un producteur d’états financiers, l’expert-comptable peut devenir un véritable partenaire stratégique du dirigeant.',
      category: 'comptabilite', kind: 'article',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1000&q=85',
      imageAlt: 'Expert-comptable travaillant sur les comptes d’une entreprise',
      author: 'Fatou Zongo', authorRole: 'Experte-comptable', authorAvatar: 'https://i.pravatar.cc/100?img=45',
      date: '01 septembre 2026', dateIso: '2026-09-01', readTime: '7 min', readMinutes: 7,
      popular: true, route: '/blog/missions-expert-comptable-pme',
      tags: ['expert-comptable', 'comptabilité', 'PME'], audience: 'PME',
    },
    {
      id: 'actualite-rentree-fiscale',
      title: 'Rentrée fiscale : 7 points à vérifier dans votre organisation avant la prochaine échéance',
      excerpt: 'Une synthèse opérationnelle pour remettre à niveau vos dossiers, responsabilités internes et preuves documentaires.',
      category: 'fiscalite', kind: 'actualite',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1000&q=85',
      imageAlt: 'Documents administratifs et stylo',
      author: 'Aïcha Ouédraogo', authorRole: 'Consultante fiscale', authorAvatar: 'https://i.pravatar.cc/100?img=47',
      date: '31 août 2026', dateIso: '2026-08-31', readTime: '6 min', readMinutes: 6,
      route: '/blog/rentree-fiscale-checklist', tags: ['actualité', 'échéances', 'organisation'], audience: 'Entreprises',
    },
    {
      id: 'bilan-comptable',
      title: 'Lire un bilan comptable : méthode simple pour comprendre la situation financière d’une entreprise',
      excerpt: 'Actif, passif, capitaux propres, dettes : apprenez à lire un bilan comptable sans être vous-même comptable.',
      category: 'comptabilite', kind: 'guide',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1000&q=85',
      imageAlt: 'Documents comptables et analyse financière',
      author: 'Moussa Coulibaly', authorRole: 'Formateur en comptabilité', authorAvatar: 'https://i.pravatar.cc/100?img=15',
      date: '29 août 2026', dateIso: '2026-08-29', readTime: '8 min', readMinutes: 8,
      popular: true, route: '/blog/lire-bilan-comptable',
      tags: ['bilan', 'comptabilité', 'analyse financière'], level: 'Débutant', audience: 'Étudiants & dirigeants',
    },
    {
      id: 'fiscalite-entreprise',
      title: 'Fiscalité d’entreprise : les principales obligations à connaître en tant que dirigeant',
      excerpt: 'Déclarations, échéances, obligations comptables et fiscales : les fondamentaux à maîtriser pour éviter les mauvaises surprises.',
      category: 'fiscalite', kind: 'guide',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1000&q=85',
      imageAlt: 'Documents fiscaux et calculs financiers',
      author: 'Aïcha Ouédraogo', authorRole: 'Consultante fiscale', authorAvatar: 'https://i.pravatar.cc/100?img=47',
      date: '27 août 2026', dateIso: '2026-08-27', readTime: '10 min', readMinutes: 10,
      route: '/blog/obligations-fiscales-entreprise',
      tags: ['fiscalité', 'entreprise', 'impôts'], level: 'Débutant', audience: 'Dirigeants',
    },
    {
      id: 'controle-gestion',
      title: 'Contrôle de gestion : comment transformer les chiffres en décisions stratégiques',
      excerpt: 'Le contrôle de gestion permet au dirigeant de comprendre ce qui fonctionne, ce qui coûte et où concentrer ses efforts.',
      category: 'gestion', kind: 'article',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1000&q=85',
      imageAlt: 'Réunion de travail et analyse des performances',
      author: 'Boureima Sawadogo', authorRole: 'Consultant en gestion', authorAvatar: 'https://i.pravatar.cc/100?img=33',
      date: '25 août 2026', dateIso: '2026-08-25', readTime: '8 min', readMinutes: 8,
      route: '/blog/controle-gestion-performance', tags: ['contrôle de gestion', 'performance', 'KPI'], audience: 'Managers',
    },
    {
      id: 'audit-financier',
      title: 'Audit financier : pourquoi une entreprise devrait-elle faire contrôler ses comptes ?',
      excerpt: 'L’audit ne se limite pas à rechercher des erreurs. Il contribue aussi à renforcer la fiabilité de l’information financière.',
      category: 'audit', kind: 'article',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&q=85',
      imageAlt: 'Réunion autour de documents financiers',
      author: 'David Kaboré', authorRole: 'Auditeur financier', authorAvatar: 'https://i.pravatar.cc/100?img=51',
      date: '22 août 2026', dateIso: '2026-08-22', readTime: '7 min', readMinutes: 7,
      route: '/blog/audit-financier-entreprise', tags: ['audit', 'contrôle', 'finance'], audience: 'Entreprises',
    },
    {
      id: 'business-plan',
      title: 'Business plan financier : les chiffres indispensables avant de lancer son entreprise',
      excerpt: 'Prévisions de chiffre d’affaires, charges, investissement, trésorerie et rentabilité : construisez un modèle financier cohérent.',
      category: 'entreprise', kind: 'guide',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&q=85',
      imageAlt: 'Tableau financier et stratégie d’entreprise',
      author: 'Aminata Kaboré', authorRole: 'Consultante entreprise', authorAvatar: 'https://i.pravatar.cc/100?img=20',
      date: '20 août 2026', dateIso: '2026-08-20', readTime: '11 min', readMinutes: 11,
      route: '/blog/business-plan-financier', tags: ['business plan', 'entrepreneuriat', 'finance'], level: 'Intermédiaire', audience: 'Entrepreneurs',
    },
    {
      id: 'ratios-financiers',
      title: '10 ratios financiers à connaître pour analyser la performance d’une entreprise',
      excerpt: 'Rentabilité, liquidité, solvabilité et structure financière : les ratios qui permettent de mieux interpréter les comptes.',
      category: 'finance', kind: 'guide',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&q=85',
      imageAlt: 'Graphiques et analyse financière',
      author: 'Issouf Ouédraogo', authorRole: 'Expert financier', authorAvatar: 'https://i.pravatar.cc/100?img=12',
      date: '18 août 2026', dateIso: '2026-08-18', readTime: '12 min', readMinutes: 12,
      popular: true, route: '/blog/ratios-financiers', tags: ['ratios', 'finance', 'analyse'], level: 'Intermédiaire', audience: 'Analystes & dirigeants',
    },
    {
      id: 'carriere-comptable',
      title: 'Devenir expert-comptable : compétences, parcours et réalités du métier',
      excerpt: 'Le métier évolue rapidement. Découvrez les compétences techniques et humaines recherchées dans les métiers de la comptabilité.',
      category: 'carriere', kind: 'conseil',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&q=85',
      imageAlt: 'Professionnels travaillant dans un bureau',
      author: 'Équipe KMAA', authorRole: 'KMAA Academy', authorAvatar: 'https://i.pravatar.cc/100?img=8',
      date: '15 août 2026', dateIso: '2026-08-15', readTime: '6 min', readMinutes: 6,
      route: '/blog/carriere-expertise-comptable', tags: ['carrière', 'comptabilité', 'expertise'], audience: 'Étudiants & professionnels',
    },
    {
      id: 'formation-comptable',
      title: 'Pourquoi se former régulièrement aux métiers de la finance et de la comptabilité ?',
      excerpt: 'Normes, outils numériques, fiscalité et pratiques professionnelles évoluent. La formation continue devient un véritable avantage compétitif.',
      category: 'formation', kind: 'conseil',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1000&q=85',
      imageAlt: 'Formation professionnelle en comptabilité',
      author: 'M. Martial YAOGO', authorRole: 'Formateur KMAA', authorAvatar: 'https://i.pravatar.cc/100?img=11',
      date: '12 août 2026', dateIso: '2026-08-12', readTime: '6 min', readMinutes: 6,
      route: '/blog/formation-continue-finance', tags: ['formation', 'finance', 'comptabilité'], audience: 'Professionnels',
    },
  ]);

  readonly guideCollections: GuideCollection[] = [
    { id: 'fiscalite', icon: '◫', title: 'Fiscalité & obligations', description: 'Déclarations, échéances, TVA et organisation fiscale expliquées pas à pas.', count: 8, category: 'fiscalite', accent: '01' },
    { id: 'comptabilite', icon: '▤', title: 'Comptabilité pratique', description: 'Lire les états financiers, organiser les pièces et comprendre les écritures essentielles.', count: 7, category: 'comptabilite', accent: '02' },
    { id: 'finance', icon: '₣', title: 'Finance & pilotage', description: 'Trésorerie, ratios, BFR, rentabilité et indicateurs utiles pour décider.', count: 6, category: 'finance', accent: '03' },
    { id: 'entreprise', icon: '⌂', title: 'Entrepreneuriat', description: 'Business plan, structuration, bonnes pratiques de gestion et croissance durable.', count: 5, category: 'entreprise', accent: '04' },
  ];

  readonly tools: BlogTool[] = [
    { icon: '▤', title: 'Guides pratiques', description: 'Des parcours structurés pour progresser étape par étape.', label: 'Explorer les guides', route: '/blog' },
    { icon: '⌗', title: 'Modèles professionnels', description: 'Retrouvez vos documents et modèles utiles au même endroit.', label: 'Voir les modèles', route: '/modeles-documents' },
    { icon: '◫', title: 'Calendrier fiscal', description: 'Anticipez vos échéances et organisez vos obligations fiscales.', label: 'Voir le calendrier', route: '/calendrier-fiscal' },
    { icon: '↗', title: 'Formation', description: 'Approfondissez vos compétences avec les parcours KMAA Academy.', label: 'Découvrir les formations', route: '/formations' },
  ];

  constructor() {
    this.loadPostsFromApi();
  }

  // ============================================================
  // CHARGEMENT DEPUIS L'API LARAVEL
  // ============================================================

  private loadPostsFromApi(): void {
    this.http
      .get<{ data: unknown[] }>(`${this.apiUrl}/blog-posts`)
      .subscribe({
        next: (res) => {
          const mapped = (res.data ?? [])
            .map((raw) => this.mapApiPost(raw))
            .filter((p): p is BlogPost => p !== null);

          // On ne remplace le contenu statique que si l'API
          // renvoie réellement des articles publiés.
          if (mapped.length > 0) {
            this.posts.set(mapped);
          }
          this.apiLoaded.set(true);
        },
        error: (err) => {
          console.warn('Blog API indisponible — contenu statique affiché.', err);
          this.apiLoaded.set(true);
        },
      });
  }

  private mapApiPost(raw: any): BlogPost | null {
    if (!raw?.title) return null;

    const validCategories = this.categories.map((c) => c.id);
    const category = validCategories.includes(raw.category) ? raw.category : 'gestion';
    const kinds = ['article', 'guide', 'actualite', 'conseil'];
    const kind = kinds.includes(raw.kind) ? raw.kind : 'article';
    const dateIso: string = raw.dateIso ?? new Date().toISOString().slice(0, 10);

    return {
      id: String(raw.id ?? raw.slug),
      title: raw.title,
      excerpt: raw.excerpt ?? '',
      category: category as BlogPost['category'],
      kind: kind as BlogPost['kind'],
      image: raw.image ?? 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1000&q=85',
      imageAlt: raw.imageAlt ?? raw.title,
      author: raw.author ?? 'Équipe KMAA',
      authorRole: raw.authorRole ?? 'KMAA Academy',
      authorAvatar: raw.authorAvatar ?? 'https://i.pravatar.cc/100?img=8',
      date: raw.date ?? dateIso,
      dateIso,
      readTime: raw.readTime ?? '5 min',
      readMinutes: Number(raw.readMinutes) || 5,
      featured: Boolean(raw.featured),
      popular: Boolean(raw.popular),
      route: raw.route ?? `/blog/${raw.slug ?? raw.id}`,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      level: raw.level,
      audience: raw.audience,
    };
  }

  // ============================================================
  // DÉRIVÉS
  // ============================================================

  readonly featuredPost = computed(() => this.posts().find((post) => post.featured));
  readonly popularPosts = computed(() => this.posts().filter((post) => post.popular && !post.featured).slice(0, 3));
  readonly guidePosts = computed(() => this.posts().filter((post) => post.kind === 'guide').slice(0, 4));

  readonly filteredPosts = computed(() => {
    const category = this.activeCategory();
    const kind = this.activeKind();
    const term = this.searchTerm().trim().toLocaleLowerCase('fr');

    const results = this.posts()
      .filter((post) => !post.featured)
      .filter((post) => category === 'tous' || post.category === category)
      .filter((post) => kind === 'tous' || post.kind === kind)
      .filter((post) => {
        if (!term) return true;
        const searchable = [
          post.title, post.excerpt, post.author, post.authorRole,
          post.category, post.kind, post.audience ?? '', post.level ?? '', ...post.tags,
        ].join(' ').toLocaleLowerCase('fr');
        return searchable.includes(term);
      });

    return [...results].sort((a, b) => {
      if (this.sortMode() === 'popular') return Number(Boolean(b.popular)) - Number(Boolean(a.popular));
      if (this.sortMode() === 'reading') return a.readMinutes - b.readMinutes;
      return b.dateIso.localeCompare(a.dateIso);
    });
  });

  readonly articleCount = computed(() => this.posts().filter((post) => post.kind === 'article').length);
  readonly guideCount = computed(() => this.posts().filter((post) => post.kind === 'guide').length);
  readonly categoryCount = computed(() => this.categories.length - 1);
  readonly favoriteCount = computed(() => this.favorites().size);

  // ============================================================
  // ACTIONS
  // ============================================================

  setCategory(category: BlogCategory): void {
    this.activeCategory.set(category);
    this.scrollToArticles();
  }

  setKind(kind: ContentKind): void {
    this.activeKind.set(kind);
  }

  setSortMode(value: string): void {
    if (value === 'recent' || value === 'popular' || value === 'reading') {
      this.sortMode.set(value);
    }
  }

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.activeCategory.set('tous');
    this.activeKind.set('tous');
    this.sortMode.set('recent');
  }

  categoryLabel(category: Exclude<BlogCategory, 'tous'>): string {
    return this.categories.find((item) => item.id === category)?.label ?? category;
  }

  kindLabel(kind: Exclude<ContentKind, 'tous'>): string {
    const labels: Record<Exclude<ContentKind, 'tous'>, string> = {
      article: 'Article', guide: 'Guide', actualite: 'Actualité', conseil: 'Conseil',
    };
    return labels[kind];
  }

  toggleFavorite(postId: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const next = new Set(this.favorites());
    next.has(postId) ? next.delete(postId) : next.add(postId);
    this.favorites.set(next);
  }

  isFavorite(postId: string): boolean {
    return this.favorites().has(postId);
  }

  selectGuideCollection(collection: GuideCollection): void {
    this.activeCategory.set(collection.category);
    this.activeKind.set('guide');
    this.scrollToArticles();
  }

  // subscribeNewsletter(): void {
  //   const email = this.newsletterEmail().trim();
  //   if (!email || !email.includes('@')) return;
  //   this.newsletterSubmitted.set(true);
  // }


  subscribeNewsletter(): void {
    const email = this.newsletterEmail().trim();
    if (!email || !email.includes('@') || this.newsletterError()) return;

    this.http
      .post<{ message: string }>(`${this.apiUrl}/newsletter/subscribe`, { email })
      .subscribe({
        next: (res) => {
          this.newsletterSubmitted.set(true);
        },
        error: (err) => {
          this.newsletterError.set(
            err?.error?.message ?? "Impossible de finaliser l'inscription."
          );
        },
      });
  }

  onNewsletterInput(value: string): void {
    this.newsletterEmail.set(value);
  }

  scrollToGuides(): void {
    document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToArticles(): void {
    requestAnimationFrame(() => {
      document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}