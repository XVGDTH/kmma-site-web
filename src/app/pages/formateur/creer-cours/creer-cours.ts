import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  CoursePayload, extractApiError, FormateurContentService,
} from '../../../shared/formateur-content.service';

type CourseType = 'individual' | 'enterprise';
type DeliveryMode = 'en_ligne' | 'presentiel' | 'mixte';

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
  // ✅ Type de cours (NOUVEAU)
  // ----------------------------------------------------------
  readonly courseType = signal<CourseType>('individual');

  // ----------------------------------------------------------
  // Champs communs
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
  readonly imagePreview = signal<string | null>(null);

  // ----------------------------------------------------------
  // Champs SPÉCIFIQUES "cours individuel"
  // ----------------------------------------------------------
  readonly price = signal<number>(0);

  // ----------------------------------------------------------
  // Champs SPÉCIFIQUES "cours entreprise" (NOUVEAU)
  // ----------------------------------------------------------
  readonly deliveryMode = signal<DeliveryMode>('en_ligne');
  readonly enterpriseBasePrice = signal<number>(0);
  readonly hoursPerWeek = signal<string>('');

  readonly levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];
  readonly deliveryModes = [
    { value: 'en_ligne',   label: 'En ligne' },
    { value: 'presentiel', label: 'Présentiel' },
    { value: 'mixte',      label: 'Mixte' },
  ];

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly canSave = computed(() => {
    if (this.title().trim().length < 3) return false;
    if (this.courseType() === 'individual' && this.price() < 0) return false;
    if (this.courseType() === 'enterprise' && this.enterpriseBasePrice() < 0) return false;
    return true;
  });

  readonly formProgress = computed(() => {
    const fields = [
      this.title().trim(),
      this.subject().trim(),
      this.category().trim(),
      this.level(),
      this.diploma().trim(),
      this.description().trim(),
      this.imageFile(),
      this.courseType() === 'individual' ? this.price() : this.enterpriseBasePrice(),
    ];
    const filled = fields.filter((f) => (typeof f === 'string' ? f.length > 0 : f !== null && f !== undefined && f !== 0)).length;
    return Math.round((filled / fields.length) * 100);
  });

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const previous = this.imagePreview();
    if (previous) URL.revokeObjectURL(previous);
    this.imageFile.set(file);
    this.imagePreview.set(file ? URL.createObjectURL(file) : null);
  }

  // ============================================================
  // SAUVEGARDE
  // ============================================================
  // save(): void {
  //   if (!this.canSave() || this.saving()) return;

  //   const type = this.courseType();
  //   const payload: CoursePayload = {
  //     title: this.title().trim(),
  //     subject: this.subject().trim() || undefined,
  //     category: this.category().trim() || undefined,
  //     level: this.level() || undefined,
  //     diploma: this.diploma().trim() || undefined,
  //     durationFull: this.durationFull().trim() || undefined,
  //     durationAlternance: this.durationAlternance().trim() || undefined,
  //     description: this.description().trim() || undefined,
  //     image: this.imageFile(),
  //     type: type,
  //   };

  //   // ✅ Champs spécifiques selon le type
  //   if (type === 'individual') {
  //     payload.price = this.price() || 0;
  //   } else {
  //     payload.enterpriseBasePrice = this.enterpriseBasePrice() || 0;
  //     payload.deliveryMode = this.deliveryMode();
  //     payload.hoursPerWeek = this.hoursPerWeek().trim() || undefined;
  //   }

  //   this.saving.set(true);
  //   this.error.set(null);

  //   this.contentService.createCourse(payload).subscribe({
  //     next: (res) => {
  //       this.saving.set(false);
  //       this.router.navigate(['/formateur/importer-cours', res.data.id]);
  //     },
  //     error: (err) => {
  //       this.saving.set(false);
  //       this.error.set(extractApiError(err));
  //     },
  //   });
  // }

  save(): void {
  if (!this.canSave() || this.saving()) return;

  const type = this.courseType();
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
    type: type,
  };

  if (type === 'individual') {
    payload.price = this.price() || 0;
  } else {
    payload.enterpriseBasePrice = this.enterpriseBasePrice() || 0;
    payload.deliveryMode = this.deliveryMode();
    payload.hoursPerWeek = this.hoursPerWeek().trim() || undefined;
  }

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