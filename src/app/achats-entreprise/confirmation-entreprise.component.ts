import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EntrepriseSubscriptionService, EnterpriseLicense } from './entreprise-subscription.service';
import { toAbsoluteUrl } from '../shared/formateur-content.service';

@Component({
  selector: 'app-confirmation-entreprise',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmation-entreprise.component.html',
  styleUrl: './confirmation-entreprise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationEntrepriseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private subService = inject(EntrepriseSubscriptionService);

  private readonly apiBase = 'http://127.0.0.1:8000/api';

  readonly license = signal<EnterpriseLicense | null>(null);
  readonly order = signal<any | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
    // ✅ 1. Expose la fonction pour le HTML
  readonly assetUrl = toAbsoluteUrl;

  // ✅ 2. Ajoute un état pour le bouton de téléchargement
  readonly isDownloading = signal<boolean>(false);

  readonly invoiceNumber = computed(() => this.order()?.invoiceNumber ?? '');
  readonly transactionId = computed(() => this.order()?.transactionId ?? '');
  readonly paymentDate = computed(() => {
    const paidAt = this.order()?.paidAt;
    if (!paidAt) return '';
    try {
      return new Date(paidAt).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return paidAt; }
  });

  ngOnInit(): void {
    const licenseId = this.route.snapshot.queryParamMap.get('licenseId');
    if (!licenseId) {
      this.loading.set(false);
      this.error.set('Aucune licence à afficher.');
      return;
    }

    // 1) Charger la licence
    this.subService.getLicense(licenseId).subscribe({
      next: (res) => {
        this.license.set(res.data);
        this.loading.set(false);

        // 2) Charger l'order associée via /me/orders (filtrage côté client)
        this.http.get<{ data: any[] }>(`${this.apiBase}/me/orders`).subscribe({
          next: (ordersRes) => {
            const match = ordersRes.data.find((o: any) =>
              o.type === 'enterprise' &&
              o.courseId === res.data.courseId &&
              o.companyName === res.data.companyName
            );
            if (match) this.order.set(match);
          },
          error: () => { /* on a déjà la licence, l'order est bonus */ },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Licence introuvable.');
      },
    });
  }

  goToLicenses(): void {
    this.router.navigate(['/achats-entreprise/licences']);
  }

  goToCourse(): void {
    const l = this.license();
    if (!l) {
      this.router.navigate(['/apprendre']);
      return;
    }
    this.router.navigate(['/apprentissage', l.courseId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/apprendre']);
  }

  // ✅ 3. Remplace la méthode printInvoice() par downloadInvoice()
  downloadInvoice(): void {
    const o = this.order();
    if (!o || this.isDownloading()) return;

    this.isDownloading.set(true);

    // Appel à l'API pour récupérer le fichier PDF de la commande
    this.http.get(`${this.apiBase}/orders/${o.id}/invoice`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Facture_${o.invoiceNumber || 'Entreprise'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isDownloading.set(false);
      },
      error: (err) => {
        console.error('Erreur téléchargement facture', err);
        alert("Impossible de télécharger la facture pour le moment. Vérifiez que l'API est disponible.");
        this.isDownloading.set(false);
      }
    });
  }


  formatPrice(n?: number): string {
    if (n == null) return '—';
    return n.toLocaleString('fr-FR') + ' FCFA';
  }
}