import { TestBed } from '@angular/core/testing';

import { RealTimeDataService } from './real-time-data.service';

describe('RealTimeDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RealTimeDataService = TestBed.get(RealTimeDataService);
    expect(service).toBeTruthy();
  });
});
