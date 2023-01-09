import { Injectable } from '@angular/core';
import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2/ngx';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WifiHostService {

  constructor(private wifiWizard2: WifiWizard2, private http: HttpClient ) { }

  async wifi_isConnected(){
    let ssid: string | undefined;
    try{
      let x = await this.wifiWizard2.getConnectedSSID();
      console.log({x});
      ssid = x;
    }
    catch{
      ssid = undefined;
    }
    return ssid;
  }
  wifi_disconnect(ssid:string){
    this.wifiWizard2.disable(ssid);
  }
  wifi_scanNetworks(){
    return this.wifiWizard2.scan();
  }
  wifi_requestPermission(){
    return this.wifiWizard2.requestPermission()
  }
  wifi_isEnabled(){
    return this.wifiWizard2.isWifiEnabled();
  }

  wifi_connect(){
    return this.wifiWizard2.connect("Mhyland Heater",true,"password","WPA");
  }

  http_setTemp(temp:number){
    return this.http.post("192.168.4.1/heater","" + temp);
  }
  http_getSetTemp(){
    return this.http.get("192.168.4.1/heater");
  }
  http_getTemp(){
    return this.http.get("192.168.4.1/temp");
  }



}
