import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CheckoutService } from '../../shared/checkout.service';
import { CoursesApiService } from '../../shared/courses-api.service';

type Step = 'numero' | 'otp' | 'succes';

@Component({
  selector: 'app-payment-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-otp.html',
  styleUrl: './payment-otp.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentOtp {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly checkout = inject(CheckoutService);
  private readonly coursesApi = inject(CoursesApiService);

  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  readonly courseId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly provider = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('provider') ?? 'orange')),
    { initialValue: 'orange' },
  );

  /** Cours depuis Laravel */
  readonly course = toSignal(
    toObservable(this.courseId).pipe(
      switchMap((slug) =>
        slug ? this.coursesApi.getCourseDetail(slug) : of(undefined),
      ),
    ),
    { initialValue: undefined },
  );

  readonly step = signal<Step>('numero');
  readonly phoneNumber = signal('');
  readonly otpDigits = signal(['', '', '', '']);
  readonly generatedOtp = signal('');
  readonly errorMessage = signal<string | null>(null);
  readonly isProcessing = signal(false);

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  providerLabel(): string {
    const labels: Record<string, string> = {
      orange: 'Orange Money',
      moov: 'Moov Money',
      coris: 'Coris Money',
    };
    return labels[this.provider()] ?? 'Mobile Money';
  }

  // ============================================================
  // Ã‰TAPE 1 : DEMANDER LE CODE OTP (simulation)
  // ============================================================

  requestOtp(): void {
    this.errorMessage.set(null);

    if (this.phoneNumber().trim().length < 8) {
      this.errorMessage.set('NumÃ©ro de tÃ©lÃ©phone invalide');
      return;
    }

    this.isProcessing.set(true);

    // TODO : remplacer par le vrai appel API Mobile Money
    setTimeout(() => {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      this.generatedOtp.set(otp);
      console.log('[SIMULATION] Code OTP gÃ©nÃ©rÃ© :', otp);
      this.isProcessing.set(false);
      this.step.set('otp');
    }, 1200);
  }

  onDigitInput(
    index: number,
    event: Event,
    nextInput?: HTMLInputElement,
  ): void {
    const value = (event.target as HTMLInputElement).value
      .replace(/\D/g, '')
      .slice(-1);

    this.otpDigits.update((current) => {
      const copy = [...current];
      copy[index] = value;
      return copy;
    });

    if (value && nextInput) {
      nextInput.focus();
    }
  }

  // ============================================================
  // Ã‰TAPE 2 : VÃ‰RIFIER L'OTP â†’ PAIEMENT â†’ INSCRIPTION
  // ============================================================

  verifyOtp(): void {
    this.errorMessage.set(null);
    const entered = this.otpDigits().join('');

    if (entered.length < 4) {
      this.errorMessage.set('Veuillez saisir le code complet');
      return;
    }

    this.isProcessing.set(true);

    // Simulation de vÃ©rification OTP
    // TODO : vraie vÃ©rification via l'API Mobile Money
    setTimeout(() => {
      if (entered !== this.generatedOtp()) {
        this.isProcessing.set(false);
        this.errorMessage.set('Code incorrect. RÃ©essayez.');
        this.otpDigits.set(['', '', '', '']);
        return;
      }

      this.processPaymentAndEnrollment();
    }, 900);
  }

  private processPaymentAndEnrollment(): void {
    const session = this.checkout.session() as any;

    // ----------------------------------------------------------
    // 1ï¸âƒ£ ENREGISTRER LE PAIEMENT (visible dans Filament)
    // ----------------------------------------------------------

    this.http
      .post<{ message: string }>(`${this.apiUrl}/payments`, {
        course_slug: this.courseId(),
        pricing_plan_id: session?.planId
          ? Number(session.planId)
          : null,
        amount: Number(session?.amount ?? 0),
        provider: this.provider(),
        phone_number: this.phoneNumber().trim(),
      })
      .subscribe({
        next: () => {
          // ----------------------------------------------------
          // 2ï¸âƒ£ INSCRIRE L'APPRENANT AU COURS
          // ----------------------------------------------------
          this.http
            .post(`${this.apiUrl}/enrollments`, {
              course_slug: this.courseId(),
            })
            .subscribe({
              next: () => {
                this.isProcessing.set(false);
                this.step.set('succes');

                setTimeout(() => {
                  this.checkout.clear();
                  this.router.navigate(['/apprentissage', this.courseId()]);
                }, 1800);
              },
              error: (err) => {
                console.error('Erreur inscription :', err);
                this.isProcessing.set(false);
                this.errorMessage.set(
                  err.error?.message ??
                    'Paiement enregistrÃ© mais inscription Ã©chouÃ©e. Contactez le support.',
                );
              },
            });
        },
        error: (err) => {
          console.error('Erreur paiement :', err);
          this.isProcessing.set(false);
          this.errorMessage.set(
            err.error?.message ?? 'Le paiement a Ã©chouÃ©. RÃ©essayez.',
          );
        },
      });
  }
}