import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Course } from '../data/courses';

const API_URL = 'http://127.0.0.1:8000/api';

@Injectable({ providedIn: 'root' })
export class CoursesApiService {
  constructor(private http: HttpClient) {}

  getCourses(filters?: { subject?: string; level?: string; popular?: boolean }): Observable<Course[]> {
    let params = '';
    if (filters) {
      const parts: string[] = [];
      if (filters.subject) parts.push(`subject=${filters.subject}`);
      if (filters.level) parts.push(`level=${filters.level}`);
      if (filters.popular) parts.push('popular=1');
      if (parts.length) params = '?' + parts.join('&');
    }

    return this.http
      .get<{ data: Course[] }>(`${API_URL}/courses${params}`)
      .pipe(map(res => res.data));
  }

  getCourseDetail(slug: string): Observable<Course> {
    return this.http
      .get<{ data: Course }>(`${API_URL}/courses/${slug}`)
      .pipe(map(res => res.data));
  }
}