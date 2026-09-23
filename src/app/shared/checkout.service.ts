import { Injectable, signal } from '@angular/core';

export interface CheckoutSession {
  courseId: string;
  planId: string;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  readonly session = signal<CheckoutSession | null>(null);

  startCheckout(courseId: string, planId: string, amount: number): void {
    this.session.set({ courseId, planId, amount });
  }

  clear(): void {
    this.session.set(null);
  }
}