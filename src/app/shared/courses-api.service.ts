import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const API_URL = 'http://127.0.0.1:8000/api';

// ============================================================
// TYPES
// ============================================================

export interface ApiCourseModule {
  week: number;
  title: string;
  topics: string[];
}

export interface ApiCourseSummary {
  id: string;
  courseId: number;
   type: 'individual' | 'enterprise';
  subject: string;
  category: string;
  title: string;
  description?: string;
  level: string;
  diploma: string;
  durationFull: string;
  durationAlternance: string;
  // ✅ Alias pour compatibilité avec les anciens templates
  duration: string;
  weeklyHours: string;
  image: string;
  imageAlt: string;
  popular: boolean;
  badge?: string | null;
  isFree: boolean;
  hasCertificate: boolean;
  price: number;
  provider: string;
  language: string;
  startDate?: string | null;
  route: string;
  enterpriseBasePrice?: number; 
  // ✅ Aliases pour les anciens templates
  skills: string[];

    // ✅ nouveaux champs
  deliveryMode?: 'en_ligne' | 'presentiel' | 'mixte' | null;
  hoursPerWeek?: string | null;
  modulesCount?: number;
}

export interface ApiCourseDetail extends ApiCourseSummary {
  slug: string;
  longDescription?: string | null;
  instructor: string;
  instructorRole: string;
  providerLogo?: string | null;
  modules: ApiCourseModule[];
  finalExam?: any | null;
}

// ============================================================
// SERVICE
// ============================================================
@Injectable({ providedIn: 'root' })
export class CoursesApiService {
  constructor(private http: HttpClient) {}

getCourses(filters?: {
  subject?: string;
  level?: string;
  popular?: boolean;
  type?: 'individual' | 'enterprise';   // ✅ AJOUT
}): Observable<ApiCourseSummary[]> {
  let params = new HttpParams();
  if (filters?.subject) params = params.set('subject', filters.subject);
  if (filters?.level) params = params.set('level', filters.level);
  if (filters?.popular) params = params.set('popular', '1');
  if (filters?.type) params = params.set('type', filters.type);   // ✅ AJOUT

    return this.http
      .get<{ data: ApiCourseSummary[] }>(`${API_URL}/courses`, { params })
      .pipe(
        map((res) =>
          res.data.map((c) => this.normalizeSummary(c))
        )
      );
  }

  getCourseDetail(slug: string): Observable<ApiCourseDetail> {
    return this.http
      .get<{ data: ApiCourseDetail }>(`${API_URL}/courses/${slug}`)
      .pipe(
        map((res) => {
          const raw = res.data;
          return {
            ...this.normalizeSummary(raw),
            slug: raw.slug,
            longDescription: raw.longDescription ?? raw.description ?? null,
            instructor: raw.instructor ?? 'Équipe pédagogique KMAA',
            instructorRole: raw.instructorRole ?? 'Formateur & Consultant',
            providerLogo: raw.providerLogo ?? null,
            modules: raw.modules ?? [],
            finalExam: raw.finalExam ?? null,
          };
        })
      );
  }

  /**
   * ✅ Normalise la réponse backend pour qu'elle contienne
   * TOUS les champs attendus par les templates Angular
   */
  private normalizeSummary(raw: any): ApiCourseSummary {
    return {
      id: raw.id ?? raw.slug,
      courseId: raw.courseId ?? 0,
      
      // ✅ On ajoute les champs manquants avec des valeurs par défaut
      type: raw.type ?? 'individual', 
      deliveryMode: raw.deliveryMode ?? null,
      hoursPerWeek: raw.hoursPerWeek ?? null,
      modulesCount: raw.modulesCount ?? 0,

      subject: raw.subject ?? '',
      category: raw.category ?? '',
      title: raw.title ?? '',
      description: raw.description ?? '',
      level: raw.level ?? 'debutant',
      diploma: raw.diploma ?? 'certificate',
      durationFull: raw.durationFull ?? raw.duration_full ?? '',
      durationAlternance: raw.durationAlternance ?? raw.duration_alternance ?? '',
      duration: raw.durationFull ?? raw.duration_full ?? '',
      weeklyHours: raw.durationAlternance ?? raw.duration_alternance ?? '',
      image: raw.image ?? '',
      imageAlt: raw.imageAlt ?? raw.image_alt ?? '',
      popular: raw.popular ?? false,
      badge: raw.badge ?? null,
      isFree: raw.isFree ?? raw.is_free ?? false,
      hasCertificate: raw.hasCertificate ?? raw.has_certificate ?? true,
      price: raw.price ?? 0,
      enterpriseBasePrice: raw.enterpriseBasePrice ?? raw.enterprise_base_price ?? 0,
      provider: raw.provider ?? 'KMAA Academy',
      language: raw.language ?? 'Français',
      startDate: raw.startDate ?? raw.start_date ?? null,
      route: raw.route ?? `/sujets/cours/${raw.slug ?? raw.id}`,
      skills: raw.skills ?? [],
      
    };
  }
}