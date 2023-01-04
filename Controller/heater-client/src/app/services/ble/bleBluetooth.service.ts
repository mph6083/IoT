import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { BleService } from './ble.service';
import { Device, DeviceStatus, DeviceType } from "../../models/device.model";

@Injectable({
  providedIn: 'root'
})
export class BleBluetoothService extends BleService {

  private connectedDevice: any;
  private shouldStartScan = true;
  constructor(private ble: BLE, private router: Router) {
    super();
  }

  /**
   * Starts a continous scan of the avalible bluetooth devices and returns ScannedDevice list of hound heaters in range
   *
   * @memberof BleService
   */
  startScan(): Observable<Device> {
    return this.ble.startScan([]).pipe(
      map(device => {
        if (device.name == "Mhyland Heater") {
          console.log(device);
        }
        return {
          UUID: device.id,
          nickname: undefined,
          status: DeviceStatus.Nearby_not_registered,
          productName: device.name,
          deviceType: DeviceType.Bluetooth,
        } as Device;
      }));

  }

  isEnabled(): Promise<void> {
    return this.ble.isEnabled();
  }

  stopScan(): void {
    this.shouldStartScan = false;
    this.ble.stopScan().then(() => {
      console.log('Stopped Scanning');
    });
  }

  connect(deviceId: string): Observable<any> {
    console.log("connect observable create");
    const connectObservable = this.ble.connect(deviceId);
    console.log("connect observable created");
    return connectObservable;
  }

  setDataAndStopScan(data: any) {
    this.connectedDevice = data;
    this.stopScan();
    return;
  }


  disconnect(): Promise<void> {
    if (this.connectedDevice !== undefined && this.connectedDevice.id !== undefined) {
      return this.ble.disconnect(this.connectedDevice.id).then(() => {
        this.connectedDevice = undefined;
      });
    }
    return Promise.resolve();
  }

  startTempNotification(): Observable<number> {
    const serviceUUID = '181A';
    const characteristicUUID = '00002a6e-0000-1000-8000-00805f9b34fb';
    return this.ble.startNotification(this.connectedDevice.id, serviceUUID, characteristicUUID).pipe(
      map((arrayWithBuffer) => {
        const returnValue = (new Int8Array(arrayWithBuffer[0] as ArrayBuffer))[1];
        return returnValue;
      })
    );
  }
  stopTempNotification(): Promise<any> {
    return this.ble.stopStateNotifications();
  }

  bluetoothIsEnabled(): Promise<void> {
    return this.ble.isEnabled();
  }

  bluetoothIsConnected(): Promise<any> {
    return this.ble.isConnected(this.connectedDevice.id);
  }

  setNewTemp(inputTemp: number): Promise<any> {
    const serviceUUID = "faee6d88-fb83-3388-0106-5df4e32a0000";
    const caracteristicUUID = "0000060a-0000-1000-8000-00805f9b34fb";

    // eslint-disable-next-line prefer-const
    const inputhex = inputTemp.toString(16);
    console.log({inputhex:inputhex})
    const setTempData = this.hexStringToArrayBuffer(inputhex);
    return this.ble.writeWithoutResponse(this.connectedDevice.id, serviceUUID, caracteristicUUID, setTempData);
  }
  async getLastTemp(): Promise<number> {
    const serviceUUID = "faee6d88-fb83-3388-0106-5df4e32a0000";
    const caracteristicUUID = "0000060a-0000-1000-8000-00805f9b34fb";
    const readVal =  await this.ble.read(this.connectedDevice.id, serviceUUID, caracteristicUUID)
    const intarray = new Int8Array(readVal as ArrayBuffer)
    console.log({lastTempA:intarray[0]});
    return intarray[0];
  }

  private hexStringToArrayBuffer(hexString: string) {

    // split the string into pairs of octets
    const pairs = hexString.match(/[\dA-F]{2}/gi);

    // convert the octets to integers
    const integers = pairs!.map((s) => parseInt(s, 16));

    const array = new Uint8Array(integers);
    console.log(array);

    return array.buffer;
  }

  private bufferToHex(buffer: any) {
    return [...new Uint8Array(buffer)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }


}
