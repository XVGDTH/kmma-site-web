import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import {
  TranscriptChapter,
  TranscriptCue,
  VideoTranscriptData,
  buildVttContent,
} from './video-transcript.types';

@Component({
  selector: 'app-video-transcript',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-transcript.component.html',
  styleUrl: './video-transcript.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoTranscriptComponent implements OnDestroy {

  @Input({ required: true }) data!: VideoTranscriptData;
  @Input() onComplete?: () => void;

  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;

  // État
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly isPlaying = signal(false);
  readonly activeCueId = signal<string | null>(null);
  readonly vttUrl = signal<string | null>(null);

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // Générer le fichier VTT en mémoire
    const vttContent = buildVttContent(this.data.cues);
    const blob = new Blob([vttContent], { type: 'text/vtt' });
    const url = URL.createObjectURL(blob);
    this.vttUrl.set(url);
    this.duration.set(this.data.duration);
  }

  ngOnDestroy(): void {
    const url = this.vttUrl();
    if (url) URL.revokeObjectURL(url);
  }

  // ============================================================
  // SYNCHRONISATION VIDÉO ↔ TRANSCRIPT
  // ============================================================
  onTimeUpdate(event: Event): void {
    const video = event.target as HTMLVideoElement;
    const t = video.currentTime;
    this.currentTime.set(t);

    const cue = this.data.cues.find(
      (c) => t >= c.startTime && t < c.endTime
    );

    if (cue && cue.id !== this.activeCueId()) {
      this.activeCueId.set(cue.id);
      this.scrollCueIntoView(cue.id);
    }
  }

  onLoadedMetadata(event: Event): void {
    const video = event.target as HTMLVideoElement;
    this.duration.set(video.duration);
  }

  onPlay(): void { this.isPlaying.set(true); }
  onPause(): void { this.isPlaying.set(false); }

  onEnded(): void {
    this.isPlaying.set(false);
    this.onComplete?.();
  }

  // ============================================================
  // DÉFILEMENT AUTOMATIQUE
  // ============================================================
  private scrollCueIntoView(cueId: string): void {
    setTimeout(() => {
      const el = document.getElementById('cue-' + cueId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // ============================================================
  // ACTIONS UTILISATEUR
  // ============================================================
  seekTo(seconds: number): void {
    const video = this.videoEl?.nativeElement;
    if (!video) return;
    video.currentTime = seconds;
    video.play();
  }

  seekToCue(cue: TranscriptCue): void {
    this.seekTo(cue.startTime);
  }

  seekToChapter(chapter: TranscriptChapter): void {
    this.seekTo(chapter.startTime);
  }

  togglePlay(): void {
    const video = this.videoEl?.nativeElement;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  // ============================================================
  // HELPERS TEMPLATE
  // ============================================================
  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  isActiveChapter(chapter: TranscriptChapter): boolean {
    const t = this.currentTime();
    return t >= chapter.startTime && t < chapter.endTime;
  }

  isActiveCue(cue: TranscriptCue): boolean {
    return this.activeCueId() === cue.id;
  }

  progressPercent(): number {
    const d = this.duration();
    if (d <= 0) return 0;
    return (this.currentTime() / d) * 100;
  }

  copyTranscript(): void {
    const text = this.data.cues.map((c) => c.text).join('\n');
    navigator.clipboard.writeText(text);
    // Tu peux ajouter un toast ici si tu veux
  }

  downloadTranscript(): void {
    const text = this.data.cues.map((c) => c.text).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript-' + this.data.videoId + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}