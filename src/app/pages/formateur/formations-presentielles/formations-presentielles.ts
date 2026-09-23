import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { API_URL } from '../../../shared/formateur-content.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-formations-presentielles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './formations-presentielles.html',
  styleUrl: './formations-presentielles.scss', 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormationsPresentielles {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  readonly trainings = signal<any[]>([]);
  readonly creating = signal(false);
  readonly showForm = signal(false);
  readonly message = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    starts_at: ['', Validators.required],
    ends_at: ['', Validators.required],
    days_count: [1, [Validators.required, Validators.min(1)]],
    hours_count: [8],
    location: [''],
    instructor_name: [''],
    instructor_role: [''],
    // expected_participants: [null],
    max_participants: [null],
    certificate_type: ['attestation', Validators.required],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.http.get<{ data: any[] }>(`${API_URL}/formateur/presential-trainings`)
      .subscribe(res => this.trainings.set(res.data ?? []));
  }

  submit(): void {
    if (this.form.invalid || this.creating()) return;

    this.creating.set(true);
    this.http.post<{ data: any }>(`${API_URL}/formateur/presential-trainings`, this.form.getRawValue())
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.showForm.set(false);
          this.form.reset();
          this.load();
          this.flash('Formation créée. Copiez le lien.');
        },
        error: () => this.creating.set(false),
      });
  }

  copyLink(training: any): void {
    const url = `${window.location.origin.replace('4200', '8000')}/p/${training.registration_token}`;
    navigator.clipboard.writeText(url);
    this.flash('Lien copié !');
  }

  private flash(msg: string): void {
    this.message.set(msg);
    setTimeout(() => this.message.set(null), 4000);
  }
}