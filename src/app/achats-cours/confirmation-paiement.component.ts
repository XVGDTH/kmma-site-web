import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

type PaymentMethod = 'orange' | 'moov' | 'telecel' | 'card';

interface CourseSummary {
  id: number;
  title: string;
  provider: string;
  duration: string;
  image: string;
  imageAlt: string;
  price: number;
  subject: string;
  level: string;
}

@Component({
  selector: 'app-confirmation-paiement',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './confirmation-paiement.component.html',
  styleUrl: './confirmation-paiement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationPaiementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ============================================
  // CATALOGUE LOCAL (mêmes IDs que paiement)
  // ============================================
  private readonly allCourses: CourseSummary[] = [
    {
      id: 1,
      title: "Fondamentaux de l'audit interne et gestion des risques",
      provider: 'KMAA Academy',
      duration: '6 semaines',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Audit interne',
      price: 150000,
      subject: 'Audit & Contrôle',
      level: 'Intermédiaire',
    },
    {
      id: 2,
      title: 'Commissariat aux comptes : Normes OHADA et ISA',
      provider: 'KMAA Audit',
      duration: '8 semaines',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Commissariat aux comptes',
      price: 250000,
      subject: 'Expertise Comptable',
      level: 'Avancé',
    },
    {
      id: 3,
      title: 'Consolidation des comptes et normes IFRS',
      provider: 'KMAA Academy',
      duration: '10 semaines',
      image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Consolidation comptable',
      price: 300000,
      subject: 'Expertise Comptable',
      level: 'Avancé',
    },
    {
      id: 4,
      title: 'Stratégie de digitalisation pour les PME africaines',
      provider: 'KMAA Conseil',
      duration: '4 semaines',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Digitalisation PME',
      price: 100000,
      subject: 'Conseil & Stratégie',
      level: 'Débutant',
    },
    {
      id: 5,
      title: 'Contrôle de gestion : Outils et pilotage de la performance',
      provider: 'KMAA Academy',
      duration: '6 semaines',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Contrôle de gestion',
      price: 180000,
      subject: 'Finance & Banque',
      level: 'Intermédiaire',
    },
    {
      id: 6,
      title: 'Fiscalité des entreprises : Optimisation et contentieux',
      provider: 'KMAA Juridique',
      duration: '8 semaines',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Fiscalité entreprise',
      price: 200000,
      subject: 'Fiscalité & Droit',
      level: 'Avancé',
    },
    {
      id: 7,
      title: 'Analyse de données avec Excel et Power BI',
      provider: 'KMAA Tech',
      duration: '5 semaines',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Analyse de données',
      price: 120000,
      subject: 'Data & Tech',
      level: 'Intermédiaire',
    },
    {
      id: 8,
      title: 'Cybersécurité pour les dirigeants et managers',
      provider: 'KMAA Tech',
      duration: '3 semaines',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Cybersécurité',
      price: 90000,
      subject: 'Data & Tech',
      level: 'Débutant',
    },
    {
      id: 9,
      title: "Leadership et Management d'équipe à distance",
      provider: 'KMAA RH',
      duration: '4 semaines',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Management équipe',
      price: 110000,
      subject: 'Management & RH',
      level: 'Intermédiaire',
    },
    {
      id: 10,
      title: "Création et gestion d'une entreprise individuelle",
      provider: 'KMAA Conseil',
      duration: '6 semaines',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=60',
      imageAlt: 'Entrepreneuriat',
      price: 80000,
      subject: 'Entrepreneuriat',
      level: 'Débutant',
    },
  ];

  // ============================================
  // ÉTAT
  // ============================================
  readonly course = signal<CourseSummary | null>(null);
  readonly method = signal<PaymentMethod>('orange');
  readonly total = signal<number>(0);
  readonly transactionId = signal<string>('');
  readonly paymentDate = signal<string>('');

  readonly methodLabel = computed(() => {
    const labels: Record<PaymentMethod, string> = {
      orange: 'Orange Money',
      moov: 'Moov Money',
      telecel: 'Telecel Money',
      card: 'Carte bancaire',
    };
    return labels[this.method()];
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const methodParam = this.route.snapshot.queryParamMap.get('method') as PaymentMethod;
    const totalParam = Number(this.route.snapshot.queryParamMap.get('total'));

    const found = this.allCourses.find((c) => c.id === id);
    if (found) this.course.set(found);
    if (methodParam) this.method.set(methodParam);
    if (totalParam) this.total.set(totalParam);

    // Générer un ID de transaction simulé
    this.transactionId.set('KMAA-' + Date.now().toString(36).toUpperCase());
    this.paymentDate.set(
      new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    // 📌 SIMULATION : enregistrer l'inscription dans localStorage
    // Plus tard, remplacer par un appel API réel
    if (found) {
      try {
        const key = 'kmaa_enrollments';
        const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
        if (!existing.some((e: any) => e.courseId === found.id)) {
          existing.push({
            courseId: found.id,
            courseSlug: String(found.id),
            title: found.title,
            image: found.image,
            subject: found.subject,
            progressPercent: 0,
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
            certificateIssued: false,
          });
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } catch { /* ignore */ }
    }
  }

  // ============================================
  // ACTIONS
  // ============================================
  goToCourse(): void {
    const c = this.course();
    if (!c) {
      this.router.navigate(['/apprendre']);
      return;
    }
    // ✅ Redirection vers le lecteur de cours
    this.router.navigate(['/apprentissage', c.id]);
  }

  goToDashboard(): void {
    this.router.navigate(['/apprendre']);
  }

  goToSpace(): void {
    this.router.navigate(['/compte/espace']);
  }
}