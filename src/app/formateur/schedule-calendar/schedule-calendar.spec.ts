import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduleCalendar } from './schedule-calendar';

describe('ScheduleCalendar', () => {
  let component: ScheduleCalendar;
  let fixture: ComponentFixture<ScheduleCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleCalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
