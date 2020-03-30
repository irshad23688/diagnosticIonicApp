/**
* Ionic 4 Firebase Email Auth
*
* Copyright © 2019-present Enappd. All rights reserved.
*
* This source code is licensed as per the terms found in the
* LICENSE.md file in the root directory of this source tree.
*/
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from '@angular/fire/database';
import { IntercomponentService } from '../services/intercomponent.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { PostService } from '../post.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  labMasterRef:AngularFireList<any>;
  categoryData;
  labmaster;
  labMasterObservable :Observable<any>;
  htmlToAdd;
  constructor(public loadingController: LoadingController,private af: AngularFireDatabase, 
    private router: Router, private interComp: IntercomponentService) { }


  ionViewDidEnter() {
    this.labMasterRef = this.af.list('/labs',ref => ref.orderByChild('isActive').equalTo(true));
    
    this.present();
  }
  async present() {
    
    return await this.loadingController.create({
      // duration: 5000,
    }).then(a => {
      a.present().then(() => {
        this.labMasterObservable = this.labMasterRef.snapshotChanges().pipe(map(changes => {
          return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
        }));
       this.labMasterObservable.subscribe((res)=>{       
           this.labmaster = res;
           console.log(res)
           a.dismiss().then(() => console.log('abort presenting'));
    
       });
          });
      });
    
  }

  async dismiss() {
    return await this.loadingController.dismiss().then(() => console.log('dismissed'));
  }

bookNow(list){
  console.log("list",list);
  this.interComp.sendLabList(list);
  this.router.navigate(['/add-appointment'])
 // var paytm_config = require('../../../functions/src/index').paytm_config;


  
    }
   
}



