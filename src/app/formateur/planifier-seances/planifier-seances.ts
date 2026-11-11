import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import themePlugin from '@fullcalendar/angular/themes/monarch';


const API_URL = 'http://127.0.0.1:8000/api';

@Component({
  selector: 'app-planifier-seances',
  standalone: true,
  imports: [CommonModule, RouterLink, FullCalendarModule, FormsModule],
  template: `
    <div class="planifier-page">
      
      <header class="planifier-header">
        <a routerLink="/formateur/tableau-de-bord" class="back-link">← Retour au dashboard</a>
        <h1>Planifier des séances</h1>
        <p>Cliquez sur un jour pour ajouter une séance à cet horaire.</p>
      </header>

      <div class="calendar-wrapper">
        <full-calendar [options]="calendarOptions"></full-calendar>
      </div>

      <!-- ✅ MODAL DE SÉLECTION D'HEURE -->
      @if (selectedDate()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h2>Programmer une séance</h2>
            <p class="modal-date">{{ selectedDate() | date:'EEEE d MMMM yyyy' }}</p>
            
            <label class="form-label">Heure de la séance</label>
            <input 
              type="time" 
              [(ngModel)]="selectedTime" 
              class="form-input"
            />

           <div class="modal-actions">
  <button class="btn-cancel" (click)="closeModal()" [disabled]="isSubmitting()">Annuler</button>
  <button class="btn-confirm" (click)="confirmSchedule()" [disabled]="isSubmitting()">
    @if (isSubmitting()) {
       Programmation...
    } @else {
      Programmer
    }
  </button>
</div>
<!-- ✅ Message de succès -->
@if (successMessage()) {
  <p style="color: #10b981; font-weight: 600; margin-top: 15px; text-align: center;">
    ✓ {{ successMessage() }}
  </p>
}
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .planifier-page { padding: 40px; max-width: 1200px; margin: 0 auto; }
    .planifier-header { margin-bottom: 30px; }
    .back-link { color: #b87333; text-decoration: none; font-weight: 600; }
    .planifier-header h1 { margin-top: 10px; font-size: 2rem; color: #1a202c; }
    .planifier-header p { color: #718096; }
    .calendar-wrapper { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    
    /* MODAL STYLES */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
      z-index: 1000; backdrop-filter: blur(4px);
    }
    .modal-card {
      background: white; padding: 30px; border-radius: 12px; width: 400px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    }
    .modal-card h2 { margin-top: 0; color: #1a202c; }
    .modal-date { color: #b87333; font-weight: 600; margin-bottom: 20px; }
    .form-label { display: block; font-weight: 600; margin-bottom: 8px; color: #4a5568; }
    .form-input { 
      width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; 
      font-size: 1rem; margin-bottom: 20px;
    }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
    .btn-cancel { 
      padding: 10px 20px; border-radius: 8px; border: 1px solid #e2e8f0; 
      background: white; color: #4a5568; cursor: pointer; font-weight: 600;
    }
    .btn-confirm { 
      padding: 10px 20px; border-radius: 8px; border: none; 
      background: #b87333; color: white; cursor: pointer; font-weight: 600;
    }
    .btn-confirm:hover { background: #a05a25; }

        /* ✅ Personnalisation des couleurs FullCalendar */
    :host ::ng-deep .fc {
      font-family: inherit;
    }
    :host ::ng-deep .fc .fc-button-primary {
      background-color: #b87333 !important;
      border-color: #b87333 !important;
    }
    :host ::ng-deep .fc .fc-button-primary:hover {
      background-color: #a05a25 !important;
    }
    :host ::ng-deep .fc .fc-daygrid-day.fc-day-today {
      background-color: rgba(184, 115, 51, 0.1) !important;
    }
    :host ::ng-deep .fc .fc-col-header-cell {
      background-color: #f8fafc;
      color: #1a202c;
      font-weight: 600;
    }
    :host ::ng-deep .fc-event {
      background-color: #ef4444 !important;
      border-color: #ef4444 !important;
      cursor: pointer;
    }
  `],
})
export class PlanifierSeancesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  readonly isSubmitting = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);

  courseId!: string;

  // ✅ Signaux pour le modal
  readonly selectedDate = signal<Date | null>(null);
  selectedTime = '18:00';

calendarOptions: any = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, themePlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek'
  },
  height: 'auto',
  selectable: true,
  select: (info: any) => this.handleDateSelect(info),
  events: [],
  locale: 'fr',
};

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.http.get<{ data: any[] }>(`${API_URL}/formateur/courses/${this.courseId}/live/schedules`)
      .subscribe({
        next: (res) => {
          const events = res.data.map((s: any) => ({
            id: s.id,
            title: 'Séance Zoom',
            start: s.scheduled_at,
            backgroundColor: '#ef4444',
            borderColor: '#ef4444',
          }));
          this.calendarOptions = { ...this.calendarOptions, events };
        },
        error: () => alert('Impossible de charger les séances.')
      });
  }

  handleDateSelect(selectInfo: any): void {
    // ✅ On ouvre le modal avec la date sélectionnée
    this.selectedDate.set(new Date(selectInfo.startStr));
  }

  confirmSchedule(): void {
    const date = this.selectedDate();
    if (!date || !this.selectedTime) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}T${this.selectedTime}:00`;

    this.isSubmitting.set(true);
    this.successMessage.set(null);

    this.http.post(`${API_URL}/formateur/courses/${this.courseId}/live/schedule`, {
      dates: [fullDate]
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Séance programmée avec succès !');
        this.loadSchedules();
        
        // On ferme le modal après 2 secondes
        setTimeout(() => {
          this.closeModal();
          this.successMessage.set(null);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err?.error?.message ?? 'Erreur lors de la programmation.');
      }
    });
  }

  closeModal(): void {
    this.selectedDate.set(null);
  }
}