import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntrepriseSubscriptionService, EnterpriseLicense } from './entreprise-subscription.service';

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
  private subService = inject(EntrepriseSubscriptionService);

  readonly license = signal<EnterpriseLicense | null>(null);
  readonly transactionId = signal<string>('');
  readonly paymentDate = signal<string>('');

  readonly invoiceNumber = computed(() => {
    const l = this.license();
    if (!l) return '';
    return 'FAC-' + l.id.toUpperCase().slice(-8);
  });

  ngOnInit(): void {
    const licenseId = this.route.snapshot.queryParamMap.get('licenseId');
    if (licenseId) {
      this.subService.reload();
      const found = this.subService.licenses().find((l) => l.id === licenseId);
      if (found) {
        this.license.set(found);
        this.transactionId.set('TX-' + Date.now().toString(36).toUpperCase());
        this.paymentDate.set(
          new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      }
    }
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

  formatPrice(n: number): string {
    return n.toLocaleString('fr-FR') + ' FCFA';
  }
}