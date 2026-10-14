import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EntrepriseSubscriptionService, EnterpriseLicense } from './entreprise-subscription.service';

@Component({
  selector: 'app-licences-entreprise',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './licences-entreprise.component.html',
  styleUrl: './licences-entreprise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicencesEntrepriseComponent {
  private subService = inject(EntrepriseSubscriptionService);

  readonly licenses = this.subService.activeLicenses;
  readonly totalSeats = this.subService.totalSeats;
  readonly totalSeatsUsed = this.subService.totalSeatsUsed;

  readonly selectedLicenseId = signal<string | null>(null);
  readonly newEmail = signal<string>('');
  readonly feedbackMsg = signal<string | null>(null);
  readonly feedbackError = signal<string | null>(null);

  readonly selectedLicense = computed(() => {
    const id = this.selectedLicenseId();
    if (!id) return null;
    return this.licenses().find((l) => l.id === id) ?? null;
  });

  selectLicense(lic: EnterpriseLicense): void {
    this.selectedLicenseId.set(lic.id);
    this.newEmail.set('');
    this.feedbackMsg.set(null);
    this.feedbackError.set(null);
  }

  closeDetail(): void {
    this.selectedLicenseId.set(null);
  }

  onEmailInput(e: Event): void {
    this.newEmail.set((e.target as HTMLInputElement).value);
  }

  inviteMember(): void {
    const lic = this.selectedLicense();
    const email = this.newEmail().trim().toLowerCase();
    this.feedbackMsg.set(null);
    this.feedbackError.set(null);

    if (!lic) return;
    if (!email || !email.includes('@')) {
      this.feedbackError.set('Email invalide.');
      return;
    }

    const result = this.subService.inviteMember(lic.id, email);
    if (result.success) {
      this.feedbackMsg.set(result.message);
      this.newEmail.set('');
      this.subService.reload();
    } else {
      this.feedbackError.set(result.message);
    }
  }

  removeMember(memberId: string): void {
    const lic = this.selectedLicense();
    if (!lic) return;
    this.subService.removeMember(lic.id, memberId);
    this.subService.reload();
  }

  progressPercent(lic: EnterpriseLicense): number {
    if (lic.seatsTotal === 0) return 0;
    return Math.round((lic.seatsUsed / lic.seatsTotal) * 100);
  }

  formatPrice(n: number): string {
    return n.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }
}