import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundsChartComponent } from './funds-chart.component';

describe('FundsChartComponent', () => {
  let component: FundsChartComponent;
  let fixture: ComponentFixture<FundsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundsChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FundsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
