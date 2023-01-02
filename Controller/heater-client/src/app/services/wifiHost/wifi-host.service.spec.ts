import { TestBed } from '@angular/core/testing';

import { WifiHostService } from './wifi-host.service';

describe('WifiHostService', () => {
  let service: WifiHostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WifiHostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
