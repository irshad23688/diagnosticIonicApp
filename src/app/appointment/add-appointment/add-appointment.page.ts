import {Component, OnInit }from '@angular/core'; 
import {FormGroup, FormBuilder, Validators }from '@angular/forms'; 
import {AngularFireDatabase, AngularFireList, AngularFireObject }from '@angular/fire/database'; 
import {IntercomponentService }from 'src/app/services/intercomponent.service'; 
import {Router }from '@angular/router'; 
import {WebIntent }from '@ionic-native/web-intent/ngx'; 
import {AngularFireAuth }from '@angular/fire/auth'; 
import {Observable }from 'rxjs'; 
import {map }from 'rxjs/operators'; 

declare var swal:any; 
@Component( {
  selector:'app-add-appointment', 
  templateUrl:'./add-appointment.page.html', 
  styleUrls:['./add-appointment.page.scss'], 

})
export class AddAppointmentPage implements OnInit {
  addappointment:FormGroup; 
  appointmentDetails:AngularFireList < any > ; 
  updateSuccessObj:AngularFireObject < any > 
  labAppointmentList:any; 
  labAppointServList:any; 
  appointmentId; 
  labName; 
  servicePrice; 
  transactionId = Math.floor(Math.random() * 90000) + 10000; 
  bookingId = Math.floor(Math.random() * 90000) + 10000; 
  paymentUrl = "upi://pay?";
  paymentDetails; 
  userId; 
  bookingMasterObservable:Observable < any > ; 
  paymentRefSuccess; 
  paymentRefFailure; 
  payeeDetails; 
  payeeList; 
  payeeGateway; 
  payeeName; 
  dbKey; 
  keyId
  // dummyTest
  // labList: [];
  // labList = ['Lab1', 'Lab2', 'Lab3']; 
  // services=['x-ray','MRI'];
  constructor(public formBuilder:FormBuilder, private afd:AngularFireDatabase, private webIntent:WebIntent, private af:AngularFireAuth, 
    private interComp:IntercomponentService, private route:Router, ) {
    this.appointmentDetails = this.afd.list('/bookings'); 
    this.paymentDetails = this.afd.list('/paymentDetails'); 
    this.payeeDetails = this.afd.list('/config'); 
    // this.dummyTest= this.afd.list('/PaymentSuccess')   
  }

  ngOnInit() {
    this.addappointment = this.formBuilder.group( {
     name:['', Validators.required], 
      number:['', Validators.required], 
      gender:['', Validators.required], 
      services:['', Validators.required], 
      appointDate:['', Validators.required], 
      payment:['', Validators.required], 
      
    })
    if (this.af.auth.currentUser) {
      this.userId = this.af.auth.currentUser.uid; 
    }
    this.payeeDetails.valueChanges().subscribe(data =>  {
      this.payeeList = data; 
      this.payeeGateway = this.payeeList[0].upi.gateway, 
      this.payeeName = this.payeeList[0].upi.name
      }); 
      // this.updateSuccessObj= this.afd.object("/bookings/"+'-M3VhOj7sfm49xZyOAGa')
      // this.updateSuccessObj.update({'Jugaad':'Cancel'}).then((res)=>{
      //   console.log('Updated')
      // });
}

onSubmit() {
      let keyDetails =  {
        labKey:this.appointmentId, 
        labName:this.labName, 
        serviceRate:this.servicePrice, 
        bookingId:this.bookingId
      }
      let newAppointDetails = Object.assign(this.addappointment.value, keyDetails)
      console.log(newAppointDetails)
      this.appointmentDetails.push(newAppointDetails).then(res =>  {
      this.paymentMethod(); 
       }); 
  }

ionViewDidEnter() {
  this.labAppointmentList = []
    this.interComp.getLabList().subscribe(res =>  {
    this.labAppointmentList.push(res); 
    this.appointmentId = res.key; 
    this.labName = res.labname; 
    this.labAppointServList = res.services; 
    
})
}
displayPrice(event) {
  for (let i = 0; i <= this.labAppointServList.length; i++) {
      if (event.target.value === this.labAppointServList[i].service) {
      this.servicePrice = this.labAppointServList[i].price
}
}
  }

