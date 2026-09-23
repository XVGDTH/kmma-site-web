export interface ForumUser {
  id: number;
  name: string;
}

export interface ForumChapter {
  id: number;
  title: string;
}

export interface ForumReply {
  id: number;
  forum_thread_id: number;
  user_id: number;
  content: string;
  upvotes: number;
  created_at: string;
  updated_at?: string;

  user: ForumUser;
}

export interface ForumThread {
  id: number;
  course_id: number;
  chapter_id?: number | null;
  user_id: number;

  title: string;
  content: string;
  upvotes: number;
  resolved: boolean;

  created_at: string;
  updated_at?: string;

  user: ForumUser;

  chapter?: ForumChapter | null;

  replies: ForumReply[];
}