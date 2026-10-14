import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdersService } from '../shared/orders.service';


type PaymentMethod = 'orange' | 'moov' | 'telecel' | 'card' | null;

interface CourseSummary {
  id: number;
  title: string;
  provider: string;
  duration: string;
  image: string;
  imageAlt: string;
  price: number;
}

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
  private readonly ordersService = inject(OrdersService);   // ✅ AJOUT

  // ============================================================
  // CATALOGUE DES COURS
  // ============================================================
  private readonly allCourses: CourseSummary[] = [
    {
      id: 1,
      title: "Fondamentaux de l'audit interne et gestion des risques",
      provider: 'KMAA Academy',
      duration: '6 semaines',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Audit interne',
      price: 150000,
    },
    {
      id: 2,
      title: 'Commissariat aux comptes : Normes OHADA et ISA',
      provider: 'KMAA Audit',
      duration: '8 semaines',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Commissariat aux comptes',
      price: 250000,
    },
    {
      id: 3,
      title: 'Consolidation des comptes et normes IFRS',
      provider: 'KMAA Academy',
      duration: '10 semaines',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Consolidation comptable',
      price: 300000,
    },
    {
      id: 4,
      title: 'Stratégie de digitalisation pour les PME africaines',
      provider: 'KMAA Conseil',
      duration: '4 semaines',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Digitalisation PME',
      price: 100000,
    },
    {
      id: 5,
      title: 'Contrôle de gestion : Outils et pilotage de la performance',
      provider: 'KMAA Academy',
      duration: '6 semaines',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Contrôle de gestion',
      price: 180000,
    },
    {
      id: 6,
      title: 'Fiscalité des entreprises : Optimisation et contentieux',
      provider: 'KMAA Juridique',
      duration: '8 semaines',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Fiscalité entreprise',
      price: 200000,
    },
    {
      id: 7,
      title: 'Analyse de données avec Excel et Power BI',
      provider: 'KMAA Tech',
      duration: '5 semaines',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Analyse de données',
      price: 120000,
    },
    {
      id: 8,
      title: 'Cybersécurité pour les dirigeants et managers',
      provider: 'KMAA Tech',
      duration: '3 semaines',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Cybersécurité',
      price: 90000,
    },
    {
      id: 9,
      title: "Leadership et Management d'équipe à distance",
      provider: 'KMAA RH',
      duration: '4 semaines',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Management équipe',
      price: 110000,
    },
    {
      id: 10,
      title: "Création et gestion d'une entreprise individuelle",
      provider: 'KMAA Conseil',
      duration: '6 semaines',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Entrepreneuriat',
      price: 80000,
    },
  ];

  // ============================================================
  // BONS DE RÉDUCTION
  // ============================================================
  private readonly availablePromos: PromoCode[] = [
    { code: 'KMAA10', type: 'percent', value: 10, label: '-10% sur votre formation' },
    { code: 'BIENVENUE', type: 'percent', value: 15, label: '-15% première inscription' },
    { code: 'AUDIT5000', type: 'fixed', value: 5000, label: '-5 000 FCFA' },
    { code: 'FIDELITE', type: 'percent', value: 20, label: '-20% client fidèle' },
  ];

  // ============================================================
  // ÉTAT
  // ============================================================
  readonly course = signal<CourseSummary | null>(null);
  readonly selectedMethod = signal<PaymentMethod>(null);
  readonly promoInput = signal<string>('');
  readonly appliedPromo = signal<PromoCode | null>(null);
  readonly promoError = signal<string | null>(null);
  readonly isProcessing = signal<boolean>(false);
  readonly termsAccepted = signal<boolean>(false);
  readonly phoneNumber = signal<string>('');

  // ============================================================
  // CALCULS
  // ============================================================
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

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      const found = this.allCourses.find((c) => c.id === id);
      if (found) this.course.set(found);
    }
  }

  // ============================================================
  // ACTIONS
  // ============================================================
  selectMethod(method: PaymentMethod): void {
    this.selectedMethod.set(method);
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

  // ============================================================
  // ✅ CONFIRMATION DE PAIEMENT — version corrigée
  // ============================================================
  confirmPayment(): void {
    if (!this.canPay()) return;

    this.isProcessing.set(true);

    setTimeout(() => {
      this.isProcessing.set(false);
      const c = this.course();
      const method = this.selectedMethod();
      if (!c || !method) return;

      // ---------------------------------------------------------
      // 1. Enregistrer l'inscription en localStorage
      // ---------------------------------------------------------
      try {
        const key = 'kmaa_enrollments';
        const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
        if (!existing.some((e: any) => e.courseId === c.id)) {
          existing.push({
            courseId: c.id,
            courseSlug: String(c.id),
            title: c.title,
            image: c.image,
            subject: c.provider,
            progressPercent: 0,
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            certificateIssued: false,
          });
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } catch { /* ignore */ }

      // ---------------------------------------------------------
      // 2. Créer la commande (facture)
      // ---------------------------------------------------------
      const totalHT = this.total();
      const tva = Math.round(totalHT * 0.18);
      const totalTTC = totalHT + tva;

      const order = this.ordersService.createOrder({
        type: 'course',
        status: 'paid',
        courseId: c.id,
        courseTitle: c.title,
        courseImage: c.image,
        courseProvider: c.provider,
        subtotal: this.subtotal(),
        discount: this.discountAmount(),
        tva: tva,
        total: totalTTC,
        currency: 'FCFA',
        promoCode: this.appliedPromo()?.code,
        paymentMethod: method as any,
        paymentMethodLabel: this.paymentMethodLabel(method),
        transactionId: 'TX-' + Date.now().toString(36).toUpperCase(),
        customerName: this.getUserName(),
        customerEmail: this.getUserEmail(),
      });

      // ---------------------------------------------------------
      // 3. Redirection vers la confirmation
      // ---------------------------------------------------------
      this.router.navigate(['/achats-cours/confirmation', c.id], {
        queryParams: {
          method: method,
          total: totalTTC,
          orderId: order.id,
        },
      });
    }, 1500);
  }

  // ============================================================
  // HELPERS — à ajouter
  // ============================================================
  private getUserName(): string {
    try {
      const raw = localStorage.getItem('kmaa_user');
      if (raw) {
        const user = JSON.parse(raw);
        return user.name || user.email || 'Client KMAA';
      }
    } catch { /* ignore */ }
    return 'Client KMAA';
  }

  private getUserEmail(): string {
    try {
      const raw = localStorage.getItem('kmaa_user');
      if (raw) {
        const user = JSON.parse(raw);
        return user.email || '';
      }
    } catch { /* ignore */ }
    return '';
  }

  private paymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<string, string> = {
      orange: 'Orange Money',
      moov: 'Moov Money',
      telecel: 'Telecel Money',
      card: 'Carte bancaire',
    };
    return labels[method ?? ''] ?? 'Non spécifié';
  }

  // ============================================================
  // ANNULATION
  // ============================================================
  cancel(): void {
    const c = this.course();
    if (!c) {
      this.router.navigate(['/sujets']);
      return;
    }
    this.router.navigate(['/sujets/cours', c.id]);
  }
}