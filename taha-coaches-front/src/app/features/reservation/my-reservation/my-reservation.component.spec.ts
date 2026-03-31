import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyReservationComponent } from './my-reservation.component';

describe('MyReservationComponent', () => {
  let component: MyReservationComponent;
  let fixture: ComponentFixture<MyReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyReservationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
