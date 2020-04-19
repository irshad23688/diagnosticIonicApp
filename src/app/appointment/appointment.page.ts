import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { LoadingController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
})
export class AppointmentPage implements OnInit {
  public appointmentList;
  tableData;
  showMsg=true;
  constructor(public af:AngularFireDatabase, private loadingCtrl: LoadingController, private afd: AngularFireAuth) { 
  }

  ngOnInit() {
    // this.appointmentList= this.af.list('/bookings');
  
    this.present();
  }
  
  
async present() {
  this.tableData=[];
  // this.appointmentList=[];
  return await this.loadingCtrl.create({
  }).then(a => {
    console.log('a');
    a.present().then(() => {
        if (this.afd.auth.currentUser) {
          this.af.list('/bookings',ref=>ref.orderByChild("createdId").equalTo(this.afd.auth.currentUser.uid)).snapshotChanges().subscribe(res=>{
           console.log(res);
          //  this.appointmentList=res;
          //  console.log(this.appointmentList);
          this.showMsg=false;
           res.forEach(item => {
             let temp = item.payload.val();
             // this.discountedPrice= temp.value;
             console.log('temp', temp)
             temp["$key"] = item.payload.key;
             this.tableData.push(temp);
             this.showMsg=true;
            });
            a.dismiss().then(() => console.log('abort presenting'));
         });
   }
        });
    });
}

async dismiss() {
  return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
}


}
