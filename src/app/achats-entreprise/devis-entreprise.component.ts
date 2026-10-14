import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntrepriseSubscriptionService } from './entreprise-subscription.service';

interface CourseInfo {
  id: number;
  title: string;
  image: string;
  provider: string;
  duration: string;
  mode: string;
}

interface PlanInfo {
  id: string;
  name: string;
  pricePerSeat: number;
  description: string;
  features: string[];
}

interface PromoCode {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  label: string;
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

  // ============================================
  // CATALOGUE LOCAL (IDs 10001-10012)
  // ============================================
  private readonly allCourses: CourseInfo[] = [
    { id: 10001, title: 'Commissariat aux comptes : Normes OHADA et ISA pour les entreprises', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '12 semaines', mode: 'Mixte' },
    { id: 10002, title: 'Actuariat : Modélisation des risques et provisionnement', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '16 semaines', mode: 'En ligne' },
    { id: 10003, title: 'Audit interne avancé pour les grands groupes', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '8 semaines', mode: 'Présentiel' },
    { id: 10004, title: 'Expertise comptable : Consolidation et normes IFRS', image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '14 semaines', mode: 'Mixte' },
    { id: 10005, title: 'Conseil en stratégie et transformation digitale', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '6 semaines', mode: 'En ligne' },
    { id: 10006, title: 'Finance d\'entreprise : Analyse financière et évaluation', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '10 semaines', mode: 'Mixte' },
    { id: 10007, title: 'Fiscalité internationale et prix de transfert', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '5 semaines', mode: 'Présentiel' },
    { id: 10008, title: 'Data Analytics pour la finance et l\'audit', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '8 semaines', mode: 'En ligne' },
    { id: 10009, title: 'Management et leadership pour cadres dirigeants', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '4 semaines', mode: 'Présentiel' },
    { id: 10010, title: 'Cybersécurité pour les entreprises : Stratégie et gouvernance', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '6 semaines', mode: 'Mixte' },
    { id: 10011, title: 'Audit des systèmes d\'information (SI)', image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '7 semaines', mode: 'En ligne' },
    { id: 10012, title: 'Commissariat aux apports et fusion-acquisition', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=60', provider: 'KMAA Entreprises', duration: '6 semaines', mode: 'Présentiel' },
  ];

  // ============================================
  // PLANS PAR DÉFAUT (fallback)
  // ============================================
  private readonly defaultPlans: PlanInfo[] = [
    {
      id: 'basique', name: 'Basique', pricePerSeat: 210000,
      description: 'Accès individuel',
      features: ['Accès complet', 'Certificat', 'Support email'],
    },
    {
      id: 'standard', name: 'Standard', pricePerSeat: 380000,
      description: 'Équipes de 2 à 5',
      features: ['Tout Basique', 'Corrections', 'Séances live', 'Jusqu\'à 5 apprenants'],
    },
    {
      id: 'premium', name: 'Premium', pricePerSeat: 580000,
      description: 'Équipes jusqu\'à 10',
      features: ['Tout Standard', 'Coaching', 'Priorité', 'Jusqu\'à 10 apprenants'],
    },
    {
      id: 'entreprise', name: 'Entreprise', pricePerSeat: 1050000,
      description: 'Grandes équipes',
      features: ['Tout Premium', '20 apprenants', 'Rapport manager', 'Sessions intra'],
    },
  ];

  // ============================================
  // PROMOS DISPONIBLES
  // ============================================
  private readonly availablePromos: PromoCode[] = [
    { code: 'ENTREPRISE10', type: 'percent', value: 10, label: '-10% entreprises' },
    { code: 'BULK15', type: 'percent', value: 15, label: '-15% à partir de 5 apprenants' },
    { code: 'PREMIUM20', type: 'percent', value: 20, label: '-20% offre Premium' },
    { code: 'FIDELITE', type: 'fixed', value: 50000, label: '-50 000 FCFA' },
    { code: 'BIENVENUE', type: 'percent', value: 12, label: '-12% nouvelle entreprise' },
  ];

  // ============================================
  // ÉTAT
  // ============================================
  readonly course = signal<CourseInfo | null>(null);
  readonly selectedPlan = signal<PlanInfo | null>(null);
  readonly teamSize = signal<number>(1);
  readonly members = signal<string[]>([]); // emails
  readonly newMemberEmail = signal<string>('');
  readonly memberError = signal<string | null>(null);

  readonly promoInput = signal<string>('');
  readonly appliedPromo = signal<PromoCode | null>(null);
  readonly promoError = signal<string | null>(null);

  // ============================================
  // CALCULS
  // ============================================
  readonly subtotal = computed(() => {
    const plan = this.selectedPlan();
    if (!plan) return 0;
    return plan.pricePerSeat * this.teamSize();
  });

  readonly discountAmount = computed(() => {
    const promo = this.appliedPromo();
    const sub = this.subtotal();
    if (!promo) return 0;
    if (promo.type === 'percent') return Math.round((sub * promo.value) / 100);
    return Math.min(promo.value, sub);
  });

  readonly totalHT = computed(() =>
    Math.max(0, this.subtotal() - this.discountAmount())
  );

  readonly tva = computed(() => Math.round(this.totalHT() * 0.18));

  readonly totalTTC = computed(() => this.totalHT() + this.tva());

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

    const plans = this.defaultPlans;
    const plan = plans.find((p) => p.id === planId) ?? plans[1];
    this.selectedPlan.set(plan);

    if (teamSize >= 1 && teamSize <= 100) {
      this.teamSize.set(teamSize);
    }

    // Auto-suggestion du code promo BULK15 si >= 5 apprenants
    if (teamSize >= 5) {
      const bulkPromo = this.availablePromos.find((p) => p.code === 'BULK15');
      if (bulkPromo) this.appliedPromo.set(bulkPromo);
    }
  }

  // ============================================
  // AJUSTER LA TAILLE DE L'ÉQUIPE
  // ============================================
  setTeamSize(size: number): void {
    if (size < 1) size = 1;
    if (size > 100) size = 100;
    this.teamSize.set(size);
  }

  incrementTeam(): void { this.setTeamSize(this.teamSize() + 1); }
  decrementTeam(): void { this.setTeamSize(this.teamSize() - 1); }

  // ============================================
  // GESTION DES MEMBRES
  // ============================================
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

  // ============================================
  // PROMO
  // ============================================
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

  // ============================================
  // CONTINUER VERS LE PAIEMENT
  // ============================================
  continueToPayment(): void {
    const c = this.course();
    const plan = this.selectedPlan();
    if (!c || !plan) return;

    // Simulation : enregistrer le devis en local
    try {
      localStorage.setItem('kmaa_entreprise_devis', JSON.stringify({
        courseId: c.id,
        planId: plan.id,
        teamSize: this.teamSize(),
        members: this.members(),
        totalTTC: this.totalTTC(),
        promoCode: this.appliedPromo()?.code,
        discount: this.discountAmount(),
      }));
    } catch { /* ignore */ }

    this.router.navigate(['/achats-entreprise/paiement'], {
      queryParams: {
        courseId: c.id,
        plan: plan.id,
        teamSize: this.teamSize(),
      },
    });
  }

  // ============================================
  // ANNULER
  // ============================================
  cancel(): void {
    const c = this.course();
    if (c) this.router.navigate(['/entreprises/formation', c.id]);
    else this.router.navigate(['/entreprises/formations']);
  }

  // ============================================
  // HELPERS
  // ============================================
  formatPrice(n: number): string {
    return n.toLocaleString('fr-FR') + ' FCFA';
  }
}