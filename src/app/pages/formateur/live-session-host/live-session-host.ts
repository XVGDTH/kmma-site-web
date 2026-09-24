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
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { LiveSessionService } from '../../../shared/live-session.service';
import { AuthService } from '../../../shared/auth.service';

const API_URL = 'https://api.convergesas.com/api';

@Component({
  selector: 'app-live-session-host',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './live-session-host.html',
  styleUrl: './live-session-host.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveSessionHost {

  private readonly route = inject(ActivatedRoute);
  private readonly liveService = inject(LiveSessionService);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  /** ID ou slug du cours, depuis l'URL. */
  readonly courseId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' }
  );

  // ----------------------------------------------------------
  // Cours chargÃ© depuis l'API
  // ----------------------------------------------------------

  readonly course = signal<{ title: string } | null>(null);
  readonly courseLoaded = signal(false);

  // ----------------------------------------------------------
  // Session + Zoom
  // ----------------------------------------------------------

  readonly session = computed(() => this.liveService.getSession(this.courseId()));
  readonly isLive = computed(() => this.session()?.isLive ?? false);

  /** Vrai nom du formateur connectÃ© */
  readonly displayName = computed(
    () => this.authService.currentUser()?.name ?? 'Formateur KMAA'
  );

  /** URL Zoom pour le formateur (host) */
  readonly hostUrl = signal<string | null>(null);

  /** Ã‰tat de chargement */
  readonly starting = signal(false);
  readonly loadingHostUrl = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.courseId();
      if (!id) return;

      this.http
        .get<{ data: { title: string } }>(
          `${API_URL}/courses/${encodeURIComponent(id)}`
        )
        .subscribe({
          next: (res) => {
            this.course.set(res.data);
            this.courseLoaded.set(true);
          },
          error: () => {
            this.course.set(null);
            this.courseLoaded.set(true);
          },
        });
    });
  }

  // ----------------------------------------------------------
  // DÃ©marrer la session Zoom (crÃ©ation de la rÃ©union)
  // ----------------------------------------------------------
  startSession(): void {
    if (this.starting()) return;

    this.starting.set(true);
    this.error.set(null);

    this.liveService.startSession(
      this.courseId(),
      (hostUrl) => {
        this.hostUrl.set(hostUrl);
        this.starting.set(false);

        // Ouvre Zoom immÃ©diatement pour l'hÃ´te
        window.open(hostUrl, '_blank', 'noopener,noreferrer');
      },
      (msg) => {
        this.error.set(msg);
        this.starting.set(false);
      }
    );
  }

  // ----------------------------------------------------------
  // RÃ©cupÃ©rer le start_url (hÃ´te) si on a rechargÃ© la page
  // ----------------------------------------------------------
  openHostRoom(): void {
    if (this.loadingHostUrl()) return;

    this.loadingHostUrl.set(true);
    this.error.set(null);

    this.liveService.getHostUrl(
      this.courseId(),
      (url) => {
        this.hostUrl.set(url);
        this.loadingHostUrl.set(false);
        window.open(url, '_blank', 'noopener,noreferrer');
      },
      (msg) => {
        this.error.set(msg);
        this.loadingHostUrl.set(false);
      }
    );
  }

  // ----------------------------------------------------------
  // Terminer la session
  // ----------------------------------------------------------
  endSession(): void {
    this.liveService.endSession(this.courseId());
    this.hostUrl.set(null);
  }
}