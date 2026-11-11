import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// Les données renvoyées par ton API (EnrollmentController@format)
export interface ApiEnrollment {
  courseId: string;        // Le slug du cours
  progressPercent: number;
  enrolledAt: string;
  lastAccessedAt: string;
  certificateIssued: boolean;
  access_level: number;
}

// On a besoin des infos du cours pour l'affichage.
// Idéalement, l'API devrait renvoyer le titre et l'image avec l'enrollment.
// En attendant, on va les récupérer ou les simuler si absents.
export interface EnrollmentDisplay extends ApiEnrollment {
  title?: string;
  image?: string;
  subject?: string;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://127.0.0.1:8000/api';

  readonly enrollments = signal<EnrollmentDisplay[]>([]);
  readonly isLoading = signal(false);

  constructor() {
    this.reload();
  }

  // Appelle la vraie API
  reload(): void {
    this.isLoading.set(true);
    this.http.get<{ data: ApiEnrollment[] }>(`${this.apiBase}/me/enrollments`)
      .subscribe({
        next: (res) => {
          this.enrollments.set(res.data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement enrollments', err);
          this.enrollments.set([]);
          this.isLoading.set(false);
        }
      });
  }

  isEnrolled(courseSlug: string): boolean {
    return this.enrollments().some(e => e.courseId === courseSlug);
  }

  // Optionnel : si tu veux garder l'ajout local pour la simulation
  add(enrollment: EnrollmentDisplay): void {
    const list = this.enrollments();
    if (!list.some(e => e.courseId === enrollment.courseId)) {
      this.enrollments.set([...list, enrollment]);
    }
  }

  clear(): void {
    this.enrollments.set([]);
  }
}