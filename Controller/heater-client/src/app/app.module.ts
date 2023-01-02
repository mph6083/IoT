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
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    environment.useMocks ? BleServiceMockModule : BleServiceModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
