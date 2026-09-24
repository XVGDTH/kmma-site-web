import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Article {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  content: string[];
  image: string;
  imageAlt: string;
  author: string;
  authorRole: string;
  authorImage: string;
  date: string;
  readTime: string;
}

@Component({
  selector: 'app-actualite-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './actualite-detail.html',
  styleUrl: './actualite-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActualiteDetail {

  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.convergesas.com/api';

  private readonly apiArticle = signal<Article | null>(null);

  private readonly categoryKeys: Record<string, string> = {
    formation: 'Formation', entreprise: 'Entreprise', evenement: 'Ã‰vÃ©nement',
    ressources: 'Ressources', 'vie-kmaa': 'Vie KMAA', carriere: 'CarriÃ¨re',
  };

  readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' }
  );

  constructor() {
    effect(() => {
      const slug = this.slug();
      if (!slug) return;

      this.http
        .get<{ data: any }>(`${this.apiUrl}/news-articles/${encodeURIComponent(slug)}`)
        .subscribe({
          next: (res) => {
            const d = res?.data;
            if (!d?.title) return;

            this.apiArticle.set({
              slug: String(d.slug ?? slug),
              category: this.categoryKeys[d.category] ?? d.category ?? 'ActualitÃ©',
              title: d.title,
              excerpt: d.excerpt ?? '',
              content: Array.isArray(d.content) && d.content.length
                ? d.content
                : [String(d.excerpt ?? '')],
              image: d.image ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
              imageAlt: d.imageAlt ?? d.title,
              author: d.author ?? 'Ã‰quipe KMAA',
              authorRole: d.authorRole ?? 'Communication',
              authorImage: d.authorImage ?? d.authorAvatar ?? '',
              date: d.date ?? '',
              readTime: d.readTime ?? '4 min',
            });
          },
          error: () => {},   // â†’ fallback sur le tableau statique
        });
    });
  }

  // ============================================================
  // FILET DE SÃ‰CURITÃ‰ STATIQUE (inchangÃ©)
  // ============================================================

  readonly articles: Article[] = [
    // ... TON TABLEAU DE 12 ARTICLES â€” NE LE TOUCHE PAS ...
    // ... de { slug: 'formation-continue-carrieres', ... }
    // ... jusqu'Ã  { slug: 'ceremonie-diplomes-2026', ... },
  ];

  // ============================================================
  // âœ… UN SEUL `article` : API prioritaire, statique en secours
  //    (L'ANCIEN computed EN BAS DU FICHIER EST SUPPRIMÃ‰ !)
  // ============================================================

  readonly article = computed(() =>
    this.apiArticle() ??
    this.articles.find((a) => a.slug === this.slug()) ??
    null
  );
}