import { Observable } from 'rxjs';
import { Device } from 'src/app/models/device.model';
export abstract class BleService {

  abstract startScan(): Observable<Device>;

  abstract stopScan(): void;

  abstract connect(deviceId: string): Observable<any>;

  abstract disconnect(): Promise<void>;

  abstract startTempNotification(): Observable<number>;

  abstract stopTempNotification(): Promise<any>;

  abstract bluetoothIsEnabled(): Promise<void>;

  abstract bluetoothIsConnected(): Promise<any>;

  abstract setNewTemp(inputTemp: number): Promise<any>;
  abstract getLastTemp(): Promise<number>;

  abstract setDataAndStopScan(data:any):any;

  abstract isEnabled(): Promise<void>;
}
