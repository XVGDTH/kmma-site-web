import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface PreviewArticle {
  title: string;
  category: string;
  excerpt: string;
  date: string;
  route: string;
}

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './newsletter.html',
  styleUrl: './newsletter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Newsletter {

  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  // ============================================================
  // DÉSINSCRIPTION (via lien email : /newsletter?token=xxx)
  // ============================================================

  readonly unsubscribeToken = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('token'))),
    { initialValue: null as string | null }
  );

  readonly unsubscribeMessage = signal<string | null>(null);
  readonly unsubscribeError = signal<string | null>(null);

  // ============================================================
  // INSCRIPTION
  // ============================================================

  readonly name = signal('');
  readonly email = signal('');
  readonly sending = signal(false);
  readonly success = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  // ============================================================
  // APERÇU DES DERNIERS CONTENUS (blog + actualités)
  // ============================================================

  readonly latestArticles = signal<PreviewArticle[]>([]);

  readonly articlesLoaded = computed(() => this.latestArticles().length > 0);

  constructor() {
    // 1. Gestion du lien de désinscription
    effect(() => {
      const token = this.unsubscribeToken();
      if (token) this.processUnsubscribe(token);
    });

    // 2. Chargement des derniers articles (aperçu "ce que vous recevez")
    this.loadLatestArticles();
  }

  private processUnsubscribe(token: string): void {
    this.http
      .get<{ message: string }>(
        `${this.apiUrl}/newsletter/unsubscribe/${encodeURIComponent(token)}`
      )
      .subscribe({
        next: (res) => this.unsubscribeMessage.set(res.message),
        error: (err) => this.unsubscribeError.set(
          err?.error?.message ?? 'Lien de désinscription invalide.'
        ),
      });
  }

  private loadLatestArticles(): void {
    this.http
      .get<{ data: any[] }>(`${this.apiUrl}/blog-posts`)
      .subscribe({
        next: (res) => {
          const articles = (res.data ?? []).slice(0, 3).map((raw: any) => ({
            title: raw.title,
            category: raw.category ?? 'KMAA',
            excerpt: raw.excerpt ?? '',
            date: raw.date ?? '',
            route: raw.route ?? '/blog',
          }));
          this.latestArticles.set(articles);
        },
        error: () => {}, // section simplement masquée si l'API est down
      });
  }

  // ============================================================
  // SOUMISSION
  // ============================================================

  onEmailInput(value: string): void {
    this.email.set(value);
  }

  onNameInput(value: string): void {
    this.name.set(value);
  }

  subscribe(): void {
    const email = this.email().trim();
    if (this.sending()) return;

    if (!email.includes('@')) {
      this.error.set('Veuillez saisir une adresse email valide.');
      return;
    }

    this.sending.set(true);
    this.error.set(null);

    this.http
      .post<{ message: string }>(`${this.apiUrl}/newsletter/subscribe`, {
        email,
        name: this.name().trim() || null,
      })
      .subscribe({
        next: (res) => {
          this.sending.set(false);
          this.success.set(res.message);
        },
        error: (err) => {
          this.sending.set(false);
          this.error.set(
            err?.error?.message ?? "Impossible de finaliser votre inscription."
          );
        },
      });
  }
}