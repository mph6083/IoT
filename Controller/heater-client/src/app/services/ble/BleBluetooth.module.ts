import { NgModule } from '@angular/core';
import { BleService } from './ble.service';
import { BleBluetoothService } from './bleBluetooth.service';

@NgModule({
  providers: [
    {provide: BleService, useClass: BleBluetoothService},
  ]
})


export class BleServiceModule { }
