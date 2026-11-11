import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule],
  template: `
    <div class="calendar-container">
      <full-calendar [options]="calendarOptions"></full-calendar>
    </div>
  `,
})
export class ScheduleCalendarComponent {
  @Input() courseId!: number;
  @Output() scheduled = new EventEmitter<void>();
  
  private http = inject(HttpClient);
  private selectedDates: string[] = [];

  calendarOptions: any = { 
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    selectable: true,
    select: (info: any) => this.handleDateSelect(info),
    events: [],
    locale: 'fr',
  };

  handleDateSelect(selectInfo: any) {
    alert('Date sélectionnée : ' + selectInfo.startStr);
  }
}