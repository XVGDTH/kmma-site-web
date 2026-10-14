import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PAYMENT_PROVIDERS, PaymentProvider } from '../../data/pricing';
import { CheckoutService } from '../../shared/checkout.service';
import { CoursesApiService } from '../../shared/courses-api.service';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './payment-method.html',
  styleUrl: './payment-method.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethod {
  readonly voucherMessage = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly checkout = inject(CheckoutService);
  private readonly coursesApi = inject(CoursesApiService);

  readonly courseId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly course = toSignal(
    toObservable(this.courseId).pipe(
      switchMap((slug) =>
        slug ? this.coursesApi.getCourseDetail(slug) : of(undefined),
      ),
    ),
    { initialValue: undefined },
  );

  readonly providers = PAYMENT_PROVIDERS;

  /** Code bon saisi par lâ€™utilisateur */
  voucherCode = '';

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  selectProvider(provider: PaymentProvider): void {
    const id = this.courseId();
    if (!id) return;

    this.router.navigate(['/paiement', id, 'numero'], {
      queryParams: { provider },
    });
  }

  redeemVoucher(): void {
    const id = this.courseId();
    const code = this.voucherCode.trim();

    if (!id) return;

    if (!code) {
      this.voucherMessage.set('Saisissez un code bon.');
      return;
    }

    this.voucherMessage.set(null);

    this.http
      .post('http://127.0.0.1:8000/api/vouchers/redeem', {
        code,
        course_slug: id,
      })
      .subscribe({
        next: () => {
          // Bon validÃ© â†’ on inscrit l'utilisateur au cours
          this.http
            .post('http://127.0.0.1:8000/api/enrollments', {
              course_slug: id,
            })
            .subscribe({
              next: () => {
                this.checkout.clear();
                this.router.navigate(['/apprentissage', id]);
              },
              error: (err) => {
                console.error('Erreur inscription :', err);
                this.voucherMessage.set(
                  err.error?.message ??
                    'Bon validÃ© mais inscription Ã©chouÃ©e. Contactez le support.',
                );
              },
            });
        },
        error: (err) => {
          this.voucherMessage.set(err.error?.message ?? 'Bon invalide.');
        },
      });
  }
}