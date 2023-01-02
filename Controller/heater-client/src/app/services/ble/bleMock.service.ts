import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Device, DeviceStatus, DeviceType } from 'src/app/models/device.model';
import { BleService } from './ble.service';

@Injectable({
  providedIn: 'root'
})
export class BleMockService extends BleService {

  nextDeviceTemp = 0;
  nextDeviceArray: Array<number> | undefined = undefined;
  startScan(): Observable<Device> {
    return Observable.create( (observer: any) => {
      observer.next({
        UUID: "A4:33:93:F6:AC",
        nickname: undefined,
        status: DeviceStatus.Nearby_not_registered,
        productName: 'Smart Lock',
        deviceType: DeviceType.Bluetooth,
      } as Device);
      observer.next({
        UUID: "A4:33:63:F6:DC",
        nickname: undefined,
        status: DeviceStatus.Nearby_not_registered,
        productName: 'Mhyland Heater',
        deviceType: DeviceType.Bluetooth,
      } as Device );
      observer.complete();
    });
  }
  stopScan(): void {
    return;
  };
  connect(deviceId: string) {
   return of('');
  }
  disconnect(): Promise<void> {
    return Promise.resolve();
  };
  isEnabled(): Promise<void>{
    return Promise.resolve();
  }
  startTempNotification(): Observable<number> {
    return timer(500,1000).pipe(
      map( (data) => {
        if(this.nextDeviceTemp === 0){
          return Math.floor(Math.random() * 75) + 32;
        }
        return this.nextDeviceTemp;

      })
    );
  };
  stopTempNotification(): Promise<any> {
    return Promise.resolve();
  };
  bluetoothIsEnabled(): Promise<void> {
    return Promise.resolve();
  };
  bluetoothIsConnected(): Promise<any> {
    return Promise.resolve();
  };
  setNewTemp(inputTemp: number): Promise<any> {

    if(this.nextDeviceArray === undefined){
      this.nextDeviceArray = new Array<number>();
      this.nextDeviceArray.push(60);
    }
    this.nextDeviceArray.push(inputTemp);
    this.nextDeviceTemp = this.nextDeviceArray.shift()!;

    return Promise.resolve();
  };
  getNicknames() {
    throw new Error('Method not implemented.');
  }
  setNickname() {
    throw new Error('Method not implemented.');
  }

  setDataAndStopScan(data:any){
    return ;
  }

}
