import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { IntercomponentService } from '../services/intercomponent.service';
import { Router } from '@angular/router';
declare var swal:any;

@Component({
  selector: 'app-lab-service-master',
  templateUrl: './lab-service-master.page.html',
  styleUrls: ['./lab-service-master.page.scss'],
})
export class LabServiceMasterPage implements OnInit {
  public anArray:any=[];
  serviceList;
  serviceMasterForm:FormGroup;
  services: FormArray;
  responseInterComp;
  labMaster;
  constructor(private afd: AngularFireDatabase, private fb: FormBuilder, 
              private interComponent: IntercomponentService, private route:Router) { }

  ngOnInit() {
    this.labMaster=this.afd.list('/labs')
    this.afd.list('/services').valueChanges().subscribe(res=>{
      this.serviceList=res;
    },error=>{
      swal.fire('Something went wrong!');
    })  
    this.serviceMasterForm=this.fb.group({
      services: this.fb.array([ this.createItem() ])
    })

  }
  createItem(): FormGroup {
    return this.fb.group({
      service:['', Validators.required],
      price:['',Validators.required]
    });
  }
  goTo(){
    console.log('this.anArray',this.anArray);
    // this.data=true;
    }
  addItem(){
    this.services = this.serviceMasterForm.get('services') as FormArray;
    this.services.push(this.createItem());
  }
  submitForm(){
   
    if(!this.serviceMasterForm.valid){
      return
    }
    // console.log(Object.assign(this.serviceMasterForm.value,this.responseInterComp));
    let formData=Object.assign(this.serviceMasterForm.value,this.responseInterComp);
    this.labMaster.push(formData).then(res=>{ 
      swal.fire('Saved successfully!');
      this.route.navigate(['/home']);
      this.serviceMasterForm.reset();
    },error=>{
      swal.fire('Something Went Wrong!');
    })
    // this.interComponent.sendMessage(this.serviceMasterForm.value);
  }
   removeItem(index) {
    (this.serviceMasterForm.get('services') as FormArray).removeAt(index);
  }
  backBtn(){
    console.log('cancel Btn')
    this.route.navigate(['/home']);
   
  }
  ionViewWillEnter(){
    console.log('ionViewWillEnter')
    this.interComponent.getMessage().subscribe(res=>{
      this.responseInterComp=res;
      console.log("check",res);
    })
  }
}
