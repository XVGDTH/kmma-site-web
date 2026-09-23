// import { HttpClient } from '@angular/common/http';
// import { Injectable, inject, signal } from '@angular/core';

// export interface LiveSessionState {
//   courseId: string;
//   isLive: boolean;
//   roomName: string;
//   startedAt?: Date;
// }

// const API_URL = 'http://127.0.0.1:8000/api';

// @Injectable({ providedIn: 'root' })
// export class LiveSessionService {

//   private readonly http = inject(HttpClient);

//   /**
//    * État live par cours.
//    *
//    * ✅ Désormais SYNCHRONISÉ avec le backend Laravel :
//    * - le formateur démarre → optimiste en local + POST /live/start (DB)
//    * - l'apprenant lit l'état → GET /live-sessions/{courseId} (polling)
//    *
//    * Évolution future possible : WebSocket (Laravel Reverb / Pusher)
//    * pour un temps réel instantané au lieu du polling 15 s.
//    */
//   private readonly sessions = signal<Record<string, LiveSessionState>>({});

//   // ============================================================
//   // LECTURE (synchrone — compatible avec tous tes templates)
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
// // methode pour acceder au live session en fonction des prix payés par l'user.
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
//         error: (err) => onError(err?.error?.message ?? 'Accès refusé.'),
//       });
//   }

//   // ============================================================
//   // FORMATEUR : DÉMARRER
//   // ============================================================

//   startSession(courseId: string): void {
//     // 1. Mise à jour optimiste (l'interface réagit instantanément)
//     this.sessions.update((current) => ({
//       ...current,
//       [courseId]: {
//         courseId,
//         isLive: true,
//         roomName: this.buildRoomName(courseId),
//         startedAt: new Date(),
//       },
//     }));

//     // 2. Enregistrement côté Laravel (visible par les apprenants)
//     this.http
//       .post<{ data: { room_name: string } }>(
//         `${API_URL}/formateur/courses/${encodeURIComponent(courseId)}/live/start`,
//         {}
//       )
//       .subscribe({
//         next: (res) => {
//           // On aligne le roomName sur celui généré par le backend
//           // (source de vérité partagée formateur / apprenants)
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
//         // Si l'API échoue, l'état local optimiste reste actif
//         error: (err) =>
//           console.error('⚠️ Impossible d\'enregistrer la séance live :', err),
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
//           console.error('⚠️ Impossible de terminer la séance live :', err),
//       });
//   }

//   // ============================================================
//   // APPRENANT : RAFRAÎCHIR DEPUIS LE SERVEUR (POLLING)
//   // ============================================================

//   /**
//    * Appelé par le composant apprenant (CoursePlayer) :
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
//         // Pas de session en DB (404) ou erreur réseau : reste à isLive=false
//         error: () => {},
//       });
//   }

//   // ============================================================
//   // NOM DU SALON JITSI
//   // ============================================================

//   private buildRoomName(courseId: string): string {
//     // Nom peu devinable pour éviter qu'un inconnu tombe dessus au hasard
//     return `KMAA-${courseId}-formation-2026`;
//   }
// }


import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export interface LiveSessionState {
  courseId: string;
  isLive: boolean;
  joinUrl?: string;       // ⬅️ Apprenant
  hostUrl?: string;       // ⬅️ Formateur (start_url)
  password?: string;
  startedAt?: Date;
}

const API_URL = 'http://127.0.0.1:8000/api';

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
        error: (err) => onError(err?.error?.message ?? 'Accès refusé.'),
      });
  }

  // ============================================================
  // FORMATEUR : Récupérer son start_url (hôte)
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
        error: (err) => onError(err?.error?.message ?? 'Impossible de récupérer le lien hôte.'),
      });
  }

  // ============================================================
  // FORMATEUR : Démarrer
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
          console.error('❌ Erreur démarrage Zoom :', err);

          // Rollback optimiste
          this.sessions.update((current) => ({
            ...current,
            [courseId]: {
              ...(current[courseId] ?? { courseId, isLive: false }),
              isLive: false,
            },
          }));

          onError?.(err?.error?.message ?? 'Impossible de démarrer la session Zoom.');
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
          console.error('⚠️ Impossible de terminer la séance Zoom :', err),
      });
  }

  // ============================================================
  // APPRENANT : Rafraîchir (polling)
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