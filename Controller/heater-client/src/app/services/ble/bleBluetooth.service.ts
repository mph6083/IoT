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
    const connectObservable = this.ble.connect(deviceId);
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
    const characteristicUUID = '00002A6E00001000800000805F9B34FB';
    return this.ble.startNotification(this.connectedDevice.id, serviceUUID, characteristicUUID).pipe(
      map((arrayWithBuffer) => {
        //3230303130303731303030303030
        const bufferHexArray: string[] = this.bufferToHex(arrayWithBuffer[0]).split('');
        const readTemp = parseInt(bufferHexArray[11] + bufferHexArray[13] + bufferHexArray[15], 10);
        return readTemp;
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
    const serviceUUID = 'FAEE6D88FB83338801065DF4E32A0000';
    const caracteristicUUID = '00002A6E00001000800000805F9B34FB';


    // eslint-disable-next-line prefer-const
    let setTempData = this.setTempCodeGenerator(inputTemp);
    return this.ble.writeWithoutResponse(this.connectedDevice.id, serviceUUID, caracteristicUUID, setTempData);
  }



  private setTempCodeGenerator(inputTemp: number): ArrayBufferLike {
    inputTemp = Math.round(inputTemp); //make sure temp is a whole number

    inputTemp = inputTemp < 35 ? 35 : inputTemp; //if under 35 round up
    inputTemp = inputTemp > 105 ? 105 : inputTemp; // if over 105 round down

    const digitArray: string[] = inputTemp.toString().split('');

    let hundredsPlace: string = '';
    let tensPlace: string = '';
    let onesPlace: string = '';
    if (digitArray.length === 3) {
      hundredsPlace = '1';
      tensPlace = digitArray[1];
      onesPlace = digitArray[2];
    }
    else if (digitArray.length === 2) {
      hundredsPlace = '0';
      tensPlace = digitArray[0];
      onesPlace = digitArray[1];
    }

    //todo:THIS
    const outputString = ``;

    return this.hexStringToArrayBuffer(outputString);

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
