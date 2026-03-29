import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalManager } from './rental-manager';

describe('RentalManager', () => {
  let component: RentalManager;
  let fixture: ComponentFixture<RentalManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RentalManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
