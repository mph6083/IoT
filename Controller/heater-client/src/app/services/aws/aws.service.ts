import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AwsClient } from 'aws4fetch';
import { Device, DeviceStatus, DeviceType } from 'src/app/models/device.model';
import { secretKey, accessKeyID } from '../../secure/secure';
import { Observable } from 'rxjs/internal/Observable';
@Injectable({
  providedIn: 'root'
})
export class AwsService {

  private MY_ACCESS_KEY = accessKeyID;
  private MY_SECRET_KEY = secretKey;

  private url = "https://a3txg4yos96v6w-ats.iot.us-east-2.amazonaws.com/things/mhyland_heater_test/shadow";

  constructor(private http: HttpClient,) { }
  data: any = undefined;
  aws_setTemp(temp: number): void {
    this.query(this.url, "POST", {
      state: {
        desired: {
          temp: temp
        }
      }
    });
  }
  async aws_getSetTemp() {
    if (this.data) {
      return this.data.state.desired.temp;
    }
    else {
      let data = await this.getData();
      return data.state.desired.temp;
    }

  }
  async aws_getTemp() {
    let data = await this.getData();
    return data.state.reported.temp;
  }

  private async getData(): Promise<any> {
    let response = await this.query(this.url, "GET");
    let data = await response.json();
    this.data = data;
    return data;
  }

  private async aws_isOnline(): Promise<boolean> {
    const data = await this.getData();
    console.log(data);
    const lastRefreshed = data.metadata.reported.temp.timestamp;
    const seconds = (Math.floor(Date.now() / 1000)) - lastRefreshed;
    console.log(seconds);
    return seconds < 60;
  }

  async aws_softisOnline(): Promise<boolean> {
    if (this.data) {
      const lastRefreshed = this.data.metadata.reported.temp.timestamp;
      const seconds = (Math.floor(Date.now() / 1000)) - lastRefreshed;
      console.log(seconds);
      return seconds < 60;
    }
    else {
      return this.aws_softisOnline();
    }

  }

  aws_getHeaters(): Observable<Device> {

    return Observable.create((observer: any) => {
      observer.next({
        UUID: "mhyland_heater_test",
        nickname: undefined,
        status: DeviceStatus.Offline,
        productName: "Mhyland Heater",
        deviceType: DeviceType.Wifi_AWS
      } as Device);

      this.aws_isOnline().then((online) => {

        observer.next({
          UUID: "mhyland_heater_test",
          nickname: undefined,
          status: online? DeviceStatus.Online: DeviceStatus.Offline,
          productName: "Mhyland Heater",
          deviceType: DeviceType.Wifi_AWS
        } as Device);
      });

      let timer = setInterval(async () => {
        if (await this.aws_isOnline()) {
          observer.next({
            UUID: "mhyland_heater_test",
            nickname: undefined,
            status: DeviceStatus.Online,
            productName: "Mhyland Heater",
            deviceType: DeviceType.Wifi_AWS
          } as Device);
          clearInterval(timer);
        }

      }, 8000);


      // observer.complete();
    });





  }


  async query(url: any, method: string, body?: any) {
    const aws = new AwsClient({ accessKeyId: this.MY_ACCESS_KEY, secretAccessKey: this.MY_SECRET_KEY, region: "us-east-2" });

    let request_data: any = {
      method
    };
    if (body) {
      request_data = {
        ...request_data,
        body: JSON.stringify(body)
      };

    }
    const response = await aws.fetch(url, request_data);
    console.log(response);
    return response;
  }

}
