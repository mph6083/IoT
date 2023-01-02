import { TestBed } from '@angular/core/testing';

import { SavedDevicesService } from './saved-devices.service';

describe('SavedDevicesService', () => {
  let service: SavedDevicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavedDevicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
