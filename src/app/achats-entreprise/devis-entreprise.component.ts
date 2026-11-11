import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EntrepriseSubscriptionService, EnterprisePlan } from './entreprise-subscription.service';

interface PromoResult {
  valid: boolean;
  code?: string;
  type?: 'percent' | 'fixed';
  value?: number;
  label?: string;
  discount?: number;
  message?: string;
}

@Component({
  selector: 'app-devis-entreprise',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './devis-entreprise.component.html',
  styleUrl: './devis-entreprise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevisEntrepriseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private subService = inject(EntrepriseSubscriptionService);

  private readonly apiBase = 'http://127.0.0.1:8000/api';

  readonly courseTitle = signal<string>('');
  readonly courseId = signal<number | null>(null);

  readonly plans = signal<EnterprisePlan[]>([]);
  readonly plansLoading = signal<boolean>(false);

  readonly selectedPlan = signal<EnterprisePlan | null>(null);
  readonly teamSize = signal<number>(1);
  readonly members = signal<string[]>([]);
  readonly newMemberEmail = signal<string>('');
  readonly memberError = signal<string | null>(null);

  readonly promoInput = signal<string>('');
  readonly appliedPromo = signal<PromoResult | null>(null);
  readonly promoError = signal<string | null>(null);
  readonly promoLoading = signal<boolean>(false);

  readonly isSubmitting = signal<boolean>(false);
  readonly submitError = signal<string | null>(null);

  readonly subtotal = computed(() => {
    const p = this.selectedPlan();
    if (!p) return 0;
    return p.pricePerSeat * this.teamSize();
  });

  readonly discountAmount = computed(() => {
    const promo = this.appliedPromo();
    if (!promo?.valid || !promo.discount) return 0;
    return promo.discount;
  });

  readonly totalHT = computed(() => Math.max(0, this.subtotal() - this.discountAmount()));
  readonly tva = computed(() => Math.round(this.totalHT() * 0.18));
  readonly totalTTC = computed(() => this.totalHT() + this.tva());

  // ✅ Ajoute cette variable en haut de ta classe
  readonly planFromUrl = this.route.snapshot.queryParamMap.has('plan');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const courseId = Number(params.get('courseId'));
    const planSlug = params.get('plan');
    const teamSize = Number(params.get('teamSize'));

    if (courseId) this.courseId.set(courseId);
    if (teamSize >= 1) this.teamSize.set(teamSize);

    if (courseId) {
      this.http.get<{ data: { title: string } }>(`${this.apiBase}/courses/${courseId}`)
        .subscribe({
          next: (res) => this.courseTitle.set(res.data?.title ?? ''),
          error: () => this.courseTitle.set(''),
        });
    }

    this.plansLoading.set(true);
    this.subService.getPlans().subscribe({
      next: (res) => {
        this.plans.set(res.data);
        
        // On cherche le plan qui correspond à l'URL
        const match = res.data.find(p => p.slug === planSlug) ?? res.data[0];
        
        if (match) {
          this.selectedPlan.set(match);
          
          // ✅ CORRECTION : On force la taille de l'équipe dans les limites du plan
          // (Pour éviter l'erreur 422 au moment du paiement)
          if (this.teamSize() < match.minSeats) {
             this.teamSize.set(match.minSeats);
          } else if (this.teamSize() > match.maxSeats) {
             this.teamSize.set(match.maxSeats);
          }
        }
        this.plansLoading.set(false);
      },
      error: () => this.plansLoading.set(false),
    });
  }

  // ✅ Étape clé : On ajuste la taille de l'équipe et on vérifie si le plan choisi correspond encore
  setTeamSize(size: number): void {
    if (size < 1) size = 1;
    if (size > 100) size = 100;
    this.teamSize.set(size);

    // Si la réduction est appliquée, on la recalcule
    if (this.appliedPromo()) this.applyPromo(this.promoInput() || '');

    // Si le plan actuel n'est plus valide pour cette taille (ex: il a mis 5 personnes sur Basique), on le change
    const p = this.selectedPlan();
    if (p && (size < p.minSeats || size > p.maxSeats)) {
      const newPlan = this.plans().find(plan => size >= plan.minSeats && size <= plan.maxSeats);
      if (newPlan) this.selectedPlan.set(newPlan);
    }
  }

  incrementTeam(): void { this.setTeamSize(this.teamSize() + 1); }
  decrementTeam(): void { this.setTeamSize(this.teamSize() - 1); }

  selectPlan(plan: EnterprisePlan): void {
    this.selectedPlan.set(plan);
    // On ajuste automatiquement la taille de l'équipe au minimum du plan sélectionné
    if (this.teamSize() < plan.minSeats) this.setTeamSize(plan.minSeats);
    if (this.teamSize() > plan.maxSeats) this.setTeamSize(plan.maxSeats);

    if (this.appliedPromo()) this.applyPromo(this.promoInput() || '');
  }

  // ... (le reste des fonctions addMember, removeMember, applyPromo, continueToPayment reste identique)
  
  addMember(): void {
    const email = this.newMemberEmail().trim().toLowerCase();
    this.memberError.set(null);

    if (!email || !email.includes('@')) {
      this.memberError.set('Email invalide.');
      return;
    }
    if (this.members().includes(email)) {
      this.memberError.set('Cet email est déjà dans la liste.');
      return;
    }
    if (this.members().length >= this.teamSize() - 1) {
      this.memberError.set(`Vous ne pouvez ajouter que ${this.teamSize() - 1} invité(s).`);
      return;
    }

    this.members.update((list) => [...list, email]);
    this.newMemberEmail.set('');
  }

  removeMember(email: string): void {
    this.members.update((list) => list.filter((e) => e !== email));
  }

  onMemberInput(event: Event): void {
    this.newMemberEmail.set((event.target as HTMLInputElement).value);
  }

  applyPromo(codeOverride?: string): void {
    const code = (codeOverride ?? this.promoInput()).trim().toUpperCase();
    this.promoError.set(null);

    if (!code) {
      this.promoError.set('Veuillez saisir un code.');
      return;
    }

    this.promoLoading.set(true);

    this.http.post<PromoResult>(`${this.apiBase}/promo/validate`, {
      code,
      subtotal: this.subtotal(),
      team_size: this.teamSize(),
    }).subscribe({
      next: (res) => {
        this.appliedPromo.set(res);
        this.promoLoading.set(false);
      },
      error: (err) => {
        this.appliedPromo.set(null);
        this.promoError.set(err?.error?.message ?? 'Code promo invalide.');
        this.promoLoading.set(false);
      },
    });
  }

  removePromo(): void {
    this.appliedPromo.set(null);
    this.promoError.set(null);
    this.promoInput.set('');
  }

  continueToPayment(): void {
    const cId = this.courseId();
    const plan = this.selectedPlan();
    if (!cId || !plan) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    try {
      localStorage.setItem('kmaa_entreprise_devis', JSON.stringify({
        courseId: cId,
        planId: plan.id,
        planSlug: plan.slug,
        teamSize: this.teamSize(),
        members: this.members(),
        promoCode: this.appliedPromo()?.code ?? null,
      }));
    } catch { /* ignore */ }

    this.isSubmitting.set(false);

    this.router.navigate(['/achats-entreprise/paiement'], {
      queryParams: {
        courseId: cId,
        plan: plan.slug,
        teamSize: this.teamSize(),
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