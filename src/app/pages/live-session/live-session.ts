// import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
// import { ActivatedRoute, RouterLink } from '@angular/router';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { map } from 'rxjs/operators';
// import { COURSES } from '../../data/courses';
// import { LiveSessionService } from '../../shared/live-session.service';
// import { JitsiMeeting } from '../../shared/jitsi-meeting/jitsi-meeting';

// @Component({
//   selector: 'app-live-session',
//   standalone: true,
//   imports: [RouterLink, JitsiMeeting],
//   templateUrl: './live-session.html',
//   styleUrl: './live-session.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class LiveSession {
//   private readonly route = inject(ActivatedRoute);
//   private readonly liveService = inject(LiveSessionService);

//   readonly courseId = toSignal(
//     this.route.paramMap.pipe(map(p => p.get('id') ?? '')),
//     { initialValue: '' }
//   );

//   readonly course = computed(() => COURSES.find(c => c.id === this.courseId()));
//   readonly session = computed(() => this.liveService.getSession(this.courseId()));

//   // TODO : remplacer par le vrai nom de l'apprenant connecté (service d'authentification)
//   readonly displayName = 'Apprenant KMAA';
// }



import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { COURSES } from '../../data/courses';
import { LiveSessionService } from '../../shared/live-session.service';

@Component({
  selector: 'app-live-session',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './live-session.html',
  styleUrl: './live-session.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveSession {
  private readonly route = inject(ActivatedRoute);
  private readonly liveService = inject(LiveSessionService);

  readonly courseId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' }
  );

  readonly course = computed(() => COURSES.find((c) => c.id === this.courseId()));
  readonly session = computed(() => this.liveService.getSession(this.courseId()));

  readonly joinUrl = signal<string | null>(null);
  readonly password = signal<string | null>(null);
  readonly loadingUrl = signal(false);
  readonly error = signal<string | null>(null);

  // ============================================================
  // Rejoindre la réunion Zoom
  // ============================================================
  joinZoom(): void {
    if (this.loadingUrl()) return;

    this.loadingUrl.set(true);
    this.error.set(null);

    this.liveService.getJoinUrl(
      this.courseId(),
      (url, pwd) => {
        this.joinUrl.set(url);
        this.password.set(pwd || null);
        this.loadingUrl.set(false);

        // Ouvre Zoom dans un nouvel onglet
        window.open(url, '_blank', 'noopener,noreferrer');
      },
      (msg) => {
        this.error.set(msg);
        this.loadingUrl.set(false);
      }
    );
  }
}