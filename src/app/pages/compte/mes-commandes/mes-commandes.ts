import {
  ChangeDetectionStrategy, Component, computed, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toAbsoluteUrl } from '../../../shared/formateur-content.service';

// ✅ Interface mise à jour pour accepter les champs entreprise
interface ApiOrder {
  id: string;
  reference: string;
  invoiceNumber: string;
  type: 'course' | 'enterprise';
  status: 'paid' | 'pending' | 'refunded';
  courseId: number;
  courseTitle: string;
  courseImage: string;
  courseProvider: string;
  subtotal: number;
  discount: number;
  tva: number;
  total: number;
  promoCode?: string | null;
  paymentMethod: string;
  paymentMethodLabel: string;
  transactionId: string;
  customerName: string;
  customerEmail: string;
  createdAt?: string;
  paidAt?: string;
  
  // ✅ Champs spécifiques aux commandes entreprises
  seatsTotal?: number;
  planName?: string;
  companyName?: string;
  companyAddress?: string;
  companyTaxId?: string;
}

type FilterType = 'all' | 'course' | 'enterprise';

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-commandes.html',
  styleUrl: './mes-commandes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesCommandes implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://127.0.0.1:8000/api';

  readonly orders = signal<ApiOrder[]>([]);
  readonly isLoading = signal(true);

  readonly activeFilter = signal<FilterType>('all');
  readonly searchQuery = signal<string>('');
  readonly selectedOrder = signal<ApiOrder | null>(null);
    // ✅ 1. Expose la fonction pour le HTML
  readonly assetUrl = toAbsoluteUrl;

  // ✅ 2. Ajoute un état pour savoir quelle facture est en cours de téléchargement
  readonly downloadingId = signal<string | null>(null);

  readonly stats = computed(() => {
    const list = this.orders();
    return {
      totalOrders: list.length,
      totalSpent: list.reduce((sum, o) => sum + o.total, 0),
      courseOrders: list.filter((o) => o.type === 'course').length,
      enterpriseOrders: list.filter((o) => o.type === 'enterprise').length,
    };
  });

  readonly filteredOrders = computed(() => {
    let list = this.orders();
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();

    if (filter !== 'all') list = list.filter((o) => o.type === filter);

    if (query) {
      list = list.filter(
        (o) =>
          o.courseTitle.toLowerCase().includes(query) ||
          o.reference.toLowerCase().includes(query) ||
          o.invoiceNumber.toLowerCase().includes(query) ||
          (o.companyName && o.companyName.toLowerCase().includes(query))
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.http.get<{ data: ApiOrder[] }>(`${this.apiBase}/me/orders`).subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setFilter(filter: FilterType): void { this.activeFilter.set(filter); }
  onSearchInput(event: Event): void { this.searchQuery.set((event.target as HTMLInputElement).value); }
  clearSearch(): void { this.searchQuery.set(''); }
  openOrder(order: ApiOrder): void { this.selectedOrder.set(order); }
  closeOrder(): void { this.selectedOrder.set(null); }

   // ✅ 3. Remplace l'ancienne méthode downloadInvoice par celle-ci
  // ✅ Nouvelle méthode avec Fallback (si l'API n'est pas prête)
  downloadInvoice(order: ApiOrder, event?: Event): void {
    event?.stopPropagation();
    
    if (this.downloadingId() === order.id) return;
    this.downloadingId.set(order.id);

    // On tente d'abord l'API
    this.http.get(`${this.apiBase}/orders/${order.id}/invoice`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        // Si ça marche, on télécharge le vrai PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Facture_${order.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.downloadingId.set(null);
      },
      error: (err) => {
        // 🚨 SI L'API PLANTE (404), ON FAIT UNE IMPRESSION HTML
        console.warn('API facture indisponible, génération locale...', err);
        this.generateLocalInvoice(order);
        this.downloadingId.set(null);
      }
    });
  }

  // ✅ Méthode locale pour générer une facture imprimable
  private generateLocalInvoice(order: ApiOrder): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Facture ${order.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #b87333; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #b87333; }
            .title { font-size: 28px; font-weight: bold; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .info-block h4 { margin-bottom: 10px; color: #b87333; }
            .info-block p { margin: 5px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
            th { background-color: #f9f9f9; color: #555; }
            .total-row { font-weight: bold; font-size: 18px; text-align: right; }
            .total-row td { border-bottom: none; padding-top: 20px; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">KMAA Academy</div>
              <p style="margin-top: 5px; font-size: 14px;">Ouagadougou, Burkina Faso</p>
            </div>
            <div style="text-align: right;">
              <div class="title">FACTURE</div>
              <p style="margin-top: 5px; font-size: 14px;"><strong>N° :</strong> ${order.invoiceNumber}</p>
              <p style="font-size: 14px;"><strong>Date :</strong> ${this.formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-block">
              <h4>Facturé à :</h4>
              <p><strong>${order.companyName || order.customerName}</strong></p>
              <p>${order.customerEmail}</p>
              ${order.companyAddress ? `<p>${order.companyAddress}</p>` : ''}
            </div>
            <div class="info-block">
              <h4>Paiement :</h4>
              <p><strong>Mode :</strong> ${order.paymentMethodLabel}</p>
              <p><strong>Statut :</strong> ${this.statusLabel(order.status)}</p>
              <p><strong>Transaction :</strong> ${order.transactionId}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qté</th>
                <th>Prix Unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.courseTitle} ${order.planName ? `(${order.planName})` : ''}</td>
                <td>${order.seatsTotal || 1}</td>
                <td>${this.formatPrice(order.subtotal / (order.seatsTotal || 1))}</td>
                <td>${this.formatPrice(order.subtotal)}</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: right;">
            <p>Sous-total : ${this.formatPrice(order.subtotal)}</p>
            ${order.discount > 0 ? `<p>Réduction : -${this.formatPrice(order.discount)}</p>` : ''}
            <p>TVA (18%) : ${this.formatPrice(order.tva)}</p>
            <p class="total-row">Total TTC : ${this.formatPrice(order.total)}</p>
          </div>

          <div class="footer">
            Merci de votre confiance !<br>
            KMAA Academy - contact@kmaa.com
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      // printWindow.close(); // Décommente pour fermer automatiquement après impression
    }, 500);
  }

  formatPrice(amount: number): string { return amount.toLocaleString('fr-FR') + ' FCFA'; }

  formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateTime(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  statusLabel(status: string): string {
    return { paid: 'Payé', pending: 'En attente', refunded: 'Remboursé' }[status] || status;
  }

  orderTypeLabel(type: string): string {
    return type === 'course' ? 'Cours individuel' : 'Abonnement entreprise';
  }
}