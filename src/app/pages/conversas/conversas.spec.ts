import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Conversas } from './conversas';

describe('Conversas', () => {
  let component: Conversas;
  let fixture: ComponentFixture<Conversas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Conversas],
    }).compileComponents();

    fixture = TestBed.createComponent(Conversas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
