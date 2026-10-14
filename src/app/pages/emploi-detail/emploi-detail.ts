import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface JobDetail {
  id: string;
  title: string;
  typeLabel: string;
  location: string;
  department: string;
  excerpt: string;
  description: string[];
  missions: string[];
  profile: string[];
  tags: string[];
  image: string;
  imageAlt: string;
}

@Component({
  selector: 'app-emploi-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './emploi-detail.html',
  styleUrl: './emploi-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmploiDetail {

  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  private readonly apiJob = signal<JobDetail | null>(null);

  readonly id = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id') ?? '')),
    { initialValue: '' }
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;

      this.http
        .get<{ data: any }>(`${this.apiUrl}/job-offers/${encodeURIComponent(id)}`)
        .subscribe({
          next: (res) => {
            const d = res?.data;
            if (!d?.title) return;

            this.apiJob.set({
              id: String(d.id ?? id),
              title: d.title,
              typeLabel: d.typeLabel ?? '',
              location: d.location ?? '',
              department: d.department ?? '',
              excerpt: d.excerpt ?? '',
              description: Array.isArray(d.description) && d.description.length
                ? d.description
                : [String(d.excerpt ?? '')],
              missions: Array.isArray(d.missions) ? d.missions : [],
              profile: Array.isArray(d.profile) ? d.profile : [],
              tags: Array.isArray(d.tags) ? d.tags : [],
              image: d.image ?? 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
              imageAlt: d.imageAlt ?? d.title,
            });
          },
          error: () => {},   // â†’ fallback sur le tableau statique
        });
    });
  }

  // ============================================================
  // FILET DE SÃ‰CURITÃ‰ STATIQUE
  // ============================================================

  readonly jobs: JobDetail[] = [
    {
      id: 'j1',
      title: 'Consultant(e) en contrÃ´le de gestion',
      typeLabel: 'CDI',
      location: 'Ouagadougou',
      department: 'Conseil',
      excerpt: 'Accompagnez nos clients PME et institutions dans le pilotage de leur performance financiÃ¨re.',
      description: [
        "Vous intervenez auprÃ¨s de PME et d'organisations pour structurer le contrÃ´le de gestion, les budgets et les indicateurs de pilotage.",
        'Vous travaillez en binÃ´me avec les associÃ©s conseil et les Ã©quipes formation selon les missions.',
      ],
      missions: [
        'Diagnostiquer les dispositifs de pilotage existants',
        'Construire budgets, forecasts et tableaux de bord',
        'Former les Ã©quipes clientes aux outils mis en place',
        'RÃ©diger des livrables clairs et actionnables',
      ],
      profile: [
        'Formation supÃ©rieure en finance / gestion',
        "ExpÃ©rience en contrÃ´le de gestion ou audit (2 ans min.)",
        "MaÃ®trise d'Excel et des outils de reporting",
        'Aisance relationnelle et pÃ©dagogie',
      ],
      tags: ['ContrÃ´le de gestion', 'Tableaux de bord', 'Client'],
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
      imageAlt: 'Consultant contrÃ´le de gestion',
    },
    {
      id: 'j2',
      title: 'Formateur(trice) comptabilitÃ© OHADA',
      typeLabel: 'CDI',
      location: 'Ouagadougou / Hybride',
      department: 'Formation',
      excerpt: 'Animez des parcours certifiants et transmettez une expertise terrain aux apprenants KMAA.',
      description: [
        'Vous concevez et animez des modules de comptabilitÃ© gÃ©nÃ©rale et analytique adaptÃ©s au contexte OHADA.',
      ],
      missions: [
        'Animer des sessions prÃ©sentielles et distancielles',
        'Mettre Ã  jour les supports pÃ©dagogiques',
        "Ã‰valuer les apprenants et les accompagner",
      ],
      profile: [
        'Expertise comptable OHADA solide',
        "ExpÃ©rience de formation ou d'animation",
        'CapacitÃ© Ã  vulgariser des notions techniques',
      ],
      tags: ['PÃ©dagogie', 'OHADA', 'Formation'],
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80',
      imageAlt: 'Formateur comptabilitÃ©',
    },
    // j3 Ã  j6 : le fallback liste ne les dÃ©taillera pas via l'API-down,
    // mais dÃ¨s que l'API tourne, TOUT vient de la DB â€” c'est le chemin nominal.
  ];

  // âœ… UN SEUL `job` : API prioritaire, statique en secours
  readonly job = computed(() =>
    this.apiJob() ??
    this.jobs.find((j) => j.id === this.id()) ??
    null
  );

    // ============================================================
  // CANDIDATURE
  // ============================================================

  readonly showApplyForm = signal(false);
  readonly applying = signal(false);
  readonly applySuccess = signal<string | null>(null);
  readonly applyError = signal<string | null>(null);

  readonly applicantName = signal('');
  readonly applicantEmail = signal('');
  readonly applicantPhone = signal('');
  readonly applicantMessage = signal('');
  applicantCv: File | null = null;

  toggleApplyForm(): void {
    this.showApplyForm.update((v) => !v);
    this.applyError.set(null);
  }

    scrollToApply(): void {
    // âœ… Ouvre le formulaire PUIS dÃ©file vers la carte de candidature
    this.showApplyForm.set(true);
    this.applyError.set(null);
    requestAnimationFrame(() => {
      document.getElementById('apply-card')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.applicantCv = input.files?.[0] ?? null;
  }

  submitApplication(): void {
    const j = this.job();
    if (!j || this.applying()) return;

    const name = this.applicantName().trim();
    const email = this.applicantEmail().trim();

    if (!name || !email.includes('@') || !this.applicantCv) {
      this.applyError.set('Nom, email valides et CV (PDF) sont requis.');
      return;
    }

    this.applying.set(true);
    this.applyError.set(null);

    const fd = new FormData();
    fd.append('full_name', name);
    fd.append('email', email);
    fd.append('phone', this.applicantPhone().trim());
    fd.append('message', this.applicantMessage().trim());
    fd.append('cv', this.applicantCv);

    this.http
      .post<{ message: string }>(
        `${this.apiUrl}/job-offers/${encodeURIComponent(j.id)}/apply`,
        fd
      )
      .subscribe({
        next: (res) => {
          this.applying.set(false);
          this.applySuccess.set(res.message ?? 'Candidature envoyÃ©e !');
        },
        error: (err) => {
          this.applying.set(false);
          this.applyError.set(
            err?.error?.message ?? "Impossible d'envoyer votre candidature."
          );
        },
      });
  }
}