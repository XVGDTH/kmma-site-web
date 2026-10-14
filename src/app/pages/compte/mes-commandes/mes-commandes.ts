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
import { RouterLink } from '@angular/router';

import { OrdersService, OrderItem, OrderType } from '../../../shared/orders.service';

type FilterType = 'all' | OrderType;

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-commandes.html',
  styleUrl: './mes-commandes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MesCommandes implements OnInit {

  private readonly ordersService = inject(OrdersService);

  // ============================================================
  // ÉTAT
  // ============================================================
  readonly activeFilter = signal<FilterType>('all');
  readonly searchQuery = signal<string>('');
  readonly selectedOrder = signal<OrderItem | null>(null);

  // ============================================================
  // DONNÉES
  // ============================================================
  readonly stats = this.ordersService.stats;

  readonly filteredOrders = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();
    let list = this.ordersService.sortedOrders();

    if (filter !== 'all') {
      list = list.filter((o) => o.type === filter);
    }

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

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit(): void {
    this.ordersService.reload();
    // Démo : injecte 3 commandes si vide
    this.ordersService.seedDemoOrders();
  }

  // ============================================================
  // FILTRES
  // ============================================================
  setFilter(filter: FilterType): void {
    this.activeFilter.set(filter);
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  // ============================================================
  // DÉTAILS
  // ============================================================
  openOrder(order: OrderItem): void {
    this.selectedOrder.set(order);
  }

  closeOrder(): void {
    this.selectedOrder.set(null);
  }

  // ============================================================
  // TÉLÉCHARGEMENT
  // ============================================================
  downloadInvoice(order: OrderItem, event?: Event): void {
    event?.stopPropagation();
    this.ordersService.printInvoice(order.id);
  }

  // ============================================================
  // HELPERS
  // ============================================================
  formatPrice(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(iso: string): string {
    return this.ordersService.formatDate(iso);
  }

  formatDateTime(iso: string): string {
    return this.ordersService.formatDateTime(iso);
  }

  statusLabel(status: string): string {
    return this.ordersService.statusLabel(status as any);
  }

  paymentMethodLabel(method: string): string {
    return this.ordersService.paymentMethodLabel(method as any);
  }

  orderTypeLabel(type: OrderType): string {
    return type === 'course' ? 'Cours individuel' : 'Abonnement entreprise';
  }

  getInitials(name: string): string {
    if (!name) return 'K';
    return name.charAt(0).toUpperCase();
  }
}