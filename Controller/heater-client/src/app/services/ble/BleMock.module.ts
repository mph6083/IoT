import { NgModule } from '@angular/core';
import { BleService } from './ble.service';
import { BleMockService } from './bleMock.service';

@NgModule({
  providers: [
    {provide: BleService, useClass: BleMockService},
  ]
})


export class BleServiceMockModule { }
