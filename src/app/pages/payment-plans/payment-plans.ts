import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { PRICING_PLANS, PricingPlan } from '../../data/pricing';
import { CheckoutService } from '../../shared/checkout.service';
import { CoursesApiService } from '../../shared/courses-api.service';

@Component({
  selector: 'app-payment-plans',
  standalone: true,
  imports: [],
  templateUrl: './payment-plans.html',
  styleUrl: './payment-plans.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPlans {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly checkout = inject(CheckoutService);
  private readonly coursesApi = inject(CoursesApiService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  readonly courseId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' },
  );

  /** Cours chargé depuis Laravel (slug = paramètre d'URL) */
  readonly course = toSignal(
    toObservable(this.courseId).pipe(
      switchMap((slug) =>
        slug ? this.coursesApi.getCourseDetail(slug) : of(undefined),
      ),
    ),
    { initialValue: undefined },
  );

  /**
   * ✅ Formules : contenu statique par défaut → remplacé
   * automatiquement par les formules créées dans Filament.
   */
  readonly plans = signal<PricingPlan[]>(PRICING_PLANS);

  constructor() {
    this.http
      .get<{ data: unknown[] }>(`${this.apiUrl}/pricing-plans`)
      .subscribe({
        next: (res) => {
          const mapped = (res.data ?? []).map((raw: any) => ({
            id: String(raw.id),
            name: raw.name,
            price: Number(raw.price),
            badge: raw.badge ?? undefined,
            features: Array.isArray(raw.features) ? raw.features : [],
            featured: Boolean(raw.featured),
          }));

          if (mapped.length > 0) {
            this.plans.set(mapped);
          }
        },
        error: () =>
          console.warn('Formules API indisponible — contenu statique affiché.'),
      });
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  choosePlan(planId: string, amount: number): void {
    const id = this.courseId();
    if (!id) return;

    this.checkout.startCheckout(id, planId, amount);
    this.router.navigate(['/paiement', id, 'moyen']);
  }
}