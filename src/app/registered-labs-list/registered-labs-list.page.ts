import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-registered-labs-list',
  templateUrl: './registered-labs-list.page.html',
  styleUrls: ['./registered-labs-list.page.scss'],
})
export class RegisteredLabsListPage implements OnInit {
  registeredList: AngularFireList<any>;
  cardData;
  statusArray;
  registeredLabs: Observable<any>;
  updateSuccessObj;
  keyId;
  constructor(public af:AngularFireDatabase, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.registeredList= this.af.list('/labsignup');
    this.present();
  }
  async present() {
    return await this.loadingCtrl.create({
    }).then(a => {
      a.present().then(() => {
          this.registeredLabs = this.registeredList.snapshotChanges().pipe(map(changes => {
            return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
          }));
         this.registeredLabs.subscribe((res)=>{       
            this.cardData = res;
             console.log(res)
             a.dismiss().then(() => console.log('abort presenting'));
      
         });


          });
      });
  }
  
  async dismiss() {
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }
  formatDate(datFormat){
    var d = new Date(datFormat),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

if (month.length < 2) 
    month = '0' + month;
if (day.length < 2) 
    day = '0' + day;

return [year, month, day].join('-');  
}
dropDownList(status){
    this.statusArray=[];
    this.statusArray.push(status,'Completed','Cancelled');
return status;
}
selectedList(event){
  this.updateSuccessObj= this.af.object("/labsignup/"+this.keyId)
  this.updateSuccessObj.update({status:event.target.value}).then((res)=>{
   this.present();
   });
}
cardClick(e){
  this.keyId=e;
}

}