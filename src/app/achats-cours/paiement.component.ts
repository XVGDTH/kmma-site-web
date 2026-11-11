import {
  ChangeDetectionStrategy, Component, computed, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiCourseDetail, CoursesApiService } from '../shared/courses-api.service';
import { RouterLink } from '@angular/router';
import { toAbsoluteUrl } from '../shared/formateur-content.service';

type PaymentMethod = 'orange' | 'moov' | 'telecel' | 'card' | null;

interface PromoCode {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  label: string;
}

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './paiement.component.html',
  styleUrl: './paiement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaiementComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesApi = inject(CoursesApiService);
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl = 'http://127.0.0.1:8000';

  // ÉTAT
  readonly course = signal<ApiCourseDetail | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null); // ✅ Pour les erreurs de paiement

  readonly selectedMethod = signal<PaymentMethod>(null);
  readonly promoInput = signal<string>('');
  readonly appliedPromo = signal<PromoCode | null>(null);
  readonly promoError = signal<string | null>(null);
  readonly isProcessing = signal<boolean>(false);
  readonly termsAccepted = signal<boolean>(false);
  readonly phoneNumber = signal<string>('');
   readonly assetUrl = toAbsoluteUrl;

  // PROMOS (simulation locale)
  private readonly availablePromos: PromoCode[] = [
    { code: 'KMAA10', type: 'percent', value: 10, label: '-10% sur votre formation' },
    { code: 'BIENVENUE', type: 'percent', value: 15, label: '-15% première inscription' },
    { code: 'AUDIT5000', type: 'fixed', value: 5000, label: '-5 000 FCFA' },
    { code: 'FIDELITE', type: 'percent', value: 20, label: '-20% client fidèle' },
  ];

  // CALCULS
  readonly subtotal = computed(() => this.course()?.price ?? 0);

  readonly discountAmount = computed(() => {
    const promo = this.appliedPromo();
    const sub = this.subtotal();
    if (!promo) return 0;
    if (promo.type === 'percent') return Math.round((sub * promo.value) / 100);
    return Math.min(promo.value, sub);
  });

  readonly total = computed(() => Math.max(0, this.subtotal() - this.discountAmount()));

  readonly canPay = computed(() => {
    if (!this.course()) return false;
    if (!this.selectedMethod()) return false;
    if (!this.termsAccepted()) return false;
    if (this.selectedMethod() !== 'card' && this.phoneNumber().trim().length < 8) return false;
    return true;
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.isLoading.set(false);
      return;
    }

    this.coursesApi.getCourseDetail(idParam).subscribe({
      next: (c) => {
        this.course.set(c);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement cours :', err);
        this.errorMessage.set('Impossible de charger le cours.');
        this.isLoading.set(false);
      },
    });
  }

  selectMethod(method: PaymentMethod): void {
    this.selectedMethod.set(method);
    this.errorMessage.set(null); // Reset erreur au changement de méthode
  }

  applyPromo(): void {
    const code = this.promoInput().trim().toUpperCase();
    this.promoError.set(null);

    if (!code) {
      this.promoError.set('Veuillez saisir un code.');
      return;
    }

    const found = this.availablePromos.find((p) => p.code === code);
    if (!found) {
      this.promoError.set('Code promo invalide ou expiré.');
      this.appliedPromo.set(null);
      return;
    }

    this.appliedPromo.set(found);
    this.promoInput.set('');
  }

  removePromo(): void {
    this.appliedPromo.set(null);
    this.promoError.set(null);
  }

  toggleTerms(): void {
    this.termsAccepted.update((v) => !v);
  }

  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    this.phoneNumber.set(formatted);
    input.value = formatted;
  }

  confirmPayment(): void {
    if (!this.canPay()) return;

    this.isProcessing.set(true);
    this.errorMessage.set(null);

    const c = this.course();
    const method = this.selectedMethod();
    if (!c || !method) {
      this.isProcessing.set(false);
      return;
    }

    this.http.post<{ data: any }>(
      `${this.apiBaseUrl}/api/payments`,
      {
        course_id: c.courseId,
        payment_method: method,
        phone_number: this.phoneNumber(),
        promo_code: this.appliedPromo()?.code ?? null,
      }
    ).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        
        // ✅ LA LIGNE CRUCIALE : redirection vers la confirmation
        // On passe l'UUID de la commande dans l'URL
        this.router.navigate(['/achats-cours/confirmation', res.data.order_uuid]);
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Erreur lors du paiement.');
      },
    });
  }

  cancel(): void {
    const c = this.course();
    if (c) {
      this.router.navigate(['/sujets/cours', c.slug]);
    } else {
      this.router.navigate(['/sujets']);
    }
  }
}