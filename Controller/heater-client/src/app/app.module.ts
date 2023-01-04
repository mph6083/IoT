import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { environment } from 'src/environments/environment';
import { BleServiceModule } from './services/ble/BleBluetooth.module';
import { BleServiceMockModule } from './services/ble/BleMock.module';
import { HeaterControllerComponent } from './views/heater-controller/heater-controller.component';
import { HeaterSvgComponent } from './components/heater-svg/heater-svg.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { BLE } from '@awesome-cordova-plugins/ble/ngx';
import { WifiWizard2 } from '@awesome-cordova-plugins/wifi-wizard-2/ngx';
import { HttpClientModule } from '@angular/common/http';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    HeaterControllerComponent,
    HeaterSvgComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    environment.useMocks ? BleServiceMockModule : BleServiceModule,
    NgxSliderModule,
    HttpClientModule,
  ],
  providers: [ BLE,Vibration,WifiWizard2],
  bootstrap: [AppComponent]
})
export class AppModule { }
