import { Component, OnInit } from '@angular/core';
import { AwsService } from 'src/app/services/aws/aws.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(private aws: AwsService) { }

  
  ngOnInit(): void {
    this.aws.query("https://a3txg4yos96v6w-ats.iot.us-east-2.amazonaws.com/things/mhyland_heater_test/shadow", "GET").then(async (resp) => {
      let data = await resp.json();
      console.log(data);
    });

    // this.aws.query("https://a3txg4yos96v6w-ats.iot.us-east-2.amazonaws.com/things/mhyland_heater_test/shadow?name=temp", "POST", {
    //   state:{
    //     desired:{
    //       welcome:null
    //     }
    //     reported:{}
    //   }

    // });

  }

}
