import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Device, DeviceStatus, DeviceType } from 'src/app/models/device.model';
import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2/ngx';

@Injectable({
  providedIn: 'root'
})
export class WifiHostService {

  constructor(private wifiWizard2: WifiWizard2, private http: HttpClient ) { }

  async wifi_isConnected(){
    return this.wifiWizard2.getConnectedSSID();
  }
  wifi_disconnect(ssid:string){
    this.wifiWizard2.disable(ssid);
  }
  async wifi_scanNetworks(): Promise<Array<Device>>{
    const devices = await this.wifiWizard2.scan();
    console.log(devices);
    return devices.map( (device:any) => {
      return {
        UUID: device.SSID,
        nickname: undefined,
        status: DeviceStatus.Nearby_not_registered,
        productName: device.SSID,
        deviceType: DeviceType.Wifi_Host,
      }
    })
  }
  wifi_requestPermission(){
    return this.wifiWizard2.requestPermission()
  }
  wifi_isEnabled(){
    return this.wifiWizard2.isWifiEnabled();
  }

  wifi_connect(){
    return this.wifiWizard2.suggestConnection("Mhyland Heater");
  }

  http_setTemp(temp:number){
    return this.http.post("http://192.168.4.1/heater","" + temp).subscribe();
  }
  http_getSetTemp(){
    return this.http.get("http://192.168.4.1/heater");
  }
  http_getTemp(){
    return this.http.get("http://192.168.4.1/temp");
  }



}
