import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type TeamRole = 'tous' | 'direction' | 'conseil' | 'formation' | 'support';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: Exclude<TeamRole, 'tous'>;
  bio: string;
  image: string;
  imageAlt: string;
  linkedin?: string;
  featured?: boolean;
}

interface TeamStat { value: string; label: string; }
interface CultureValue { number: string; title: string; text: string; }

interface TeamSettings {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroLead: string;
  stats: TeamStat[];
  cultureTitle: string;
  cultureText: string;
  cultureValues: CultureValue[];
  ctaTitle: string;
  ctaText: string;
}

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './equipe.html',
  styleUrl: './equipe.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Equipe {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  //pour les fichiers a uploader.
  private readonly laravelUrl = 'http://127.0.0.1:8000'; 

  readonly activeFilter = signal<TeamRole>('tous');

  readonly filters: { id: TeamRole; label: string }[] = [
    { id: 'tous', label: "Toute l'équipe" },
    { id: 'direction', label: 'Direction' },
    { id: 'conseil', label: 'Conseil' },
    { id: 'formation', label: 'Formation' },
    { id: 'support', label: 'Support' },
  ];

  // ============================================================
  // ✅ Membres : statique par défaut → remplacé par l'API
  // ============================================================

  readonly members = signal<TeamMember[]>([
    {
      id: 'm1', name: 'Aminata Kaboré', role: 'Directrice générale', department: 'direction',
      bio: "15 ans d'expérience en stratégie et transformation des organisations au Burkina Faso et en Afrique de l'Ouest.",
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
      imageAlt: 'Aminata Kaboré', featured: true,
    },
    {
      id: 'm2', name: 'Issouf Ouédraogo', role: 'Directeur pédagogique', department: 'formation',
      bio: "Architecte des parcours certifiants KMAA. Ancien responsable formation en cabinet d'audit.",
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80',
      imageAlt: 'Issouf Ouédraogo', featured: true,
    },
    {
      id: 'm3', name: 'Fatou Zongo', role: 'Associée conseil', department: 'conseil',
      bio: 'Spécialiste en contrôle de gestion et pilotage de la performance pour les PME et institutions.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80',
      imageAlt: 'Fatou Zongo', featured: true,
    },
    {
      id: 'm4', name: 'Boureima Sawadogo', role: 'Expert fiscalité & OHADA', department: 'conseil',
      bio: 'Accompagne les entreprises sur la conformité fiscale, le droit des sociétés et les restructurations.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80',
      imageAlt: 'Boureima Sawadogo',
    },
    {
      id: 'm5', name: 'Aïcha Ouédraogo', role: 'Responsable formations certifiantes', department: 'formation',
      bio: 'Conçoit et anime les parcours métier. Passionnée par la pédagogie active et le terrain.',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&q=80',
      imageAlt: 'Aïcha Ouédraogo',
    },
    {
      id: 'm6', name: 'Moussa Kaboré', role: 'Consultant audit interne', department: 'conseil',
      bio: "Missions d'audit, cartographie des risques et mise en place de dispositifs de contrôle interne.",
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80',
      imageAlt: 'Moussa Kaboré',
    },
    {
      id: 'm7', name: 'Salimata Traoré', role: 'Coordinatrice apprenants', department: 'support',
      bio: 'Point de contact privilégié des apprenants. Suivi, motivation et réussite des parcours.',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80',
      imageAlt: 'Salimata Traoré',
    },
    {
      id: 'm8', name: 'Ibrahim Traoré', role: 'Formateur data & outils digitaux', department: 'formation',
      bio: 'Excel avancé, Power BI, automatisation. Rend les outils accessibles aux non-techniciens.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      imageAlt: 'Ibrahim Traoré',
    },
  ]);

  // ============================================================
  // ✅ Textes de la page : statique par défaut → remplacé par l'API
  // ============================================================

  readonly heroEyebrow = signal('Les talents derrière KMAA');
  readonly heroTitle = signal("Une équipe d'experts,");
  readonly heroTitleAccent = signal('une vision partagée');
  readonly heroLead = signal(
    "Conseillers, formateurs et stratèges unis pour faire progresser les organisations et les parcours professionnels en Afrique de l'Ouest."
  );
  readonly stats = signal<TeamStat[]>([
    { value: '12+', label: 'experts terrain' },
    { value: '3', label: "années d'expérience moyenne" },
    { value: '100 %', label: 'orientés résultats' },
  ]);

  readonly cultureTitle = signal('Ce qui nous unit au-delà des métiers');
  readonly cultureText = signal(
    "Rigueur, proximité terrain et transmission. Chaque membre de l'équipe partage la même ambition : rendre l'expertise accessible, concrète et utile."
  );
  readonly cultureValues = signal<CultureValue[]>([
    { number: '01', title: 'Excellence terrain', text: 'Des méthodes éprouvées, adaptées aux réalités locales.' },
    { number: '02', title: 'Transmission', text: 'Former pour autonomiser, pas seulement pour délivrer.' },
    { number: '03', title: 'Impact mesurable', text: 'Chaque mission vise des résultats concrets et durables.' },
  ]);

  readonly ctaTitle = signal("Envie de construire l'avenir avec nous ?");
  readonly ctaText = signal(
    "Nous accueillons régulièrement des talents en conseil, formation et support. Parlez-nous de votre parcours."
  );

  // ============================================================
  // CHARGEMENT DEPUIS L'API
  // ============================================================

  constructor() {
    this.http
      .get<{ data: { members: unknown[]; settings: any } }>(`${this.apiUrl}/team`)
      .subscribe({
        next: (res) => {
          const members = (res.data?.members ?? [])
            .map((raw) => this.mapApiMember(raw))
            .filter((m): m is TeamMember => m !== null);

          if (members.length > 0) {
            this.members.set(members);
          }

          const s = res.data?.settings;
          if (s) this.applySettings(s);
        },
        error: (err) =>
          console.warn('Équipe API indisponible — contenu statique affiché.', err),
      });
  }



    private toMediaUrl(url: string | null | undefined): string {
    const fallback = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80';

    if (!url) return fallback;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;

    // /storage/... → URL absolue vers LARAVEL (SANS le /api des endpoints JSON)
    return `${this.laravelUrl}${url}`;
  }
  

  private mapApiMember(raw: any): TeamMember | null {
  

  // private mapApiMember(raw: any): TeamMember | null {
    if (!raw?.name) return null;

    const validDepartments = ['direction', 'conseil', 'formation', 'support'];
    const department = validDepartments.includes(raw.department) ? raw.department : 'conseil';

    return {
      id: String(raw.id),
      name: raw.name,
      role: raw.role ?? '',
      department: department as TeamMember['department'],
      bio: raw.bio ?? '',
      // image: raw.image ?? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80',
      // imageAlt: raw.imageAlt ?? raw.name,
      image: this.toMediaUrl(raw.image),
      imageAlt: raw.imageAlt ?? raw.name,
      linkedin: raw.linkedin ?? undefined,
      featured: Boolean(raw.featured),
    };
  }

  private applySettings(s: any): void {
    if (s.heroEyebrow) this.heroEyebrow.set(s.heroEyebrow);
    if (s.heroTitle) this.heroTitle.set(s.heroTitle);
    if (s.heroTitleAccent) this.heroTitleAccent.set(s.heroTitleAccent);
    if (s.heroLead) this.heroLead.set(s.heroLead);
    if (Array.isArray(s.stats) && s.stats.length) this.stats.set(s.stats);
    if (s.cultureTitle) this.cultureTitle.set(s.cultureTitle);
    if (s.cultureText) this.cultureText.set(s.cultureText);
    if (Array.isArray(s.cultureValues) && s.cultureValues.length) this.cultureValues.set(s.cultureValues);
    if (s.ctaTitle) this.ctaTitle.set(s.ctaTitle);
    if (s.ctaText) this.ctaText.set(s.ctaText);
  }

  // ============================================================
  // DÉRIVÉS & ACTIONS
  // ============================================================

  readonly filteredMembers = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'tous') return this.members();
    return this.members().filter((m) => m.department === filter);
  });

  readonly featuredMembers = computed(() =>
    this.members().filter((m) => m.featured)
  );

  setFilter(id: TeamRole): void {
    this.activeFilter.set(id);
  }
}