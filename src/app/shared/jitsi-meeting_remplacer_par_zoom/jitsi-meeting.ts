import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

@Component({
  selector: 'app-jitsi-meeting',
  standalone: true,
  template: `<div #jitsiContainer class="jitsi-container"></div>`,
  styleUrl: './jitsi-meeting.scss',
})
export class JitsiMeeting implements AfterViewInit, OnDestroy {
  @ViewChild('jitsiContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  @Input({ required: true }) roomName!: string;
  @Input() displayName = 'Participant KMAA';
  @Input() isModerator = false;

  @Output() meetingEnded = new EventEmitter<void>();

  private api: any;
  private readonly platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadJitsiScript()
      .then(() => this.initJitsi())
      .catch(() => {
        this.containerRef.nativeElement.innerHTML =
          '<p style="color:#fff;text-align:center;padding:40px;">Impossible de charger la visioconférence. Vérifiez votre connexion.</p>';
      });
  }

  private loadJitsiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Échec du chargement de Jitsi'));
      document.body.appendChild(script);
    });
  }

  private initJitsi(): void {
    const options = {
      roomName: this.roomName,
      parentNode: this.containerRef.nativeElement,
      width: '100%',
      height: '100%',
      userInfo: { displayName: this.displayName },
      configOverwrite: {
        prejoinPageEnabled: true,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#050c22',
      },
    };

    this.api = new window.JitsiMeetExternalAPI('meet.jit.si', options);
    this.api.addListener('readyToClose', () => this.meetingEnded.emit());
  }

  ngOnDestroy(): void {
    this.api?.dispose();
  }
}