import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // ✅ Import nécessaire
import {
  EntrepriseSubscriptionService,
  EnterpriseLicense,
  TeamMember,
} from './entreprise-subscription.service';
import { toAbsoluteUrl } from '../shared/formateur-content.service';

@Component({
  selector: 'app-licences-entreprise',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './licences-entreprise.component.html',
  styleUrl: './licences-entreprise.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicencesEntrepriseComponent implements OnInit {
  // ✅ Injection des services
  private subService = inject(EntrepriseSubscriptionService);
  private http = inject(HttpClient); 

  // État global
  readonly licenses = this.subService.activeLicenses;
  readonly loading = this.subService.loading;
  readonly error = this.subService.error;
  readonly totalSeats = this.subService.totalSeats;
  readonly totalSeatsUsed = this.subService.totalSeatsUsed;

  // ✅ État local
  readonly assetUrl = toAbsoluteUrl;
  readonly isDownloading = signal<boolean>(false);
  readonly selectedLicenseId = signal<string | null>(null);
  readonly newEmail = signal<string>('');
  readonly feedbackMsg = signal<string | null>(null);
  readonly feedbackError = signal<string | null>(null);
  readonly isSubmitting = signal<boolean>(false);

  readonly selectedLicense = computed(() => {
    const id = this.selectedLicenseId();
    if (!id) return null;
    return this.licenses().find((l) => l.id === id) ?? null;
  });

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit(): void {
    this.subService.reload();
  }

  // ============================================================
  // TÉLÉCHARGEMENT FACTURE
  // ============================================================
  downloadInvoice(licenseId: string): void {
    if (this.isDownloading()) return;
    this.isDownloading.set(true);

    this.http.get(`http://127.0.0.1:8000/api/licenses/${licenseId}/invoice`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Facture_Licence_${licenseId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isDownloading.set(false);
      },
      error: (err: any) => { // ✅ Ajout de ": any" pour corriger l'erreur TS7006
        console.error('Erreur téléchargement', err);
        alert("Impossible de télécharger la facture.");
        this.isDownloading.set(false);
      }
    });
  }

  // ============================================================
  // UI
  // ============================================================
  selectLicense(lic: EnterpriseLicense): void {
    this.selectedLicenseId.set(lic.id);
    this.newEmail.set('');
    this.feedbackMsg.set(null);
    this.feedbackError.set(null);
  }

  closeDetail(): void {
    this.selectedLicenseId.set(null);
    this.feedbackMsg.set(null);
    this.feedbackError.set(null);
  }

  onEmailInput(e: Event): void {
    this.newEmail.set((e.target as HTMLInputElement).value);
  }

  // ============================================================
  // INVITER
  // ============================================================
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

    this.isSubmitting.set(true);

    this.subService.inviteMember(lic.id, email).subscribe({
      next: (res) => {
        this.feedbackMsg.set(res.message);
        this.newEmail.set('');
        this.isSubmitting.set(false);
      },
      error: (err: any) => { // ✅ Ajout de ": any"
        this.feedbackError.set(
          err?.error?.message ?? 'Erreur lors de l\'invitation.'
        );
        this.isSubmitting.set(false);
      },
    });
  }

  // ============================================================
  // RETIRER
  // ============================================================
  removeMember(member: TeamMember): void {
    const lic = this.selectedLicense();
    if (!lic) return;

    if (!confirm(`Retirer ${member.email} de la licence ?`)) return;

    this.subService.removeMember(lic.id, member.id).subscribe({
      next: () => {
        this.feedbackMsg.set(`${member.email} a été retiré.`);
      },
      error: (err: any) => { // ✅ Ajout de ": any"
        this.feedbackError.set(
          err?.error?.message ?? 'Erreur lors du retrait.'
        );
      },
    });
  }

  // ============================================================
  // RENVOYER INVITATION
  // ============================================================
  resendInvitation(member: TeamMember): void {
    const lic = this.selectedLicense();
    if (!lic) return;

    this.subService.resendInvitation(lic.id, member.id).subscribe({
      next: (res) => this.feedbackMsg.set(res.message),
      error: (err: any) => this.feedbackError.set( // ✅ Ajout de ": any"
        err?.error?.message ?? 'Erreur lors du renvoi.'
      ),
    });
  }

  // ============================================================
  // HELPERS
  // ============================================================
  progressPercent(lic: EnterpriseLicense): number {
    if (lic.seatsTotal === 0) return 0;
    return Math.round((lic.seatsUsed / lic.seatsTotal) * 100);
  }

  formatPrice(n: number): string {
    return n.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(iso?: string): string {
    if (!iso) return '—';
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