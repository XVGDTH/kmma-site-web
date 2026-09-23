import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  CoursePayload,
  extractApiError,
  FormateurContentService,
} from '../../../shared/formateur-content.service';

@Component({
  selector: 'app-creer-cours',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './creer-cours.html',
  styleUrl: './creer-cours.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreerCours {

  private readonly contentService = inject(FormateurContentService);
  private readonly router = inject(Router);

  // ----------------------------------------------------------
  // Champs du formulaire
  // ----------------------------------------------------------

  readonly title = signal('');
  readonly subject = signal('');
  readonly category = signal('');
  readonly level = signal('');
  readonly diploma = signal('');
  readonly durationFull = signal('');
  readonly durationAlternance = signal('');
  readonly description = signal('');
  readonly imageFile = signal<File | null>(null);

  /** URL locale de prévisualisation de l'image choisie. */
  readonly imagePreview = signal<string | null>(null);

  readonly levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly canSave = computed(() => this.title().trim().length >= 3);

  /** Progression du formulaire (7 champs suivis). */
  readonly formProgress = computed(() => {
    const fields = [
      this.title().trim(),
      this.subject().trim(),
      this.category().trim(),
      this.level(),
      this.diploma().trim(),
      this.description().trim(),
      this.imageFile(),
    ];
    const filled = fields.filter((f) => (typeof f === 'string' ? f.length > 0 : f !== null)).length;
    return Math.round((filled / fields.length) * 100);
  });

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    // Libère l'ancienne URL de prévisualisation
    const previous = this.imagePreview();
    if (previous) URL.revokeObjectURL(previous);

    this.imageFile.set(file);
    this.imagePreview.set(file ? URL.createObjectURL(file) : null);
  }

  save(): void {
    if (!this.canSave() || this.saving()) return;

    const payload: CoursePayload = {
      title: this.title().trim(),
      subject: this.subject().trim() || undefined,
      category: this.category().trim() || undefined,
      level: this.level() || undefined,
      diploma: this.diploma().trim() || undefined,
      durationFull: this.durationFull().trim() || undefined,
      durationAlternance: this.durationAlternance().trim() || undefined,
      description: this.description().trim() || undefined,
      image: this.imageFile(),
    };

    this.saving.set(true);
    this.error.set(null);

    this.contentService.createCourse(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.router.navigate(['/formateur/importer-cours', res.data.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(extractApiError(err));
      },
    });
  }
}