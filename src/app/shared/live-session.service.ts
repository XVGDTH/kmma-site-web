// import { HttpClient } from '@angular/common/http';
// import { Injectable, inject, signal } from '@angular/core';

// export interface LiveSessionState {
//   courseId: string;
//   isLive: boolean;
//   roomName: string;
//   startedAt?: Date;
// }

// const API_URL = 'https://api.convergesas.com/api';

// @Injectable({ providedIn: 'root' })
// export class LiveSessionService {

//   private readonly http = inject(HttpClient);

//   /**
//    * Ã‰tat live par cours.
//    *
//    * âœ… DÃ©sormais SYNCHRONISÃ‰ avec le backend Laravel :
//    * - le formateur dÃ©marre â†’ optimiste en local + POST /live/start (DB)
//    * - l'apprenant lit l'Ã©tat â†’ GET /live-sessions/{courseId} (polling)
//    *
//    * Ã‰volution future possible : WebSocket (Laravel Reverb / Pusher)
//    * pour un temps rÃ©el instantanÃ© au lieu du polling 15 s.
//    */
//   private readonly sessions = signal<Record<string, LiveSessionState>>({});

//   // ============================================================
//   // LECTURE (synchrone â€” compatible avec tous tes templates)
//   // ============================================================

//   getSession(courseId: string): LiveSessionState {
//     return (
//       this.sessions()[courseId] ?? {
//         courseId,
//         isLive: false,
//         roomName: this.buildRoomName(courseId),
//       }
//     );
//   }
// // methode pour acceder au live session en fonction des prix payÃ©s par l'user.
//     getJoinRoom(
//     courseId: string,
//     onSuccess: (roomName: string) => void,
//     onError: (message: string) => void,
//   ): void {
//     this.http
//       .get<{ data: { roomName: string } }>(
//         `${API_URL}/live-sessions/${encodeURIComponent(courseId)}/join`
//       )
//       .subscribe({
//         next: (res) => onSuccess(res.data.roomName),
//         error: (err) => onError(err?.error?.message ?? 'AccÃ¨s refusÃ©.'),
//       });
//   }

//   // ============================================================
//   // FORMATEUR : DÃ‰MARRER
//   // ============================================================

//   startSession(courseId: string): void {
//     // 1. Mise Ã  jour optimiste (l'interface rÃ©agit instantanÃ©ment)
//     this.sessions.update((current) => ({
//       ...current,
//       [courseId]: {
//         courseId,
//         isLive: true,
//         roomName: this.buildRoomName(courseId),
//         startedAt: new Date(),
//       },
//     }));

//     // 2. Enregistrement cÃ´tÃ© Laravel (visible par les apprenants)
//     this.http
//       .post<{ data: { room_name: string } }>(
//         `${API_URL}/formateur/courses/${encodeURIComponent(courseId)}/live/start`,
//         {}
//       )
//       .subscribe({
//         next: (res) => {
//           // On aligne le roomName sur celui gÃ©nÃ©rÃ© par le backend
//           // (source de vÃ©ritÃ© partagÃ©e formateur / apprenants)
//           this.sessions.update((current) => ({
//             ...current,
//             [courseId]: {
//               ...(current[courseId] ?? {
//                 courseId,
//                 isLive: false,
//                 roomName: this.buildRoomName(courseId),
//               }),
//               isLive: true,
//               roomName: res.data?.room_name ?? current[courseId]?.roomName ?? this.buildRoomName(courseId),
//             },
//           }));
//         },
//         // Si l'API Ã©choue, l'Ã©tat local optimiste reste actif
//         error: (err) =>
//           console.error('âš ï¸ Impossible d\'enregistrer la sÃ©ance live :', err),
//       });
//   }

//   // ============================================================
//   // FORMATEUR : TERMINER
//   // ============================================================

//   endSession(courseId: string): void {
//     // 1. Optimiste
//     this.sessions.update((current) => ({
//       ...current,
//       [courseId]: { ...this.getSession(courseId), isLive: false },
//     }));

//     // 2. Backend
//     this.http
//       .post(
//         `${API_URL}/formateur/courses/${encodeURIComponent(courseId)}/live/stop`,
//         {}
//       )
//       .subscribe({
//         error: (err) =>
//           console.error('âš ï¸ Impossible de terminer la sÃ©ance live :', err),
//       });
//   }

//   // ============================================================
//   // APPRENANT : RAFRAÃŽCHIR DEPUIS LE SERVEUR (POLLING)
//   // ============================================================

//   /**
//    * AppelÃ© par le composant apprenant (CoursePlayer) :
//    * - une fois au chargement de la page ;
//    * - puis toutes les 15 secondes via setInterval.
//    */
//   refreshFromServer(courseId: string): void {
//     if (!courseId) return;

