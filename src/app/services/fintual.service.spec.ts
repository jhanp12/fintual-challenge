import { TestBed } from '@angular/core/testing';

import { FintualService } from './fintual.service';

describe('FintualService', () => {
  let service: FintualService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FintualService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
