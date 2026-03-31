import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAvailabilityComponent } from './admin-availability.component';

describe('AdminAvailabilityComponent', () => {
  let component: AdminAvailabilityComponent;
  let fixture: ComponentFixture<AdminAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAvailabilityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
