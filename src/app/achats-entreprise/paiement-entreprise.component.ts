import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  EntrepriseSubscriptionService,
  EnterprisePlan,
  CreateLicensePayload,
} from './entreprise-subscription.service';
import { toAbsoluteUrl } from '../shared/formateur-content.service';

type PaymentMethod = 'virement' | 'orange' | 'moov' | 'telecel' | 'card';

@Component({
  selector: 'app-paiement-entreprise',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './paiement-entreprise.component.html',
  styleUrl: './paiement-entreprise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaiementEntrepriseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private subService = inject(EntrepriseSubscriptionService);

  private readonly apiBase = 'http://127.0.0.1:8000/api';

  // ============================================================
  // ÉTAT
  // ============================================================
  readonly courseId = signal<number | null>(null);
  readonly courseTitle = signal<string>('');
  readonly plan = signal<EnterprisePlan | null>(null);
  readonly teamSize = signal<number>(1);
  readonly members = signal<string[]>([]);
  readonly promoCode = signal<string | null>(null);
    // ✅ Ajoute cette ligne
  readonly assetUrl = toAbsoluteUrl;
  readonly courseImage = signal<string>('');

  readonly selectedMethod = signal<PaymentMethod>('virement');
  readonly companyName = signal<string>('');
  readonly companyAddress = signal<string>('');
  readonly companyTaxId = signal<string>('');
  readonly companyEmail = signal<string>('');
  readonly phoneNumber = signal<string>('');

  readonly termsAccepted = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // ============================================================
  // CALCULS
  // ============================================================
  readonly subtotal = computed(() => {
    const p = this.plan();
    if (!p) return 0;
    return p.pricePerSeat * this.teamSize();
  });

  readonly tva = computed(() => Math.round(this.subtotal() * 0.18));
  readonly totalTTC = computed(() => this.subtotal() + this.tva());

  readonly canPay = computed(() => {
    if (!this.courseId() || !this.plan()) return false;
    if (!this.companyName().trim()) return false;
    if (!this.companyEmail().trim()) return false;
    if (!this.termsAccepted()) return false;
    
    // ✅ Vérification des limites du plan
    const p = this.plan();
    if (p) {
      if (this.teamSize() < p.minSeats || this.teamSize() > p.maxSeats) {
        return false; // Empêche le clic si le nombre de sièges ne correspond pas
      }
    }

    if (this.selectedMethod() !== 'virement' && this.selectedMethod() !== 'card') {
      if (this.phoneNumber().trim().length < 8) return false;
    }
    return true;
  });

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const courseId = Number(params.get('courseId'));
    const planSlug = params.get('plan');
    const teamSize = Number(params.get('teamSize'));

    if (courseId) this.courseId.set(courseId);
    if (teamSize >= 1) this.teamSize.set(teamSize);

    // Charger le titre du cours
   // ✅ CODE CORRIGÉ
    if (courseId) {
      this.http.get<{ data: { title: string, image: string } }>(`${this.apiBase}/courses/${courseId}`)
        .subscribe({
          next: (res) => {
            this.courseTitle.set(res.data?.title ?? '');
            this.courseImage.set(res.data?.image ?? '');
          },
          error: (err) => console.error('Erreur chargement cours', err)
        });
    }

    // Charger les plans et sélectionner celui choisi
    this.subService.getPlans().subscribe({
      next: (res) => {
        const match = res.data.find(p => p.slug === planSlug) ?? res.data[0];
        if (match) this.plan.set(match);
      },
    });

    // Récupérer le devis (membres optionnels)
    try {
      const raw = localStorage.getItem('kmaa_entreprise_devis');
      if (raw) {
        const devis = JSON.parse(raw);
        if (Array.isArray(devis.members)) this.members.set(devis.members);
        if (devis.promoCode) this.promoCode.set(devis.promoCode);
      }
    } catch { /* ignore */ }

    // Pré-remplir l'email du compte
    try {
      const rawUser = localStorage.getItem('kmaa_user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.name) this.companyName.set(u.name);
        if (u.email) this.companyEmail.set(u.email);
      }
    } catch { /* ignore */ }
  }

  // ============================================================
  // UI
  // ============================================================
  selectMethod(m: PaymentMethod): void { this.selectedMethod.set(m); }
  toggleTerms(): void { this.termsAccepted.update((v) => !v); }

  onCompanyNameInput(e: Event): void { this.companyName.set((e.target as HTMLInputElement).value); }
  onCompanyAddressInput(e: Event): void { this.companyAddress.set((e.target as HTMLInputElement).value); }
  onCompanyTaxIdInput(e: Event): void { this.companyTaxId.set((e.target as HTMLInputElement).value); }
  onCompanyEmailInput(e: Event): void { this.companyEmail.set((e.target as HTMLInputElement).value); }

  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    this.phoneNumber.set(formatted);
    input.value = formatted;
  }

  // ============================================================
  // PAIEMENT
  // ============================================================
  confirmPayment(): void {
    if (!this.canPay()) return;

    const cId = this.courseId();
    const p = this.plan();
    if (!cId || !p) return;

    this.isProcessing.set(true);
    this.errorMessage.set(null);

    // On envoie les membres seulement s'il y en a (facultatif)
    const payload: CreateLicensePayload = {
      course_id: cId,
      plan_id: p.id,
      seats_total: this.teamSize(),
      company_name: this.companyName(),
      company_email: this.companyEmail(),
      company_phone: this.phoneNumber() || undefined,
      company_address: this.companyAddress() || undefined,
      company_tax_id: this.companyTaxId() || undefined,
      promo_code: this.promoCode() ?? undefined,
      payment_method: this.selectedMethod(),
      members: this.members().length > 0 ? this.members().map(email => ({ email })) : undefined,
    };

    this.subService.createLicense(payload).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        try { localStorage.removeItem('kmaa_entreprise_devis'); } catch {}

        this.router.navigate(['/achats-entreprise/confirmation'], {
          queryParams: { licenseId: res.data.id },
        });
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.errorMessage.set(
          err?.error?.message ?? 'Erreur lors du paiement. Veuillez réessayer.'
        );
      },
    });
  }

  cancel(): void {
    const cId = this.courseId();
    if (cId) this.router.navigate(['/entreprises/formation', cId]);
    else this.router.navigate(['/entreprises/formations']);
  }

  formatPrice(n: number): string {
    return n.toLocaleString('fr-FR') + ' FCFA';
  }
}