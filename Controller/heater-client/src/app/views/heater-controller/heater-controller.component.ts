import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Device } from 'src/app/models/device.model';
import { DeviceManagerService } from 'src/app/services/deviceManager/device-manager.service';
import { ChangeContext, Options } from '@angular-slider/ngx-slider';
@Component({
  selector: 'app-heater-controller',
  templateUrl: './heater-controller.component.html',
  styleUrls: ['./heater-controller.component.scss']
})
export class HeaterControllerComponent implements OnInit {
  constructor(private router: Router, public deviceManager: DeviceManagerService) { }
  UUID: string | undefined;
  device: Device | undefined;

  ngOnInit(): void {
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


  }

  back(){
    this.router.navigate(['home']);
  }
  onUserChange(changeContext: ChangeContext): void {
    
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

