import { AfterViewChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Device, DeviceType } from 'src/app/models/device.model';
import { DeviceManagerService } from 'src/app/services/deviceManager/device-manager.service';
import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { BleService } from 'src/app/services/ble/ble.service';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';

@Component({
  selector: 'app-heater-controller',
  templateUrl: './heater-controller.component.html',
  styleUrls: ['./heater-controller.component.scss']
})
export class HeaterControllerComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    public deviceManager: DeviceManagerService,
    private ble: BleService,
    private vibration: Vibration
  ) { }

  UUID: string | undefined;
  device: Device | undefined;
  signalStrength: number = -63;
  currentTemp = 58;
  heaterSetPoint = 63;
  ngOnInit(): void {

    setInterval(() => {
      this.signalStrength += Math.floor(Math.random() * (5 + 5 + 1) - 5);
      if (this.signalStrength > -50) {
        this.signalStrength = -58;
      }

    }, 2000);

    this.UUID = (this.router.getCurrentNavigation()?.extras?.state as any)?.data;
    console.log(this.UUID);
    if (this.UUID == undefined) {
      this.router.navigate(['home']);
    }
    this.device = this.deviceManager.deviceList.get(this.UUID!);
    if (this.device == undefined) {
      this.router.navigate(['home']);
    }
    console.log(this.device);
    if (this.device?.deviceType == DeviceType.Bluetooth) {
      this.setupBluetooth();
    }

  }

  ngOnDestroy(): void {
    if(this.device?.deviceType == DeviceType.Bluetooth) {
      this.ble.disconnect();
    }
  }

  back() {
    this.router.navigate(['home']);
  }
  onUserChange(changeContext: ChangeContext): void {
    this.vibration.vibrate(200);

  }
  onUserChangeEnd(changeContext: ChangeContext): void {
    if (this.device?.deviceType == DeviceType.Bluetooth) {
      this.ble.setNewTemp(changeContext.value);
      console.log("setting Temp");
    }
  }
  HeaterOnClass() {
    if (this.currentTemp < this.heaterSetPoint) {
      return 'heater_on';
    }
    return 'heater_off';
  }
  HeaterOnText() {
    if (this.currentTemp < this.heaterSetPoint) {
      return 'Heater On';
    }
    return 'Heater Off';
  }

  setupBluetooth() {
    if (this.UUID){
      this.ble.connect(this.UUID).subscribe(async (ret) => {
        this.ble.getLastTemp().then( (value) =>{
          this.heaterSetPoint = value;
        });
        setInterval(async () => {
          this.heaterSetPoint = await this.ble.getLastTemp();
        }, 2000);
        this.ble.startTempNotification().subscribe((ret) => {
          this.currentTemp = ret;
        });

      });
    }

  }

  connectionInfo(){
    if(this.device?.deviceType == DeviceType.Bluetooth || this.device?.deviceType == DeviceType.Wifi_Host){
       return "Signal Strength: " + this.signalStrength + "Db";
    }
    else{
      return "Hello Dolly!"
    }
  }

  verticalSlider1: SimpleSliderModel = {
    value: 63,
    options: {
      floor: 50,
      ceil: 95,
      vertical: true
    }
  };

}

interface SimpleSliderModel {
  value: number;
  options: Options;
}



