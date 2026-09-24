import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CoursesApiService } from '../../shared/courses-api.service';

@Component({
  selector: 'app-cours-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cours-detail.html',
  styleUrl: './cours-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly coursesApi = inject(CoursesApiService);

  /** Slug du cours depuis lâ€™URL */
  readonly courseSlug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  /** Cours depuis Laravel */
  readonly course = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((slug) => {
        if (!slug) return of(undefined);
        return this.coursesApi.getCourseDetail(slug).pipe(
          catchError((err) => {
            console.error('Erreur chargement dÃ©tail cours :', err);
            return of(undefined);
          }),
        );
      }),
    ),
    { initialValue: undefined },
  );

  readonly levelLabels: Record<string, string> = {
    debutant: 'DÃ©butant',
    intermediaire: 'IntermÃ©diaire',
    avance: 'AvancÃ©',
  };

  readonly fallbackSkills = [
    'MaÃ®trise des concepts fondamentaux du domaine',
    'Application pratique sur des cas concrets',
    'CapacitÃ© Ã  structurer et prÃ©senter son travail',
    'Autonomie dans la rÃ©solution de problÃ¨mes',
  ];

  readonly fallbackModules = [
    'Introduction et mise en contexte',
    'Concepts clÃ©s et fondamentaux thÃ©oriques',
    'Ateliers pratiques et Ã©tudes de cas',
    'Projet dâ€™application et Ã©valuation finale',
  ];

  get skills(): string[] {
    return this.course()?.skills ?? this.fallbackSkills;
  }

  get modules(): string[] {
    return this.course()?.modules ?? this.fallbackModules;
  }

  get description(): string {
    const c = this.course();
    if (!c) return '';

    return (
      c.description ??
      `Ce parcours en ${c.category?.toLowerCase() ?? 'formation'} ` +
        `vous permet d'acquÃ©rir des compÃ©tences solides et ` +
        `directement applicables, Ã  travers une pÃ©dagogie active ` +
        `combinant thÃ©orie et mise en pratique.`
    );
  }

  get instructor(): string {
    return this.course()?.instructor ?? 'Ã‰quipe pÃ©dagogique KMAA';
  }

  get instructorRole(): string {
    return this.course()?.instructorRole ?? 'Formateurs experts du domaine';
  }

  goToEnroll(): void {
    const c = this.course();
    if (!c) return;

    const courseKey = c.id; // slug renvoyÃ© par lâ€™API

    if (c.isFree) {
      // Cours gratuit â†’ on tente l'inscription puis on redirige vers la connexion
      this.http
        .post('https://api.convergesas.com/api/enrollments', {
          course_slug: courseKey,
        })
        .subscribe({
          next: () => {
            this.router.navigate(['/compte/connexion'], {
              queryParams: { redirect: '/apprentissage/' + courseKey },
            });
          },
          error: (err) => {
            console.error('Erreur inscription cours gratuit :', err);

            // MÃªme en cas d'erreur (ex: non connectÃ©), on envoie vers la connexion
            this.router.navigate(['/compte/connexion'], {
              queryParams: { redirect: '/apprentissage/' + courseKey },
            });
          },
        });
    } else {
      // Cours payant â†’ redirection vers la connexion puis paiement
      this.router.navigate(['/compte/connexion'], {
        queryParams: { redirect: '/paiement/' + courseKey },
      });
    }
  }
}