import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';
import { IntercomponentService } from 'src/app/services/intercomponent.service';
import { Router } from '@angular/router';
import { WebIntent } from '@ionic-native/web-intent/ngx';

@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.page.html',
  styleUrls: ['./add-appointment.page.scss'],
})
export class AddAppointmentPage implements OnInit {
  addappointment: FormGroup;
  appointmentDetails:any;
  labAppointmentList:any;
  labAppointServList:any;
  appointmentId;
  labName;
  servicePrice;
  // labList: [];
  labList = ['Lab1', 'Lab2', 'Lab3']; 
  services=['x-ray','MRI'];
  constructor(public formBuilder: FormBuilder, private afd: AngularFireDatabase, private webIntent: WebIntent,
    private interComp: IntercomponentService, private route: Router) {
    this.appointmentDetails=this.afd.list('/bookings')
   }

  ngOnInit() {
    this.addappointment=this.formBuilder.group({
     name:['',Validators.required],
      number:['',Validators.required],
      gender:['',Validators.required],
      services:['',Validators.required],
      appointDate:['',Validators.required],
      payment:['',Validators.required],
      
    })     
}

onSubmit(){
      let keyDetails={
        labKey: this.appointmentId,
        labName:this.labName,
        serviceRate:this.servicePrice
      }
      let newAppointDetails= Object.assign(this.addappointment.value,keyDetails)
      console.log(newAppointDetails)
      if(this.addappointment.value.payment==='cash'){
        this.appointmentDetails.push(newAppointDetails).then(res=>{
          this.route.navigate(['/appointment'])
      
          })
      } else{
        const options={
          action:this.webIntent.ACTION_VIEW,
          url:'upi://pay?pa=aqueelshaikh1992@okhdfcbank&pn=irshad&tid=12Abcdef5895&tr=irshad123&am=150&cu=INR&tn=AppPayment'
        }
        this.webIntent.startActivityForResult(options).then(onSuccess=>{
          // this.paymentRefSuccess.push(onSuccess)
        },onError=>{
          // this.paymentRefFailure.push(onError)
      
        })
      }
   
  }
ionViewDidEnter(){
  this.labAppointmentList=[]
    this.interComp.getLabList().subscribe(res=>{
    this.labAppointmentList.push(res);
    this.appointmentId=res.key;
    this.labName=res.labname;
    this.labAppointServList=res.services;
    
})
}
displayPrice(event){
  console.log(event.target.value)
  for(let i=0; i<=this.labAppointServList.length;i++){
      if(event.target.value===this.labAppointServList[i].service){
      this.servicePrice= this.labAppointServList[i].price
}
}
  }
 
}
