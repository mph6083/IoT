import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Device, DeviceStatus } from 'src/app/models/device.model';
import { DeviceManagerService } from 'src/app/services/deviceManager/device-manager.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    public deviceManager: DeviceManagerService,
    private router:Router,
    private toastController: ToastController,
    ) { }
  devices:Array<Device> = Array.from(this.deviceManager.deviceList.values());
  reloadInterval:NodeJS.Timer | undefined = undefined;
  ngOnInit(): void {
    this.deviceManager.init();
    this.devices = Array.from(this.deviceManager.deviceList.values());
    this.reloadInterval = setInterval(() => {
      // Any calls to load data go here
      //console.log("update")
      this.devices = Array.from(this.deviceManager.deviceList.values());
    }, 500); // ! literally the worst way I can think to do this, lol
  }

  getDotColor(status: DeviceStatus) {
    switch (status) {
      case DeviceStatus.Nearby_not_registered: return "#aa00ff";
      case DeviceStatus.Offline: return "#616161";
      case DeviceStatus.Online: return "#00c853";
      default: return "#000000";
    }
  }
  getStatusText(status: DeviceStatus) {
    // if(status == DeviceStatus.Nearby_not_registered){
    //   return "#aa00ff"
    // }
    switch (status) {
      case DeviceStatus.Nearby_not_registered: return "Device Nearby";
      case DeviceStatus.Offline: return "Device Offline";
      case DeviceStatus.Online: return "Device Online";
      default: return "#000000";
    }
  }

  trimString(trimString:string){
    return trimString.length > 15? trimString.substring(0,15) : trimString;
  }

  async presentDeviceOfflineToast() {
    const toast = await this.toastController.create({
      message: 'Cannot Connect to offline device',
      duration: 300
    });
    toast.present();
  }

  handleRefresh(event: any) {
    this.devices = [];
    setTimeout(() => {
      // Any calls to load data go here
      this.devices = Array.from(this.deviceManager.deviceList.values());
      event.target.complete();
    }, 2000);


  };


  openHeater(device:Device){
    if(device.status != DeviceStatus.Offline){
          this.router.navigate(['HeatControl'],{state:{data:device.UUID}});
    }
    else{
      this.presentDeviceOfflineToast();
    }
  }

}