//     this.http
//       .get<{
//         data: {
//           isLive: boolean;
//           roomName: string | null;
//           startedAt: string | null;
//         };
//       }>(`${API_URL}/live-sessions/${encodeURIComponent(courseId)}`)
//       .subscribe({
//         next: (res) => {
//           this.sessions.update((current) => ({
//             ...current,
//             [courseId]: {
//               courseId,
//               isLive: !!res.data?.isLive,
//               roomName:
//                 res.data?.roomName ?? this.buildRoomName(courseId),
//               startedAt: res.data?.startedAt
//                 ? new Date(res.data.startedAt)
//                 : undefined,
//             },
//           }));
//         },
//         // Pas de session en DB (404) ou erreur rÃ©seau : reste Ã  isLive=false
//         error: () => {},
//       });
//   }

//   // ============================================================
//   // NOM DU SALON JITSI
//   // ============================================================

//   private buildRoomName(courseId: string): string {
//     // Nom peu devinable pour Ã©viter qu'un inconnu tombe dessus au hasard
//     return `KMAA-${courseId}-formation-2026`;
//   }
// }


import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export interface LiveSessionState {
  courseId: string;
  isLive: boolean;
  joinUrl?: string;       // â¬…ï¸ Apprenant
  hostUrl?: string;       // â¬…ï¸ Formateur (start_url)
  password?: string;
  startedAt?: Date;
}

const API_URL = 'https://api.convergesas.com/api';

@Injectable({ providedIn: 'root' })
export class LiveSessionService {

  private readonly http = inject(HttpClient);

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
    this.http
      .get<{ data: { joinUrl: string; password: string } }>(
        `${API_URL}/live-sessions/${encodeURIComponent(courseId)}/join`
      )
      .subscribe({
        next: (res) => onSuccess(res.data.joinUrl, res.data.password),
        error: (err) => onError(err?.error?.message ?? 'AccÃ¨s refusÃ©.'),
      });
  }

  // ============================================================
  // FORMATEUR : RÃ©cupÃ©rer son start_url (hÃ´te)
  // ============================================================

  getHostUrl(
    courseId: string,
    onSuccess: (hostUrl: string) => void,
    onError: (message: string) => void,
  ): void {
    this.http
      .get<{ data: { startUrl: string } }>(
        `${API_URL}/formateur/courses/${encodeURIComponent(courseId)}/live/host-url`
      )
      .subscribe({
        next: (res) => onSuccess(res.data.startUrl),
        error: (err) => onError(err?.error?.message ?? 'Impossible de rÃ©cupÃ©rer le lien hÃ´te.'),
      });
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
    this.http
      .post<{ data: { hostUrl: string; isLive: boolean } }>(
        `${API_URL}/formateur/courses/${encodeURIComponent(courseId)}/live/start`,
        {}
      )
      .subscribe({
        next: (res) => {
          this.sessions.update((current) => ({
            ...current,
            [courseId]: {
              ...(current[courseId] ?? { courseId, isLive: false }),
              isLive: true,
              hostUrl: res.data.hostUrl,
            },
          }));

          onSuccess?.(res.data.hostUrl);
        },
        error: (err) => {
          console.error('âŒ Erreur dÃ©marrage Zoom :', err);

          // Rollback optimiste
          this.sessions.update((current) => ({
            ...current,
            [courseId]: {
              ...(current[courseId] ?? { courseId, isLive: false }),
              isLive: false,
            },
          }));

          onError?.(err?.error?.message ?? 'Impossible de dÃ©marrer la session Zoom.');
        },
      });
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
    this.http
      .post(
        `${API_URL}/formateur/courses/${encodeURIComponent(courseId)}/live/stop`,
        {}
      )
      .subscribe({
        error: (err) =>
          console.error('âš ï¸ Impossible de terminer la sÃ©ance Zoom :', err),
      });
  }

  // ============================================================
  // APPRENANT : RafraÃ®chir (polling)
  // ============================================================

  refreshFromServer(courseId: string): void {
    if (!courseId) return;

    this.http
      .get<{
        data: {
          isLive: boolean;
          startedAt: string | null;
        };
      }>(`${API_URL}/live-sessions/${encodeURIComponent(courseId)}`)
      .subscribe({
        next: (res) => {
          this.sessions.update((current) => ({
            ...current,
            [courseId]: {
              ...(current[courseId] ?? { courseId, isLive: false }),
              isLive: !!res.data?.isLive,
              startedAt: res.data?.startedAt
                ? new Date(res.data.startedAt)
                : undefined,
            },
          }));
        },
        error: () => {},
      });
  }
}