import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Device } from 'src/app/models/device.model';
import { BleService } from '../ble/ble.service';
import { WifiHostService } from '../wifiHost/wifi-host.service';
import { Geolocation } from '@capacitor/geolocation';
@Injectable({
  providedIn: 'root'
})
export class DeviceManagerService {

  deviceList: Map<string, Device> = new Map<string, Device>();
  constructor(private ble: BleService, private wifi: WifiHostService, private platform: Platform) { }

  async init() {
    this.platform.ready().then(() => {
      this.ble.isEnabled().then((callback) => {
        this.ble.startScan().subscribe((device: Device) => {
          this.addBleDevice(device);
        });
      });
      this.wifi.wifi_isEnabled().then(() => {
        Geolocation.requestPermissions().then((locationdata) => {
          console.log(locationdata)
          this.wifi.wifi_scanNetworks().then((data) => {
            console.log(data);
          });
        });
      });
    });

  }

  private addBleDevice(device: Device) {
    if (device.productName == "Mhyland Heater") {
      this.deviceList.set(device.UUID, device); //TODO: add local merge capabilities
    }
  }


}
