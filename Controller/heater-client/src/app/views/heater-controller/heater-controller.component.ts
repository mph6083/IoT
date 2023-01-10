import { AfterViewChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Device, DeviceType } from 'src/app/models/device.model';
import { DeviceManagerService } from 'src/app/services/deviceManager/device-manager.service';
import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { BleService } from 'src/app/services/ble/ble.service';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { LoadingController, ToastController,AlertController } from '@ionic/angular';
import { WifiHostService } from 'src/app/services/wifiHost/wifi-host.service';
import { HttpResponse } from '@angular/common/http';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings'

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
    private vibration: Vibration,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private wifi: WifiHostService,
    private alertController:AlertController
  ) { }

  UUID: string | undefined;
  device: Device | undefined;
  signalStrength: number = -63;
  currentTemp = -1;
  heaterSetPoint = 0;
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
      this.presentDisconnectErrorToast();
      this.router.navigate(['home']);
    }
    this.device = this.deviceManager.deviceList.get(this.UUID!);
    if (this.device == undefined) {
      this.presentDisconnectErrorToast();
      this.router.navigate(['home']);
    }
    console.log(this.device);
    if (this.device) {
      switch (this.device.deviceType) {
        case DeviceType.Bluetooth:
          this.setupBluetooth();
          break;
        case DeviceType.Wifi_Host:
          this.setupWifiHost();
          break;
        default:
          console.log("ERROR?");
          break;
      }
    }

  }

  ngOnDestroy(): void {
    if (this.device?.deviceType == DeviceType.Bluetooth) {
      this.ble.disconnect();
    }
    if (this.device?.deviceType == DeviceType.Wifi_Host) {
      //this.wifi.wifi_disconnect("Mhyland Heater");
    }
  }

  back() {
    this.router.navigate(['home']);
  }

  onUserChangeEnd(changeContext: ChangeContext): void {
    console.log(this.device?.deviceType)
    if (this.device?.deviceType == DeviceType.Bluetooth) {
      this.ble.setNewTemp(changeContext.value);
      console.log("setting Temp");
    }
    if (this.device?.deviceType == DeviceType.Wifi_Host) {
      this.wifi.http_setTemp(changeContext.value);
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

//     suggestConnection(ssid: string | number, password?:string, algorithm?: string, isHiddenSSID?:boolean): Promise<any>

async presentAlert() {
  const alert = await this.alertController.create({
    header: 'Direct Connection Unsupported',
    message: 'Please select the "Mhyland Heater" wifi in settings to proceed!',
    buttons: ['OK'],

  });

  await alert.present();
  await alert.onDidDismiss();
}
  async setupWifiHost() {

      if (this.UUID) {
        let currentWifi = await this.wifi.wifi_isConnected();
        if (currentWifi != "Mhyland Heater") {
          console.log(currentWifi);
          //await this.wifi.wifi_disconnect(currentWifi);
          //await this.wifi.wifi_connect();
          await this.presentAlert();
          await OpenNativeSettings.open("wifi");
        }
        if (currentWifi != "Mhyland Heater") {
          this.WrongWifiErrorToast();
          this.router.navigate(['home']);
        }

        this.wifi.http_getSetTemp().subscribe( (data:any ) => {
          this.heaterSetPoint = Number(data);
        });
        let timer = setInterval(async () => {
          let currentWifi = await this.wifi.wifi_isConnected();
          if(currentWifi != "Mhyland Heater"){
            this.presentDisconnectErrorToast();
            clearInterval(timer);
            this.router.navigate(['home']);

          }
        }, 5000);
        setInterval(async () => {
          this.wifi.http_getTemp().subscribe( (response:any) => {
            console.log(response)
            this.currentTemp = Number(response);
          })
        }, 5000);
      }
      else {
        this.presentDisconnectErrorToast();
        this.router.navigate(['home']);
      }

  }
  async setupBluetooth() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Attempting Connection',
      duration: 20000
    });
    await loading.present();

    if (this.UUID) {
      this.ble.connect(this.UUID).subscribe(async (ret) => {
        loading.dismiss();
        this.bleOnConnect(ret);
      }, (onReject) => {
        if (this.UUID) {
          this.ble.connect(this.UUID).subscribe(async (ret) => {
            loading.dismiss();
            this.bleOnConnect(ret);
          }, (onReject2) => {
            loading.dismiss();
            this.presentDisconnectErrorToast();
            this.router.navigate(['home']);
          });
        }
        else {
          loading.dismiss();
          this.presentDisconnectErrorToast();
          this.router.navigate(['home']);
        }
      });

    }
    else {
      loading.dismiss();
      this.presentDisconnectErrorToast();
      this.router.navigate(['home']);
    }
  }

  async bleOnConnect(ret: any) {
    this.ble.setDataAndStopScan(ret);
    console.log({ connected: "yes", ret });
    console.log("connected");
    this.ble.getLastTemp().then((value) => {
      console.log("got last temp");
      this.heaterSetPoint = value;
    });
    // setInterval(async () => {
    //   this.heaterSetPoint = await this.ble.getLastTemp();
    //   console.log("got last temp recurring")
    // }, 2000);
    this.ble.startTempNotification().subscribe((ret) => {
      this.currentTemp = ret;
      console.log("recieved current temp");
    });

    setInterval(() => {
      this.ble.bluetoothIsConnected().then(() => { },
        (rejected) => {
          this.presentDisconnectErrorToast();
          this.router.navigate(['home']);
        });

    }, 2000);

  }

  connectionInfo() {
    if (this.device?.deviceType == DeviceType.Bluetooth || this.device?.deviceType == DeviceType.Wifi_Host) {
      return "Signal Strength: " + this.signalStrength + "Db";
    }
    else {
      return "Hello Dolly!";
    }
  }

  async presentDisconnectErrorToast() {
    const toast = await this.toastController.create({
      message: 'Device encountered an error please try connecting again.',
      duration: 2000
    });
    toast.present();
  }
  async WrongWifiErrorToast() {
    const toast = await this.toastController.create({
      message: 'Direct Connection Unsupported, Please go to settings and connect directly to Mhyland Heater Wifi.',
      duration: 10000
    });
    toast.present();
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



