import { Injectable, computed, signal } from '@angular/core';

// ============================================================
// TYPES
// ============================================================
export type OrderType = 'course' | 'enterprise';
export type OrderStatus = 'paid' | 'pending' | 'refunded';
export type PaymentMethod = 'orange' | 'moov' | 'telecel' | 'card' | 'virement';

export interface OrderItem {
  id: string;
  reference: string;              // "KMAA-2026-000123"
  type: OrderType;
  status: OrderStatus;

  // Cours acheté
  courseId: number;
  courseTitle: string;
  courseImage: string;
  courseProvider: string;

  // Détails finance
  subtotal: number;
  discount: number;
  tva: number;
  total: number;
  currency: 'FCFA';
  promoCode?: string;

  // Méthode de paiement
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  transactionId: string;

  // Client
  customerName: string;
  customerEmail: string;
  companyName?: string;
  companyAddress?: string;
  companyTaxId?: string;

  // Si entreprise
  planId?: string;
  planName?: string;
  seatsTotal?: number;
  seatsUsed?: number;

  // Dates
  createdAt: string;
  paidAt?: string;

  // Facture
  invoiceNumber: string;
  invoiceUrl?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  courseOrders: number;
  enterpriseOrders: number;
  paidOrders: number;
}

// ============================================================
// SERVICE
// ============================================================
@Injectable({ providedIn: 'root' })
export class OrdersService {

  private readonly STORAGE_KEY = 'kmaa_orders';

  readonly orders = signal<OrderItem[]>([]);

  // ============================================================
  // COMPUTED
  // ============================================================
  readonly sortedOrders = computed(() =>
    [...this.orders()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  readonly stats = computed<OrderStats>(() => {
    const list = this.orders();
    return {
      totalOrders: list.length,
      totalSpent: list.reduce((sum, o) => sum + o.total, 0),
      courseOrders: list.filter((o) => o.type === 'course').length,
      enterpriseOrders: list.filter((o) => o.type === 'enterprise').length,
      paidOrders: list.filter((o) => o.status === 'paid').length,
    };
  });

  constructor() {
    this.reload();
  }

  // ============================================================
  // LECTURE
  // ============================================================
  reload(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const list: OrderItem[] = raw ? JSON.parse(raw) : [];
      this.orders.set(list);
    } catch {
      this.orders.set([]);
    }
  }

  getOrder(id: string): OrderItem | null {
    return this.orders().find((o) => o.id === id) ?? null;
  }

  // ============================================================
  // CRÉATION
  // ============================================================
  createOrder(data: Omit<OrderItem, 'id' | 'reference' | 'invoiceNumber' | 'createdAt'>): OrderItem {
    const id = 'ord_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const reference = this.generateReference();
    const invoiceNumber = this.generateInvoiceNumber();

    const order: OrderItem = {
      ...data,
      id,
      reference,
      invoiceNumber,
      createdAt: new Date().toISOString(),
      paidAt: data.status === 'paid' ? new Date().toISOString() : undefined,
    };

    const list = [order, ...this.orders()];
    this.orders.set(list);
    this.persist();

    return order;
  }

  // ============================================================
  // HELPERS
  // ============================================================
  private generateReference(): string {
    const year = new Date().getFullYear();
    const count = this.orders().length + 1;
    const num = count.toString().padStart(6, '0');
    return `KMAA-${year}-${num}`;
  }

  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const count = this.orders().length + 1;
    const num = count.toString().padStart(5, '0');
    return `FAC-${year}-${num}`;
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  formatDateTime(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  paymentMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      orange: 'Orange Money',
      moov: 'Moov Money',
      telecel: 'Telecel Money',
      card: 'Carte bancaire',
      virement: 'Virement bancaire',
    };
    return labels[method];
  }

  statusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      paid: 'Payé',
      pending: 'En attente',
      refunded: 'Remboursé',
    };
    return labels[status];
  }

  // ============================================================
  // IMPRESSION / TÉLÉCHARGEMENT PDF
  // ============================================================
  printInvoice(orderId: string): void {
    const order = this.getOrder(orderId);
    if (!order) return;

    // Ouvre une nouvelle fenêtre avec le HTML de la facture
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      alert('Veuillez autoriser les pop-ups pour télécharger la facture.');
      return;
    }

    printWindow.document.write(this.buildInvoiceHtml(order));
    printWindow.document.close();

    // Attendre le chargement puis imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    };
  }

  private buildInvoiceHtml(order: OrderItem): string {
    const itemsHtml = `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #eee;">
          <strong>${order.courseTitle}</strong><br>
          <span style="font-size: 12px; color: #666;">${order.courseProvider}</span>
          ${order.planName ? `<br><span style="font-size: 12px; color: #666;">Formule : ${order.planName}</span>` : ''}
          ${order.seatsTotal ? `<br><span style="font-size: 12px; color: #666;">${order.seatsTotal} apprenant(s)</span>` : ''}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right;">
          ${order.subtotal.toLocaleString('fr-FR')} FCFA
        </td>
      </tr>
    `;

    const discountHtml = order.discount > 0 ? `
      <tr>
        <td style="padding: 8px; text-align: right; color: #16a34a;">
          Réduction${order.promoCode ? ` (${order.promoCode})` : ''}
        </td>
        <td style="padding: 8px; text-align: right; color: #16a34a;">
          -${order.discount.toLocaleString('fr-FR')} FCFA
        </td>
      </tr>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture ${order.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2a28; padding: 40px; }
          .invoice { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 30px; border-bottom: 3px solid #b87333; margin-bottom: 30px; }
          .brand { display: flex; align-items: center; gap: 15px; }
          .brand-logo { width: 60px; height: 60px; border-radius: 12px; background: linear-gradient(135deg, #0e3b32, #082621); color: #e6a869; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; }
          .brand-info h1 { font-size: 22px; color: #0e3b32; font-weight: 800; margin-bottom: 4px; }
          .brand-info p { font-size: 12px; color: #5c6b66; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { font-size: 28px; color: #b87333; font-weight: 800; margin-bottom: 8px; }
          .invoice-title p { font-size: 13px; color: #5c6b66; margin-bottom: 4px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .info-block h3 { font-size: 12px; color: #b87333; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .info-block p { font-size: 13px; color: #1f2a28; line-height: 1.6; }
          .info-block p strong { color: #0e3b32; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          thead th { background: #0e3b32; color: #fff; padding: 12px 8px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          thead th:last-child { text-align: right; }
          .totals { margin-left: auto; width: 320px; }
          .totals tr td { padding: 8px; font-size: 14px; }
          .totals tr td:first-child { color: #5c6b66; }
          .totals tr td:last-child { text-align: right; font-weight: 600; }
          .totals .total-row { border-top: 2px solid #0e3b32; padding-top: 12px; }
          .totals .total-row td { font-size: 18px; font-weight: 800; color: #b87333; padding-top: 12px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #94a3b8; }
          .footer p { margin-bottom: 6px; }
          .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; background: rgba(34, 197, 94, 0.12); color: #15803d; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">

          <div class="header">
            <div class="brand">
              <div class="brand-logo">K</div>
              <div class="brand-info">
                <h1>KMAA Academy</h1>
                <p>Votre site web de formation professionnelle</p>
                <p>Ouagadougou, Burkina Faso</p>
                <p>admin@convergesas.com · +226 54 78 55 55</p>
              </div>
            </div>
            <div class="invoice-title">
              <h2>FACTURE</h2>
              <p><strong>${order.invoiceNumber}</strong></p>
              <p>Réf. ${order.reference}</p>
              <p style="margin-top: 10px;">
                <span class="status-badge">${this.statusLabel(order.status)}</span>
              </p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-block">
              <h3>Facturé à</h3>
              ${order.companyName ? `<p><strong>${order.companyName}</strong></p>` : ''}
              <p>${order.customerName}</p>
              <p>${order.customerEmail}</p>
              ${order.companyAddress ? `<p>${order.companyAddress}</p>` : ''}
              ${order.companyTaxId ? `<p>N° IFU : ${order.companyTaxId}</p>` : ''}
            </div>
            <div class="info-block">
              <h3>Détails</h3>
              <p><strong>Date d'émission :</strong> ${this.formatDate(order.createdAt)}</p>
              ${order.paidAt ? `<p><strong>Date de paiement :</strong> ${this.formatDate(order.paidAt)}</p>` : ''}
              <p><strong>Mode de paiement :</strong> ${order.paymentMethodLabel}</p>
              <p><strong>Transaction :</strong> ${order.transactionId}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th style="text-align: right;">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              ${discountHtml}
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <td>Sous-total</td>
              <td>${order.subtotal.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            ${order.discount > 0 ? `
              <tr>
                <td>Réduction</td>
                <td style="color: #16a34a;">-${order.discount.toLocaleString('fr-FR')} FCFA</td>
              </tr>
            ` : ''}
            <tr>
              <td>TVA (18%)</td>
              <td>${order.tva.toLocaleString('fr-FR')} FCFA</td>
            </tr>
            <tr class="total-row">
              <td>TOTAL TTC</td>
              <td>${order.total.toLocaleString('fr-FR')} FCFA</td>
            </tr>
          </table>

          <div class="footer">
            <p><strong>KMAA Academy</strong> — Société par Actions Simplifiée (SAS)</p>
            <p>Siège social : Ouagadougou, Burkina Faso · RCCM BF-OUA-01-2020-B12-00456 · IFU 000123456A</p>
            <p style="margin-top: 15px;">Merci de votre confiance.</p>
          </div>

        </div>
      </body>
      </html>
    `;
  }

  // ============================================================
  // PERSISTANCE
  // ============================================================
  private persist(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.orders()));
    } catch { /* ignore */ }
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.orders.set([]);
  }

  // ============================================================
  // DÉMO : Injecter des commandes de test
  // ============================================================
  seedDemoOrders(): void {
    if (this.orders().length > 0) return;

    const demoOrders: OrderItem[] = [
      {
        id: 'ord_demo_1',
        reference: 'KMAA-2026-000001',
        type: 'course',
        status: 'paid',
        courseId: 6,
        courseTitle: 'Fiscalité des entreprises : Optimisation et contentieux',
        courseImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=60',
        courseProvider: 'KMAA Juridique',
        subtotal: 200000,
        discount: 20000,
        tva: 32400,
        total: 212400,
        currency: 'FCFA',
        promoCode: 'KMAA10',
        paymentMethod: 'orange',
        paymentMethodLabel: 'Orange Money',
        transactionId: 'TX-8A2B4C6D',
        customerName: 'Salomon Bationo',
        customerEmail: 'salomonbationo45@gmail.com',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        paidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        invoiceNumber: 'FAC-2026-00001',
      },
      {
        id: 'ord_demo_2',
        reference: 'KMAA-2026-000002',
        type: 'enterprise',
        status: 'paid',
        courseId: 10001,
        courseTitle: 'Commissariat aux comptes : Normes OHADA et ISA pour les entreprises',
        courseImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=60',
        courseProvider: 'KMAA Entreprises',
        subtotal: 1900000,
        discount: 285000,
        tva: 290700,
        total: 1905700,
        currency: 'FCFA',
        promoCode: 'BULK15',
        paymentMethod: 'virement',
        paymentMethodLabel: 'Virement bancaire',
        transactionId: 'TX-9F3E5A7B',
        customerName: 'Directeur RH',
        customerEmail: 'rh@entreprise.bf',
        companyName: 'Cabinet Audit BF SARL',
        companyAddress: 'Avenue Kwame Nkrumah, Ouagadougou',
        companyTaxId: 'IFU 000654321B',
        planId: 'standard',
        planName: 'Standard',
        seatsTotal: 5,
        seatsUsed: 3,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        paidAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        invoiceNumber: 'FAC-2026-00002',
      },
      {
        id: 'ord_demo_3',
        reference: 'KMAA-2026-000003',
        type: 'course',
        status: 'paid',
        courseId: 7,
        courseTitle: 'Analyse de données avec Excel et Power BI',
        courseImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=60',
        courseProvider: 'KMAA Tech',
        subtotal: 120000,
        discount: 0,
        tva: 21600,
        total: 141600,
        currency: 'FCFA',
        paymentMethod: 'moov',
        paymentMethodLabel: 'Moov Money',
        transactionId: 'TX-1B7D3F9E',
        customerName: 'Salomon Bationo',
        customerEmail: 'salomonbationo45@gmail.com',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        paidAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        invoiceNumber: 'FAC-2026-00003',
      },
    ];

    this.orders.set(demoOrders);
    this.persist();
  }
}