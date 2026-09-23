import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type JobType = 'tous' | 'cdi' | 'cdd' | 'stage' | 'freelance' | 'partenaire';

interface JobOffer {
  id: string;
  title: string;
  type: Exclude<JobType, 'tous'>;
  typeLabel: string;
  location: string;
  department: string;
  excerpt: string;
  tags: string[];
  featured?: boolean;
  image: string;
  imageAlt: string;
}

@Component({
  selector: 'app-emploi',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './emploi.html',
  styleUrl: './emploi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Emploi {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  readonly activeFilter = signal<JobType>('tous');

  readonly filters: { id: JobType; label: string }[] = [
    { id: 'tous', label: 'Toutes les offres' },
    { id: 'cdi', label: 'CDI' },
    { id: 'cdd', label: 'CDD' },
    { id: 'stage', label: 'Stages' },
    { id: 'freelance', label: 'Freelance' },
    { id: 'partenaire', label: 'Partenaires' },
  ];

  // ✅ Fallback statique → remplacé par l'API
  readonly jobs = signal<JobOffer[]>([
    {
      id: 'j1', title: 'Consultant(e) en contrôle de gestion', type: 'cdi', typeLabel: 'CDI',
      location: 'Ouagadougou', department: 'Conseil',
      excerpt: 'Accompagnez nos clients PME et institutions dans le pilotage de leur performance financière.',
      tags: ['Contrôle de gestion', 'Tableaux de bord', 'Client'],
      featured: true,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80',
      imageAlt: 'Consultant contrôle de gestion',
    },
    {
      id: 'j2', title: 'Formateur(trice) comptabilité OHADA', type: 'cdi', typeLabel: 'CDI',
      location: 'Ouagadougou / Hybride', department: 'Formation',
      excerpt: 'Animez des parcours certifiants et transmettez une expertise terrain aux apprenants KMAA.',
      tags: ['Pédagogie', 'OHADA', 'Formation'],
      featured: true,
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80',
      imageAlt: 'Formateur comptabilité',
    },
    {
      id: 'j3', title: 'Chargé(e) de partenariats entreprises', type: 'partenaire', typeLabel: 'Partenariat',
      location: 'Ouagadougou', department: 'Développement',
      excerpt: "Développez le réseau d'entreprises partenaires pour stages, recrutements et formations sur mesure.",
      tags: ['B2B', 'Réseau', 'Business development'],
      featured: true,
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=80',
      imageAlt: 'Partenariats entreprises',
    },
    {
      id: 'j4', title: 'Auditeur(trice) junior', type: 'cdd', typeLabel: 'CDD',
      location: 'Ouagadougou', department: 'Audit',
      excerpt: "Participez aux missions d'audit interne et de cartographie des risques auprès de nos clients.",
      tags: ['Audit', 'Risques', 'Terrain'],
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&q=80',
      imageAlt: 'Auditeur junior',
    },
    {
      id: 'j5', title: 'Stagiaire pédagogie digitale', type: 'stage', typeLabel: 'Stage',
      location: 'Ouagadougou', department: 'Academy',
      excerpt: "Contribuez à la conception de modules e-learning et au suivi des parcours en ligne.",
      tags: ['E-learning', 'Contenu', 'Innovation'],
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80',
      imageAlt: 'Stage pédagogie digitale',
    },
    {
      id: 'j6', title: 'Expert(e) fiscalité freelance', type: 'freelance', typeLabel: 'Freelance',
      location: 'Remote / Ouaga', department: 'Conseil',
      excerpt: "Interventions ponctuelles sur missions fiscales, conformité et accompagnement d'entreprises.",
      tags: ['Fiscalité', 'Mission', 'Indépendant'],
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80',
      imageAlt: 'Expert fiscalité freelance',
    },
  ]);

  constructor() {
    this.http
      .get<{ data: unknown[] }>(`${this.apiUrl}/job-offers`)
      .subscribe({
        next: (res) => {
          const mapped = (res.data ?? [])
            .map((raw) => this.mapApiJob(raw))
            .filter((j): j is JobOffer => j !== null);

          if (mapped.length > 0) {
            this.jobs.set(mapped);
          }
        },
        error: (err) =>
          console.warn("Offres API indisponible — contenu statique affiché.", err),
      });
  }

  private mapApiJob(raw: any): JobOffer | null {
    if (!raw?.title) return null;

    const validTypes = ['cdi', 'cdd', 'stage', 'freelance', 'partenaire'];
    const type = validTypes.includes(raw.type) ? raw.type : 'cdi';

    return {
      id: String(raw.id),
      title: raw.title,
      type: type as JobOffer['type'],
      typeLabel: raw.typeLabel ?? type.toUpperCase(),
      location: raw.location ?? '',
      department: raw.department ?? '',
      excerpt: raw.excerpt ?? '',
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      featured: Boolean(raw.featured),
      image: raw.image ?? 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=80',
      imageAlt: raw.imageAlt ?? raw.title,
    };
  }

  readonly filteredJobs = computed(() => {
    const f = this.activeFilter();
    if (f === 'tous') return this.jobs();
    return this.jobs().filter((j) => j.type === f);
  });

  readonly featuredJobs = computed(() => this.jobs().filter((j) => j.featured));

  setFilter(id: JobType): void {
    this.activeFilter.set(id);
  }

    // ============================================================
  // CANDIDATURE SPONTANÉE (CV + email uniquement)
  // ============================================================

  readonly spontaneousOpen = signal(false);
  readonly spontaneousSending = signal(false);
  readonly spontaneousSuccess = signal<string | null>(null);
  readonly spontaneousError = signal<string | null>(null);
  readonly spontaneousEmail = signal('');
  spontaneousCv: File | null = null;

  toggleSpontaneous(): void {
    this.spontaneousOpen.update((v) => !v);
    this.spontaneousError.set(null);
  }

  // scrollToSpontaneous(): void {
  //   this.spontaneousOpen.set(true);
  //   requestAnimationFrame(() => {
  //     document.getElementById('spontaneous-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //   });
  // }
    scrollToOffers(): void {
    document.getElementById('offres')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToSpontaneous(): void {
    // ✅ Ouvre le formulaire PUIS défile vers la SECTION CTA
    // (toujours présente dans le DOM, contrairement au formulaire)
    this.spontaneousOpen.set(true);
    requestAnimationFrame(() => {
      document.getElementById('spontaneous')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  onSpontaneousCv(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.spontaneousCv = input.files?.[0] ?? null;
  }

  submitSpontaneous(): void {
    const email = this.spontaneousEmail().trim();
    if (this.spontaneousSending()) return;

    if (!email.includes('@') || !this.spontaneousCv) {
      this.spontaneousError.set('Un email valide et un CV (PDF) sont requis.');
      return;
    }

    this.spontaneousSending.set(true);
    this.spontaneousError.set(null);

    const fd = new FormData();
    fd.append('email', email);
    fd.append('cv', this.spontaneousCv);

    this.http
      .post<{ message: string }>(`${this.apiUrl}/job-applications/spontaneous`, fd)
      .subscribe({
        next: (res) => {
          this.spontaneousSending.set(false);
          this.spontaneousSuccess.set(res.message ?? 'Candidature envoyée !');
        },
        error: (err) => {
          this.spontaneousSending.set(false);
          this.spontaneousError.set(
            err?.error?.message ?? "Impossible d'envoyer votre candidature."
          );
        },
      });
  }
}