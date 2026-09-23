import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { API_URL, LARAVEL_URL } from '../../../../shared/formateur-content.service';

@Component({
  selector: 'app-participants-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './participants.html',
  styleUrl: './participants.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantsPage {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  readonly trainingId = Number(this.route.snapshot.paramMap.get('id'));

  readonly training = signal<any>(null);
  readonly participants = signal<any[]>([]);
  readonly loading = signal(true);
  readonly message = signal<string | null>(null);

  readonly registrationUrl = computed(() =>
    this.training() ? `${LARAVEL_URL}/p/${this.training().registration_token}` : ''
  );

  readonly participantsWithCert = computed(() =>
    this.participants().filter((p) => p.certificateId && !p.revoked)
  );

  readonly participantsRevoked = computed(() =>
    this.participants().filter((p) => p.revoked)
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.http
      .get<{ data: any }>(`${API_URL}/formateur/presential-trainings/${this.trainingId}`)
      .subscribe({
        next: (res) => {
          this.training.set(res.data);
          this.participants.set(res.data.participants ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  copyRegistrationLink(): void {
    navigator.clipboard.writeText(this.registrationUrl());
    this.flash('🔗 Lien d\'inscription copié !');
  }

  copyVerificationLink(participant: any): void {
    const url = `${LARAVEL_URL}/verifier-certificat/${participant.certificateUuid}`;
    navigator.clipboard.writeText(url);
    this.flash('🔗 Lien de vérification copié !');
  }

  downloadCertificate(participant: any): void {
    if (!participant.certificateUrl) {
      this.flash('Aucun certificat à télécharger.');
      return;
    }
    window.open(participant.certificateUrl, '_blank');
  }

  downloadAllZip(): void {
    const ids = this.participantsWithCert().map((p) => p.certificateId).join(',');
    if (!ids) {
      this.flash('Aucun certificat à télécharger.');
      return;
    }
    window.open(
      `${LARAVEL_URL}/admin/certificates/download-zip?ids=${ids}`,
      '_blank'
    );
  }

  /** Compte des certificats prêts */
  get readyCount(): number {
    return this.participantsWithCert().length;
  }

  private flash(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(null), 4000);
  }
}