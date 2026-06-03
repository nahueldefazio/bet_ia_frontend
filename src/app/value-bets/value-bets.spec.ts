import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueBets } from './value-bets';

describe('ValueBets', () => {
  let component: ValueBets;
  let fixture: ComponentFixture<ValueBets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValueBets],
    }).compileComponents();

    fixture = TestBed.createComponent(ValueBets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
