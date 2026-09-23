import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import {
  ForumThread,
  ForumReply
} from '../data/forum';

const API_URL = 'http://127.0.0.1:8000/api';

@Injectable({
  providedIn: 'root'
})
export class ForumApiService {

  constructor(private http: HttpClient) {}

  /**
   * Récupérer toutes les discussions d'un cours
   */
  getThreads(courseId: number): Observable<ForumThread[]> {
    return this.http
      .get<{ data: ForumThread[] }>(
        `${API_URL}/courses/${courseId}/forum`
      )
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Créer une discussion
   */
  createThread(data: {
    course_id: number;
    chapter_id?: number | null;
    title: string;
    content: string;
  }): Observable<ForumThread> {

    return this.http
      .post<{ data: ForumThread }>(
        `${API_URL}/forum/threads`,
        data
      )
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Ajouter une réponse
   */
  createReply(
    threadId: number,
    content: string
  ): Observable<ForumReply> {

    return this.http
      .post<{ data: ForumReply }>(
        `${API_URL}/forum/threads/${threadId}/replies`,
        {
          content
        }
      )
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Upvote d'une discussion
   */
  upvoteThread(
    threadId: number
  ): Observable<ForumThread> {

    return this.http
      .post<{ data: ForumThread }>(
        `${API_URL}/forum/threads/${threadId}/upvote`,
        {}
      )
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Upvote d'une réponse
   */
  upvoteReply(
    replyId: number
  ): Observable<ForumReply> {

    return this.http
      .post<{ data: ForumReply }>(
        `${API_URL}/forum/replies/${replyId}/upvote`,
        {}
      )
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Marquer / démarquer comme résolu
   */
  toggleResolved(
    threadId: number
  ): Observable<ForumThread> {

    return this.http
      .patch<{ data: ForumThread }>(
        `${API_URL}/forum/threads/${threadId}/resolved`,
        {}
      )
      .pipe(
        map(response => response.data)
      );
  }
}