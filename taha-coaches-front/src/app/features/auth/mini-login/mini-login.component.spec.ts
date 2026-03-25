import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniLoginComponent } from './mini-login.component';

describe('MiniLoginComponent', () => {
  let component: MiniLoginComponent;
  let fixture: ComponentFixture<MiniLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiniLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
