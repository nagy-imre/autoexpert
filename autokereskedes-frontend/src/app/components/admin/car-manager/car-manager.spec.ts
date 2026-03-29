import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarManager } from './car-manager';

describe('CarManager', () => {
  let component: CarManager;
  let fixture: ComponentFixture<CarManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
