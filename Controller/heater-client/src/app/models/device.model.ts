export interface Device{
  UUID:string;
  nickname:string | undefined;
  status:DeviceStatus;
  productName:string;
  deviceType:DeviceType;
}

export enum DeviceStatus{
  Online,
  Offline,
  Nearby_not_registered,
}
export enum DeviceType{
  Bluetooth,
  Wifi_Host,
  Wifi_Hosted_Endpoint,
  Wifi_AWS,
  Matter,
  Other
}
