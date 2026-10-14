// import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export interface LiveSessionState {
  courseId: string;
  isLive: boolean;
  joinUrl?: string;       // â¬…ï¸ Apprenant
  hostUrl?: string;       // â¬…ï¸ Formateur (start_url)
  password?: string;
  startedAt?: Date;
}

// const API_URL = 'http://127.0.0.1:8000/api';

@Injectable({ providedIn: 'root' })
export class LiveSessionService {

  // private readonly http = inject(HttpClient);

  private readonly sessions = signal<Record<string, LiveSessionState>>({});

  // ============================================================
  // LECTURE
  // ============================================================

  getSession(courseId: string): LiveSessionState {
    return (
      this.sessions()[courseId] ?? {
        courseId,
        isLive: false,
      }
    );
  }

  // ============================================================
  // APPRENANT : Rejoindre (renvoie join_url)
  // ============================================================

  getJoinUrl(
    courseId: string,
    onSuccess: (joinUrl: string, password: string) => void,
    onError: (message: string) => void,
  ): void {
    // this.http
    //   .get<{ data: { joinUrl: string; password: string } }>(
    //     `${API_URL}/live-sessions/${encodeURIComponent(courseId)}/join`
    //   )
    //   .subscribe({
    //     next: (res) => onSuccess(res.data.joinUrl, res.data.password),
    //     error: (err) => onError(err?.error?.message ?? 'AccÃ¨s refusÃ©.'),
    //   });
  }

  // ============================================================
  // FORMATEUR : RÃ©cupÃ©rer son start_url (hÃ´te)
  // ============================================================

  getHostUrl(
    courseId: string,
    onSuccess: (hostUrl: string) => void,
    onError: (message: string) => void,
  ): void {
    // this.http
    //   .get<{ data: { startUrl: string } }>(
    //     `${API_URL}/formateur/courses/${encodeURIComponent(courseId)}/live/host-url`
    //   )
    //   .subscribe({
    //     next: (res) => onSuccess(res.data.startUrl),
    //     error: (err) => onError(err?.error?.message ?? 'Impossible de rÃ©cupÃ©rer le lien hÃ´te.'),
    //   });
  }

  // ============================================================
  // FORMATEUR : DÃ©marrer
  // ============================================================

  startSession(
    courseId: string,
    onSuccess?: (hostUrl: string) => void,
    onError?: (message: string) => void,
  ): void {
    // 1. Optimiste
    this.sessions.update((current) => ({
      ...current,
      [courseId]: {
        ...(current[courseId] ?? { courseId, isLive: false }),
        isLive: true,
        startedAt: new Date(),
      },
    }));

    // 2. Backend
    // this.http
    //   .post<{ data: { hostUrl: string; isLive: boolean } }>(
    //     `${API_URL}/formateur/courses/${encodeURIComponent(courseId)}/live/start`,
    //     {}
    //   )
    //   .subscribe({
    //     next: (res) => {
    //       this.sessions.update((current) => ({
    //         ...current,
    //         [courseId]: {
    //           ...(current[courseId] ?? { courseId, isLive: false }),
    //           isLive: true,
    //           hostUrl: res.data.hostUrl,
    //         },
    //       }));

    //       onSuccess?.(res.data.hostUrl);
    //     },
    //     error: (err) => {
    //       console.error('âŒ Erreur dÃ©marrage Zoom :', err);

    //       // Rollback optimiste
    //       this.sessions.update((current) => ({
    //         ...current,
    //         [courseId]: {
    //           ...(current[courseId] ?? { courseId, isLive: false }),
    //           isLive: false,
    //         },
    //       }));

    //       onError?.(err?.error?.message ?? 'Impossible de dÃ©marrer la session Zoom.');
    //     },
    //   });
  }

  // ============================================================
  // FORMATEUR : Terminer
  // ============================================================

  endSession(courseId: string): void {
    // 1. Optimiste
    this.sessions.update((current) => ({
      ...current,
      [courseId]: { ...this.getSession(courseId), isLive: false },
    }));

    // 2. Backend
    //  this.http
    //   .post(
    //     `${API_URL}/formateur/courses/${encodeURIComponent(courseId)}/live/stop`,
    //     {}
    //   )
    //   .subscribe({
    //     error: (err) =>
    //       console.error('âš ï¸ Impossible de terminer la sÃ©ance Zoom :', err),
    //   });
  }

  // ============================================================
  // APPRENANT : RafraÃ®chir (polling)
  // ============================================================

  refreshFromServer(courseId: string): void {
    if (!courseId) return;

    // this.http
    //   .get<{
    //     data: {
    //       isLive: boolean;
    //       startedAt: string | null;
    //     };
    //   }>(`${API_URL}/live-sessions/${encodeURIComponent(courseId)}`)
    //   .subscribe({
    //     next: (res) => {
    //       this.sessions.update((current) => ({
    //         ...current,
    //         [courseId]: {
    //           ...(current[courseId] ?? { courseId, isLive: false }),
    //           isLive: !!res.data?.isLive,
    //           startedAt: res.data?.startedAt
    //             ? new Date(res.data.startedAt)
    //             : undefined,
    //         },
    //       }));
    //     },
    //     error: () => {},
    //   });
  }
}