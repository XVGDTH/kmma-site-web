import { Injectable, signal, computed } from '@angular/core';

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  status: 'invite' | 'actif';
  joinedAt?: string;
}

export interface EnterpriseLicense {
  id: string;
  courseId: number;
  courseTitle: string;
  courseImage: string;
  planId: string;
  planName: string;
  seatsTotal: number;
  seatsUsed: number;
  seatsRemaining: number;
  pricePerSeat: number;
  totalPaid: number;
  discountApplied: number;
  promoCode?: string;
  purchasedAt: string;
  expiresAt: string;
  status: 'active' | 'expired';
  members: TeamMember[];
  ownerEmail: string;
  ownerName: string;
}

@Injectable({ providedIn: 'root' })
export class EntrepriseSubscriptionService {

  readonly licenses = signal<EnterpriseLicense[]>([]);

  readonly activeLicenses = computed(() =>
    this.licenses().filter((l) => l.status === 'active')
  );

  readonly totalSeats = computed(() =>
    this.activeLicenses().reduce((sum, l) => sum + l.seatsTotal, 0)
  );

  readonly totalSeatsUsed = computed(() =>
    this.activeLicenses().reduce((sum, l) => sum + l.seatsUsed, 0)
  );

  constructor() {
    this.reload();
  }

  reload(): void {
    try {
      const raw = localStorage.getItem('kmaa_enterprise_licenses');
      const list = raw ? JSON.parse(raw) : [];
      this.licenses.set(list);
    } catch {
      this.licenses.set([]);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(
        'kmaa_enterprise_licenses',
        JSON.stringify(this.licenses())
      );
    } catch { /* ignore */ }
  }

  addLicense(license: EnterpriseLicense): void {
    const list = [...this.licenses(), license];
    this.licenses.set(list);
    this.persist();
  }

  updateLicense(id: string, patch: Partial<EnterpriseLicense>): void {
    const list = this.licenses().map((l) =>
      l.id === id ? { ...l, ...patch } : l
    );
    this.licenses.set(list);
    this.persist();
  }

  inviteMember(
    licenseId: string,
    email: string,
    name?: string
  ): { success: boolean; message: string } {
    const license = this.licenses().find((l) => l.id === licenseId);
    if (!license) {
      return { success: false, message: 'Licence introuvable.' };
    }
    if (license.seatsUsed >= license.seatsTotal) {
      return { success: false, message: 'Plus de place disponible.' };
    }
    if (license.members.some((m) => m.email === email)) {
      return { success: false, message: 'Cet email est déjà invité.' };
    }

    const member: TeamMember = {
      id: 'm_' + Date.now().toString(36),
      email,
      name,
      status: 'invite',
      joinedAt: new Date().toISOString(),
    };

    this.updateLicense(licenseId, {
      members: [...license.members, member],
      seatsUsed: license.seatsUsed + 1,
      seatsRemaining: license.seatsRemaining - 1,
    });

    return { success: true, message: `Invitation envoyée à ${email}` };
  }

  removeMember(licenseId: string, memberId: string): void {
    const license = this.licenses().find((l) => l.id === licenseId);
    if (!license) return;

    const newMembers = license.members.filter((m) => m.id !== memberId);
    this.updateLicense(licenseId, {
      members: newMembers,
      seatsUsed: newMembers.length,
      seatsRemaining: license.seatsTotal - newMembers.length,
    });
  }

  hasAccessForEmail(courseId: number, email: string): boolean {
    const lowerEmail = email.trim().toLowerCase();
    return this.activeLicenses().some(
      (l) =>
        l.courseId === courseId &&
        (l.ownerEmail.toLowerCase() === lowerEmail ||
          l.members.some((m) => m.email.toLowerCase() === lowerEmail))
    );
  }

  getLicenseForEmail(courseId: number, email: string): EnterpriseLicense | null {
    const lowerEmail = email.trim().toLowerCase();
    return (
      this.activeLicenses().find(
        (l) =>
          l.courseId === courseId &&
          (l.ownerEmail.toLowerCase() === lowerEmail ||
            l.members.some((m) => m.email.toLowerCase() === lowerEmail))
      ) ?? null
    );
  }
}