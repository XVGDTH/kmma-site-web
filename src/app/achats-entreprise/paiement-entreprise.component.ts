import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntrepriseSubscriptionService } from './entreprise-subscription.service';
import { OrdersService } from '../shared/orders.service';

type PaymentMethod = 'virement' | 'orange' | 'moov' | 'telecel' | 'card';

interface CourseInfo {
  id: number;
  title: string;
  image: string;
  provider: string;
}

interface PlanInfo {
  id: string;
  name: string;
  pricePerSeat: number;
}

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
  private subService = inject(EntrepriseSubscriptionService);// Dans la classe :
  private readonly ordersService = inject(OrdersService);


  private readonly allCourses: CourseInfo[] = [
    { id: 10001, title: 'Commissariat aux comptes : Normes OHADA et ISA pour les entreprises', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10002, title: 'Actuariat : Modélisation des risques et provisionnement', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10003, title: 'Audit interne avancé pour les grands groupes', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10004, title: 'Expertise comptable : Consolidation et normes IFRS', image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10005, title: 'Conseil en stratégie et transformation digitale', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10006, title: 'Finance d\'entreprise : Analyse financière et évaluation', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10007, title: 'Fiscalité internationale et prix de transfert', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10008, title: 'Data Analytics pour la finance et l\'audit', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10009, title: 'Management et leadership pour cadres dirigeants', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10010, title: 'Cybersécurité pour les entreprises : Stratégie et gouvernance', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10011, title: 'Audit des systèmes d\'information (SI)', image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
    { id: 10012, title: 'Commissariat aux apports et fusion-acquisition', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises' },
  ];

  private readonly allPlans: PlanInfo[] = [
    { id: 'basique', name: 'Basique', pricePerSeat: 210000 },
    { id: 'standard', name: 'Standard', pricePerSeat: 380000 },
    { id: 'premium', name: 'Premium', pricePerSeat: 580000 },
    { id: 'entreprise', name: 'Entreprise', pricePerSeat: 1050000 },
  ];

  // ============================================
  // ÉTAT
  // ============================================
  readonly course = signal<CourseInfo | null>(null);
  readonly plan = signal<PlanInfo | null>(null);
  readonly teamSize = signal<number>(1);
  readonly members = signal<string[]>([]);
  readonly promoCode = signal<string | null>(null);
  readonly discount = signal<number>(0);

  readonly selectedMethod = signal<PaymentMethod>('virement');
  readonly companyName = signal<string>('');
  readonly companyAddress = signal<string>('');
  readonly companyTaxId = signal<string>(''); // IFU / RIB
  readonly phoneNumber = signal<string>('');

  readonly termsAccepted = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);

  // ============================================
  // CALCULS
  // ============================================
  readonly subtotal = computed(() => {
    const p = this.plan();
    if (!p) return 0;
    return p.pricePerSeat * this.teamSize();
  });

  readonly totalHT = computed(() => Math.max(0, this.subtotal() - this.discount()));
  readonly tva = computed(() => Math.round(this.totalHT() * 0.18));
  readonly totalTTC = computed(() => this.totalHT() + this.tva());

  readonly canPay = computed(() => {
    if (!this.course() || !this.plan()) return false;
    if (!this.companyName().trim()) return false;
    if (!this.termsAccepted()) return false;
    if (this.selectedMethod() !== 'virement' && this.selectedMethod() !== 'card') {
      if (this.phoneNumber().trim().length < 8) return false;
    }
    return true;
  });

  // ============================================
  // LIFECYCLE
  // ============================================
  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const courseId = Number(params.get('courseId'));
    const planId = params.get('plan');
    const teamSize = Number(params.get('teamSize'));

    const found = this.allCourses.find((c) => c.id === courseId);
    if (found) this.course.set(found);

    const p = this.allPlans.find((x) => x.id === planId) ?? this.allPlans[1];
    this.plan.set(p);

    if (teamSize >= 1) this.teamSize.set(teamSize);

    // Récupérer le devis sauvegardé
    try {
      const raw = localStorage.getItem('kmaa_entreprise_devis');
      if (raw) {
        const devis = JSON.parse(raw);
        if (devis.members) this.members.set(devis.members);
        if (devis.discount) this.discount.set(devis.discount);
        if (devis.promoCode) this.promoCode.set(devis.promoCode);
      }
    } catch { /* ignore */ }

    // Récupérer les infos utilisateur
    try {
      const rawUser = localStorage.getItem('kmaa_user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.name) this.companyName.set(u.name);
      }
    } catch { /* ignore */ }
  }

  // ============================================
  // ACTIONS
  // ============================================
  selectMethod(m: PaymentMethod): void { this.selectedMethod.set(m); }
  toggleTerms(): void { this.termsAccepted.update((v) => !v); }

  onCompanyNameInput(e: Event): void { this.companyName.set((e.target as HTMLInputElement).value); }
  onCompanyAddressInput(e: Event): void { this.companyAddress.set((e.target as HTMLInputElement).value); }
  onCompanyTaxIdInput(e: Event): void { this.companyTaxId.set((e.target as HTMLInputElement).value); }

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

    setTimeout(() => {
      const c = this.course();
      const p = this.plan();
      if (!c || !p) { this.isProcessing.set(false); return; }

      // ============================================================
      // CRÉER LA LICENCE
      // ============================================================
      const ownerEmail = this.getOwnerEmail();
      const ownerName = this.companyName();

      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);

      const license = {
        id: 'lic_' + Date.now().toString(36),
        courseId: c.id,
        courseTitle: c.title,
        courseImage: c.image,
        planId: p.id,
        planName: p.name,
        seatsTotal: this.teamSize(),
        seatsUsed: 1, // le propriétaire
        seatsRemaining: this.teamSize() - 1,
        pricePerSeat: p.pricePerSeat,
        totalPaid: this.totalTTC(),
        discountApplied: this.discount(),
        promoCode: this.promoCode() ?? undefined,
        purchasedAt: new Date().toISOString(),
        expiresAt: expires.toISOString(),
        status: 'active' as const,
        ownerEmail,
        ownerName,
        members: this.members().map((email, i) => ({
          id: 'm_' + Date.now().toString(36) + i,
          email,
          status: 'invite' as const,
          joinedAt: new Date().toISOString(),
        })),
      };

      // Dans confirmPayment(), après addLicense :
const order = this.ordersService.createOrder({
  type: 'enterprise',
  status: 'paid',
  courseId: c.id,
  courseTitle: c.title,
  courseImage: c.image,
  courseProvider: c.provider,
  subtotal: this.subtotal(),
  discount: this.discount(),
  tva: this.tva(),
  total: this.totalTTC(),
  currency: 'FCFA',
  promoCode: this.promoCode() ?? undefined,
  paymentMethod: this.selectedMethod() as any,
  paymentMethodLabel: this.ordersService.paymentMethodLabel(this.selectedMethod() as any),
  transactionId: 'TX-' + Date.now().toString(36).toUpperCase(),
  customerName: this.companyName(),
  customerEmail: this.getOwnerEmail(),
  companyName: this.companyName(),
  companyAddress: this.companyAddress(),
  companyTaxId: this.companyTaxId(),
  planId: p.id,
  planName: p.name,
  seatsTotal: this.teamSize(),
  seatsUsed: 1,
});

      this.subService.addLicense(license);
      this.isProcessing.set(false);

      // Redirection vers confirmation
      this.router.navigate(['/achats-entreprise/confirmation'], {
        queryParams: { licenseId: license.id },
      });
    }, 1800);
  }

  private getOwnerEmail(): string {
    try {
      const raw = localStorage.getItem('kmaa_user');
      if (raw) {
        const u = JSON.parse(raw);
        return u.email ?? 'owner@entreprise.com';
      }
    } catch { /* ignore */ }
    return 'owner@entreprise.com';
  }

  cancel(): void {
    const c = this.course();
    if (c) this.router.navigate(['/entreprises/formation', c.id]);
    else this.router.navigate(['/entreprises/formations']);
  }

  formatPrice(n: number): string {
    return n.toLocaleString('fr-FR') + ' FCFA';
  }
}