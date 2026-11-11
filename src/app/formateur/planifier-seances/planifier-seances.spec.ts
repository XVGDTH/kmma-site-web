import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanifierSeances } from './planifier-seances';

describe('PlanifierSeances', () => {
  let component: PlanifierSeances;
  let fixture: ComponentFixture<PlanifierSeances>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanifierSeances],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanifierSeances);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
