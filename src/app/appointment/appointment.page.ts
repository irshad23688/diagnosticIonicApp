import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
})
export class AppointmentPage implements OnInit {
  public appointmentList;
  tableData;
  constructor(public af:AngularFireDatabase, private loadingCtrl: LoadingController) { 
  }

  ngOnInit() {
    this.appointmentList= this.af.list('/bookings');
    this.present();
  }
  
  
async present() {
  return await this.loadingCtrl.create({
  }).then(a => {
    console.log('a');
    a.present().then(() => {
        this.appointmentList.valueChanges().subscribe(data => {
        this.tableData = data;
        console.log(this.tableData);
        a.dismiss().then(() => console.log('abort presenting'));
        });
        });
    });
}

async dismiss() {
  return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
}


}
