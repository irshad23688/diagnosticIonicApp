import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { LabServiceMasterPage } from '../lab-service-master/lab-service-master.page';
import { IntercomponentService } from '../services/intercomponent.service';
import { Router } from '@angular/router';
declare var swal:any;
@Component({
  selector: 'app-lab-master',
  templateUrl: './lab-master.page.html',
  styleUrls: ['./lab-master.page.scss'],
})
export class LabMasterPage implements OnInit {
  serviceList;
  labsignup: FormGroup;
  showPricing= true;
  locationList;
  pushFormData;
  constructor(private afd: AngularFireDatabase, public formBuilder: FormBuilder, 
    public modalController: ModalController, private interComponent: IntercomponentService,
    private router: Router) { }

  ngOnInit() {
    this.pushFormData= this.afd.list('/LabMaster');
    this.afd.list('/services').valueChanges().subscribe(res=>{
      console.log(res);
      this.serviceList=res;
    },error=>{
      console.log(error);
      swal.fire('Something went wrong!');
    })
    this.afd.list('/locations').valueChanges().subscribe(res=>{
      this.locationList=res;
      console.log(res);
    },error=>{
      console.log(error);
        swal.fire('Something went wrong!');
      })

    //console.log(this.serviceList);
    this.labsignup=this.formBuilder.group({
      labname:['',Validators.required],
      email:['',Validators.required],
      address:['',Validators.required],
      city:['',Validators.required],
      state:['',Validators.required],
      pincode:['',Validators.required],
      personname:['',Validators.required],
      mobilenumber:['',Validators.required],
      // price:['',Validators.required],
      // service:['',Validators.required],
      area:['',Validators.required]
    })
  }
  reset(){
    this.labsignup.reset();
    this.showPricing=true;
  }
  openPrice(e){
    console.log(e);
    this.showPricing=false;
  }
  onSubmit(){
    console.log("hello",this.labsignup.value);

    if(this.labsignup.invalid){
      return;
    }
    this.interComponent.sendMessage(this.labsignup.value);
    this.router.navigate(['/lab-service-master']);
    //this.presentModal();

    // this.pushFormData.push(this.labsignup.value).subscribe(res=>{
    //   this.labsignup.reset();
    // },error=>{
    //   swal.fire('Something went wrong!');
    // })
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: LabServiceMasterPage
    });
    return await modal.present();
  }
  ionViewWillEnter(){
    console.log('ionViewWillEnter')
    this.interComponent.getMessage().subscribe(res=>{
      console.log(res);
    })
  }
 
}
