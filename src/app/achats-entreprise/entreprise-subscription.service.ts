import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

// ============================================================
// TYPES (alignés sur le backend)
// ============================================================
export interface TeamMember {
  id: string;
  email: string;
  name?: string | null;
  status: 'invite' | 'active' | 'revoked';
  invitedAt?: string;
  joinedAt?: string | null;
}

export interface EnterpriseLicense {
  id: string;                       // uuid
  courseId: number;
  courseSlug?: string;
  courseTitle?: string;
  courseImage?: string;
  planId: string;
  planName?: string;
  seatsTotal: number;
  seatsUsed: number;
  seatsRemaining: number;
  pricePerSeat: number;
  totalPaid: number;
  discountApplied: number;
  promoCode?: string | null;
  status: 'active' | 'expired' | 'cancelled';
  purchasedAt?: string;
  expiresAt?: string;
  companyName: string;
  companyEmail: string;
  members: TeamMember[];
}

export interface EnterprisePlan {
  id: string;
  slug: string;
  name: string;
  pricePerSeat: number;
  minSeats: number;
  maxSeats: number;
  badge?: string | null;
  description?: string | null;
  features: string[];
  featured: boolean;
}

export interface CreateLicensePayload {
  course_id: number;
  plan_id: string | number;
  seats_total: number;
  company_name: string;
  company_email: string;
  company_phone?: string;
  company_address?: string;
  company_tax_id?: string;
  promo_code?: string;
  payment_method: 'virement' | 'orange' | 'moov' | 'telecel' | 'card';
  members?: { email: string; name?: string }[];
}

export interface CreateLicenseResponse {
  data: EnterpriseLicense;
  order: {
    uuid: string;
    reference: string;
    invoiceNumber: string;
    subtotal: number;
    discount: number;
    tva: number;
    total: number;
    currency: string;
    status: string;
    paidAt?: string;
    transactionId: string;
  };
}

// ============================================================
// SERVICE
// ============================================================
@Injectable({ providedIn: 'root' })
export class EntrepriseSubscriptionService {

  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://127.0.0.1:8000/api';

  // ---- État global (signals) ----
  readonly licenses = signal<EnterpriseLicense[]>([]);
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);

  // ---- Computed ----
  readonly activeLicenses = computed(() =>
    this.licenses().filter(l => l.status === 'active')
  );

  readonly totalSeats = computed(() =>
    this.activeLicenses().reduce((s, l) => s + l.seatsTotal, 0)
  );

  readonly totalSeatsUsed = computed(() =>
    this.activeLicenses().reduce((s, l) => s + l.seatsUsed, 0)
  );

  // ============================================================
  // PLANS (public)
  // ============================================================
  getPlans(): Observable<{ data: EnterprisePlan[] }> {
    return this.http.get<{ data: EnterprisePlan[] }>(`${this.apiBase}/enterprise/plans`);
  }
    // ✅ NOUVELLE MÉTHODE : Télécharger la facture d'une licence
  downloadLicenseInvoice(licenseId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiBase}/enterprise-licenses/${licenseId}/invoice`, 
      { responseType: 'blob' }
    );
  }


  // ============================================================
  // LICENCES
  // ============================================================
  reload(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<{ data: EnterpriseLicense[] }>(`${this.apiBase}/me/enterprise-licenses`)
      .subscribe({
        next: (res) => {
          this.licenses.set(res.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Erreur chargement licences.');
          this.loading.set(false);
        },
      });
  }

  getLicense(uuid: string): Observable<{ data: EnterpriseLicense }> {
    return this.http.get<{ data: EnterpriseLicense }>(
      `${this.apiBase}/enterprise-licenses/${uuid}`
    );
  }

  createLicense(payload: CreateLicensePayload): Observable<CreateLicenseResponse> {
    return this.http.post<CreateLicenseResponse>(
      `${this.apiBase}/enterprise-licenses`,
      payload
    ).pipe(
      tap((res) => {
        // Ajoute immédiatement la nouvelle licence à l'état local
        this.licenses.update(list => [res.data, ...list]);
      }),
      catchError((err) => throwError(() => err))
    );
  }

  // ============================================================
  // MEMBRES
  // ============================================================
  getMembers(uuid: string): Observable<{
    data: TeamMember[];
    meta: { seatsTotal: number; seatsUsed: number; seatsRemaining: number };
  }> {
    return this.http.get<any>(`${this.apiBase}/enterprise-licenses/${uuid}/members`);
  }

  inviteMember(uuid: string, email: string, name?: string): Observable<{ data: TeamMember; message: string }> {
    return this.http.post<{ data: TeamMember; message: string }>(
      `${this.apiBase}/enterprise-licenses/${uuid}/members`,
      { email, name }
    ).pipe(
      tap(() => this.reload())
    );
  }

  removeMember(uuid: string, memberId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiBase}/enterprise-licenses/${uuid}/members/${memberId}`
    ).pipe(
      tap(() => this.reload())
    );
  }

  resendInvitation(uuid: string, memberId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiBase}/enterprise-licenses/${uuid}/members/${memberId}/resend`,
      {}
    );
  }

  // ============================================================
  // ACCESS
  // ============================================================
  checkAccess(courseId: number): Observable<{
    hasAccess: boolean;
    role?: 'owner' | 'member';
    licenseId?: string;
    expiresAt?: string;
  }> {
    const params = new HttpParams().set('course_id', courseId.toString());
    return this.http.get<any>(`${this.apiBase}/enterprise-licenses/access/check`, { params });
  }
}