  cashPaymentJson() {
    let cashJson =  {
        orderId:this.bookingId, 
        Status:'Success', 
        txnId:'', 
        txnRef:'', 
        modeOfPayment:'Cash', 
        responseCode:'', 
        ApprovalRefNo:'', 
        service:this.addappointment.value.services, 
        amount:this.servicePrice

    }
    return cashJson; 
  }
  upiPaymentJson() {
    let upiJson =  {
      orderId:this.bookingId, 
      modeOfPayment:'UPI', 
      service:this.addappointment.value.services, 
      amount:this.servicePrice, 
      request: {
        txnId:this.transactionId, 
        txnRef:this.userId + this.transactionId, 
        amount:this.servicePrice, 
        currency:'INR', 
        txnName:this.addappointment.value.services + '' + 'Payment'
      }
  }
  return upiJson; 
  }

  onSuccessTxn(status) {
    let paymentSucess = Object.assign(status, this.upiPaymentJson())
          this.paymentDetails.push(paymentSucess).then(res =>  {
            // this.route.navigate(['/appointment'])
            }, error =>  {
              swal.fire('Something Went Wrong'); 
            })
  }

  paymentMethod() {
    // this.dbKey = this.appointmentDetails.snapshotChanges().pipe(map(changes =>  {
    //   return changes.map(c => ( {key:c.payload.key, ...c.payload.val()}))
    // })); 
    if (this.addappointment.value.payment === 'cash') {
        this.paymentDetails.push(this.cashPaymentJson()).then(res =>  {
        this.route.navigate(['/appointment'])
        }, error =>  {
          swal.fire('Something Went Wrong'); 
        })
    } else {
      const options =  {
        action:this.webIntent.ACTION_VIEW, 
        url:this.paymentUrl + 'pa=' + this.payeeGateway + '&pn=' + this.payeeName + '&tid=' + this.transactionId + '&tr=' + this.userId + this.transactionId + '&am=' + this.servicePrice + '&cu=INR' + '&tn=' + this.addappointment.value.services + '' + 'Payment'
        // upi://pay?pa=aqueelshaikh1992@okhdfcbank&pn=irshad&tid=12Abcdef5895&tr=irshad123&am=150&cu=INR&tn=AppPayment'
      }
      this.webIntent.startActivityForResult(options).then(onSuccess=>{
        this.paymentRefSuccess=onSuccess;
        this.onSuccessTxn(this.paymentRefSuccess);
        this.checkcndition(this.paymentRefSuccess.orderId).then(res=>{
          if(this.paymentRefSuccess.extras.Status==='SUCCESS'){
            this.updateDb(this.paymentRefSuccess.extras.Status,res);
            this.route.navigate(['/payment-success']);
          } else{
            this.updateDb(this.paymentRefSuccess.extras.Status,res);
            this.route.navigate(['/payment-failure']);
          }
        });
      },onError=>{
        this.paymentRefFailure=onError;
        this.onSuccessTxn(this.paymentRefFailure);
        let paymentFailure= Object.assign(this.paymentRefFailure,this.upiPaymentJson())
        this.paymentDetails.push(paymentFailure).then(res=>{
          this.route.navigate(['/payment-failure']);
          },error=>{
            swal.fire('Something Went Wrong');
          })
      })
    }
  } 
 updateDb(reponseStatus,key){
  //  this.dbKey.subscribe(res=>{
  //    let responseData=res;
  //    responseData.forEach(r=>{
  //      if(r.bookingId===this.bookingId){
       this.updateSuccessObj= this.afd.object("/bookings/"+key)
       this.updateSuccessObj.update({status:reponseStatus}).then((res)=>{
        //  alert('Updated')
        });
      //  }
    //  })
  //  })
 }
 checkcndition(orderid):Promise<any>{
  var ref =this.afd.database.ref("bookings");
  return ref.orderByChild("bookingId").equalTo(orderid)
  .once("value")
  .then(snapshot => {
  var exercises:any;
  snapshot.forEach(snap => {
  exercises=snap.key;
  return false;
  });
  return exercises;
  });
}
}
