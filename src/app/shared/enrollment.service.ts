import { Injectable, signal } from '@angular/core';

export interface Enrollment {
  courseId: number;
  courseSlug: string;
  title: string;
  image: string;
  subject: string;
  progressPercent: number;
  enrolledAt: string;
  lastAccessedAt: string;
  certificateIssued: boolean;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {

  readonly enrollments = signal<Enrollment[]>([]);

  constructor() {
    this.reload();
  }

  reload(): void {
    try {
      const raw = localStorage.getItem('kmaa_enrollments');
      const list: Enrollment[] = raw ? JSON.parse(raw) : [];
      this.enrollments.set(list);
    } catch {
      this.enrollments.set([]);
    }
  }

  isEnrolled(courseId: number): boolean {
    return this.enrollments().some(e => e.courseId === courseId);
  }

  add(enrollment: Enrollment): void {
    const list = this.enrollments();
    if (!list.some(e => e.courseId === enrollment.courseId)) {
      list.push(enrollment);
      localStorage.setItem('kmaa_enrollments', JSON.stringify(list));
      this.enrollments.set([...list]);
    }
  }

  updateProgress(courseId: number, percent: number): void {
    const list = this.enrollments().map(e =>
      e.courseId === courseId
        ? { ...e, progressPercent: percent, lastAccessedAt: new Date().toISOString() }
        : e
    );
    localStorage.setItem('kmaa_enrollments', JSON.stringify(list));
    this.enrollments.set(list);
  }

  clear(): void {
    localStorage.removeItem('kmaa_enrollments');
    this.enrollments.set([]);
  }
}