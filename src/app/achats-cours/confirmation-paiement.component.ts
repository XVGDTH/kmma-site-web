import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toAbsoluteUrl } from '../shared/formateur-content.service';

// ============================================================
// TYPES — alignés sur OrderController@format côté backend
// ============================================================
interface OrderDto {
  id: string;
  reference: string;
  invoiceNumber: string;
  type: 'course' | 'enterprise';
  status: 'paid' | 'pending' | 'refunded';
  courseId: number;
  courseSlug?: string;
  courseTitle?: string;
  courseImage?: string;
  courseImageAlt?: string;
  courseProvider: string;
  subtotal: number;
  discount: number;
  tva: number;
  total: number;
  currency: string;
  promoCode?: string | null;
  paymentMethod: string;
  paymentMethodLabel: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  createdAt?: string;
  paidAt?: string;
}

@Component({
  selector: 'app-confirmation-paiement',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmation-paiement.component.html',
  styleUrl: './confirmation-paiement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationPaiementComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  private readonly apiBase = 'http://127.0.0.1:8000/api';

  // ============================================================
  // ÉTAT
  // ============================================================
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly order = signal<OrderDto | null>(null);
    // ✅ 1. Expose la fonction pour le HTML
  readonly assetUrl = toAbsoluteUrl;
    // ✅ 2. Ajoute un état pour le téléchargement
  readonly isDownloading = signal<boolean>(false);

  // ============================================================
  // COMPUTED
  // ============================================================
  readonly invoiceNumber = computed(() => this.order()?.invoiceNumber ?? '');
  readonly transactionId = computed(() => this.order()?.transactionId ?? '');

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit(): void {
    // Le paiement redirige vers /achats-cours/confirmation/:id
    // où :id = order_uuid renvoyé par POST /api/payments
    const uuid = this.route.snapshot.paramMap.get('id');

    // Fallback : si l'uuid est passé en query param
    const uuidFromQuery = this.route.snapshot.queryParamMap.get('orderId');

    const orderUuid = uuid || uuidFromQuery;

    if (!orderUuid) {
      this.isLoading.set(false);
      this.errorMessage.set('Aucune commande à afficher.');
      return;
    }

    this.http.get<{ data: OrderDto }>(`${this.apiBase}/orders/${orderUuid}`)
      .subscribe({
        next: (res) => {
          this.order.set(res.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err?.error?.message ?? 'Impossible de récupérer la commande.'
          );
        },
      });
  }

  // ============================================================
  // ACTIONS
  // ============================================================
  goToCourse(): void {
    const o = this.order();
    if (!o) {
      this.router.navigate(['/apprendre']);
      return;
    }
    // Redirection vers le lecteur de cours (par slug ou id)
    const target = o.courseSlug ?? o.courseId;
    this.router.navigate(['/apprentissage', target]);
  }

  goToDashboard(): void {
    this.router.navigate(['/apprendre']);
  }

  goToSpace(): void {
    this.router.navigate(['/compte/espace']);
  }

    // ✅ 3. Ajoute cette méthode pour télécharger la facture
  downloadInvoice(): void {
    const o = this.order();
    if (!o || this.isDownloading()) return;

    this.isDownloading.set(true);

    // On demande le PDF au backend
    this.http.get(`${this.apiBase}/orders/${o.id}/invoice`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Facture_${o.invoiceNumber}.pdf`; // Nom du fichier
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isDownloading.set(false);
      },
      error: (err) => {
        console.error('Erreur téléchargement facture', err);
        alert("Impossible de télécharger la facture pour le moment.");
        this.isDownloading.set(false);
      }
    });
  }

  // ============================================================
  // HELPERS
  // ============================================================
  formatPrice(n?: number): string {
    if (n == null) return '—';
    return n.toLocaleString('fr-FR') + ' FCFA';
  }
}