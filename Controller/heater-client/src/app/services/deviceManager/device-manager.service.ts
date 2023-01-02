import { Injectable } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { BleService } from '../ble/ble.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceManagerService {

  deviceList: Map<string, Device> = new Map<string,Device>();
  constructor(private ble: BleService) { }

  async init() {
    this.ble.isEnabled().then((callback) => {
      this.ble.startScan().subscribe((device: Device) => {
        this.addBleDevice(device);
      });
    });
  }

  private addBleDevice(device: Device) {
    if (device.productName == "Mhyland Heater") {
      this.deviceList.set(device.UUID, device); //TODO: add local merge capabilities
    }
  }


}
