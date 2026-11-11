import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

const API_URL = 'http://127.0.0.1:8000/api';

export interface LiveSessionState {
  courseId: string;
  isLive: boolean;
  joinUrl?: string;
  hostUrl?: string;
  password?: string;
  startedAt?: Date;
   scheduledAt?: Date; 
}

@Injectable({ providedIn: 'root' })
export class LiveSessionService {
  private readonly http = inject(HttpClient);
  private readonly sessions = signal<Record<string, LiveSessionState>>({});

  // ============================================================
  // LECTURE
  // ============================================================
  getSession(courseId: string): LiveSessionState {
    return this.sessions()[courseId] ?? { courseId, isLive: false };
  }

  // ============================================================
  // FORMATEUR : Démarrer une session Zoom
  // ============================================================
  startSession(
    courseId: string,
    onSuccess?: (hostUrl: string) => void,
    onError?: (message: string) => void,
  ): void {
    this.http.post<{ data: { hostUrl: string; isLive: boolean } }>(
      `${API_URL}/formateur/courses/${courseId}/live/start`, 
      {}
    ).subscribe({
      next: (res) => {
        // Mise à jour locale
        this.sessions.update((current) => ({
          ...current,
          [courseId]: {
            ...(current[courseId] ?? { courseId }),
            isLive: true,
            hostUrl: res.data.hostUrl,
            startedAt: new Date(),
          },
        }));
        onSuccess?.(res.data.hostUrl);
      },
      error: (err) => {
        onError?.(err?.error?.message ?? 'Erreur lors du démarrage de la session.');
      },
    });
  }

  // ============================================================
  // FORMATEUR : Terminer la session
  // ============================================================
  endSession(courseId: string): void {
    this.http.post(`${API_URL}/formateur/courses/${courseId}/live/stop`, {}).subscribe({
      next: () => {
        this.sessions.update((current) => ({
          ...current,
          [courseId]: { ...this.getSession(courseId), isLive: false },
        }));
      },
    });
  }

  // ============================================================
  // APPRENANT : Récupérer le join_url (avec vérification d'accès)
  // ============================================================
  getJoinUrl(
    courseId: string,
    onSuccess: (joinUrl: string, password: string) => void,
    onError: (message: string) => void,
  ): void {
    this.http.get<{ data: { joinUrl: string; password: string } }>(
      `${API_URL}/live-sessions/${courseId}/join`
    ).subscribe({
      next: (res) => {
        this.sessions.update((current) => ({
          ...current,
          [courseId]: { ...this.getSession(courseId), joinUrl: res.data.joinUrl },
        }));
        onSuccess(res.data.joinUrl, res.data.password);
      },
      error: (err) => {
        onError(err?.error?.message ?? 'Accès refusé.');
      },
    });
  }

  // ============================================================
  // FORMATEUR : Récupérer son start_url (si la page est rechargée)
  // ============================================================
  getHostUrl(
    courseId: string,
    onSuccess: (hostUrl: string) => void,
    onError: (message: string) => void,
  ): void {
    this.http.get<{ data: { startUrl: string } }>(
      `${API_URL}/formateur/courses/${courseId}/live/host-url`
    ).subscribe({
      next: (res) => onSuccess(res.data.startUrl),
      error: (err) => onError(err?.error?.message ?? 'Session introuvable.'),
    });
  }

  // ============================================================
  // ✅ NOUVEAU : Polling pour les apprenants
  // Vérifie toutes les X secondes si la session est live.
  // ============================================================
  refreshFromServer(courseId: string): void {
    this.http.get<{ data: { isLive: boolean; startedAt?: string } }>(
      `${API_URL}/live-sessions/${courseId}`
    ).subscribe({
      next: (res) => {
        const current = this.getSession(courseId);
        
        // Si l'état a changé, on met à jour
        if (current.isLive !== res.data.isLive) {
          this.sessions.update((sessions) => ({
            ...sessions,
            [courseId]: {
              ...current,
              isLive: res.data.isLive,
              startedAt: res.data.startedAt ? new Date(res.data.startedAt) : undefined,
            },
          }));
        }
      },
      error: () => { /* On ignore les erreurs silencieusement */ },
    });
  }


    // ============================================================
  // FORMATEUR : Programmer une session Zoom (sans la démarrer)
  // ============================================================
  scheduleSession(courseId: string, scheduledAt: string): Observable<any> {
    return this.http.post(
      `${API_URL}/formateur/courses/${courseId}/live/schedule`, 
      { scheduled_at: scheduledAt }
    );
  }


  getSchedules(courseId: string): Observable<any[]> {
  return this.http.get<{ data: any[] }>(`${API_URL}/live-sessions/${courseId}/schedules`)
    .pipe(map(res => res.data));
}
}