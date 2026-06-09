import { TestBed } from '@angular/core/testing';

import * as ToastModule from './toast';

describe('Toast', () => {
  let service: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    const token = (ToastModule as any).Toast ?? (ToastModule as any).default;
    service = TestBed.inject(token);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
