import { NgModule } from '@angular/core';
import { BleService } from './ble.service';
import { BleMockService } from './mock/bleMock.service';

@NgModule({
  providers: [
    {provide: BleService, useClass: BleMockService},
  ]
})


export class BleServiceMockModule { }
