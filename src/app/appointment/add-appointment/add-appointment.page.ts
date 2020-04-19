import {Component, OnInit }from '@angular/core'; 
import {FormGroup, FormBuilder, Validators }from '@angular/forms'; 
import {AngularFireDatabase, AngularFireList, AngularFireObject }from '@angular/fire/database'; 
import {IntercomponentService }from 'src/app/services/intercomponent.service'; 
import {Router }from '@angular/router'; 
import {WebIntent }from '@ionic-native/web-intent/ngx'; 
import {AngularFireAuth }from '@angular/fire/auth'; 
import {Observable }from 'rxjs'; 
import { GetService } from 'src/app/get.service';
import { Platform } from '@ionic/angular';
import { Configuration } from 'src/assets/config';
declare var RazorpayCheckout:any; 
declare var swal:any; 
@Component( {
  selector:'app-add-appointment', 
  templateUrl:'./add-appointment.page.html', 
  styleUrls:['./add-appointment.page.scss'], 

})
export class AddAppointmentPage implements OnInit {
 
  public minDate:Date = new Date(); 
  addAppointmentForm:FormGroup; 
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
  payId; 
  keyId; 
  currency:string = 'INR'; 
  couponTable;
  couponDetails;
  discountedPrice;
  totalPrice;
  discount;
    // paymentAmount:number = 500; 
  // razor_key = 'rzp_test_VOg9sl36SolYNd'; 
  // dummyTest
  // labList: [];
  // labList = ['Lab1', 'Lab2', 'Lab3']; 
  // services=['x-ray','MRI'];
  constructor(public formBuilder:FormBuilder, private afd:AngularFireDatabase, 
    private webIntent:WebIntent, private af:AngularFireAuth, 
    private config: Configuration, private interComp:IntercomponentService, private route:Router, private getService : GetService, private platform: Platform, private authaf: AngularFireAuth ) {
    this.appointmentDetails = this.afd.list('/bookings'); 
    this.paymentDetails = this.afd.list('/paymentDetails'); 
    this.payeeDetails = this.afd.list('/config'); 
    // this.dummyTest= this.afd.list('/PaymentSuccess')   
  }

  ngOnInit() {
    this.couponDetails=[];
    this.addAppointmentForm = this.formBuilder.group( {
     name:['', Validators.required], 
      mobileNumber:['', Validators.required], 
      gender:['', Validators.required], 
      services:['', Validators.required], 
      appointDate:['', Validators.required], 
      modeOfPayment:['', Validators.required], 
      coupon:['',Validators.required]
    })
    if (this.af.auth.currentUser) {
      this.userId = this.af.auth.currentUser.uid;
      this.afd.object('/users/' + this.userId).valueChanges().subscribe((res: any) => {
        console.log(res.role);
          this.couponTable = this.afd.list('/coupons',ref=>ref.orderByChild("role").equalTo(res.role)).snapshotChanges().subscribe(res=>{
            console.log(res);
            res.forEach(item => {
              let temp = item.payload.val();
              // this.discountedPrice= temp.value;
              console.log('temp', temp)
              temp["$key"] = item.payload.key;
              this.couponDetails.push(temp);
              this.discountedPrice= this.couponDetails[0].value;
              this.discountedPrice= this.discountedPrice/100;
              console.log(this.discountedPrice);
              // console.log("orders-" + JSON.stringify(this.couponDetails));
            });
          })
      });
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
        discountedRate: (this.servicePrice - (this.servicePrice * this.discountedPrice)),
        bookingId:this.bookingId, 
        status:'Booked', 
        pStatus:'Pending', 
        adminStatus:true,
        appointDate:this.formatDate(this.addAppointmentForm.value.appointDate)
      }
      let newAppointDetails = Object.assign(this.addAppointmentForm.value, keyDetails,this.updateDateAndUser())
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
});
}

displayPrice(event) {
  for (let i = 0; i < this.labAppointServList.length; i++) {
    if(this.labAppointServList[i].service!== undefined){
      if (event.target.value === this.labAppointServList[i].service) {
        this.servicePrice = this.labAppointServList[i].price;
        this.servicePrice= parseInt(this.servicePrice);
  }
    }
    
}
  this.totalPrice= this.servicePrice - (this.servicePrice*this.discountedPrice);

  }

reset() {
    this.addAppointmentForm.reset();
  }
cashPaymentJson() {
    let cashJson =  {
        orderId:this.bookingId, 
        adminStatus:true,
        pStatus:'Pending',
        extras:{
          txnId:'', 
          txnRef:'',
          responseCode:'', 
          ApprovalRefNo:'', 
        },        
        modeOfPayment:'Cash', 
        service:this.addAppointmentForm.value.services, 
        amount:this.servicePrice,
    }
    return cashJson; 
  }
upiPaymentJson() {
    let upiJson =  {
      orderId:this.bookingId, 
      modeOfPayment:'UPI', 
      adminStatus:true,
      service:this.addAppointmentForm.value.services, 
      amount:this.servicePrice, 
      // status:'Booked',
      request: {
        txnId:this.transactionId, 
        txnRef:this.userId + this.transactionId, 
        amount:this.servicePrice, 
        currency:'INR', 
        txnName:this.addAppointmentForm.value.services + '' + 'Payment'
      }
  }
  return upiJson; 
  }
  cardPaymentJson() {
    let cardJson =  {
      orderId:this.bookingId, 
      modeOfPayment:'CARD',
      adminStatus:true,
      service:this.addAppointmentForm.value.services, 
      amount:this.servicePrice, 
      // status:'Booked',
      request: {
        txnId:this.transactionId, 
        txnRef:this.userId + this.transactionId, 
        amount:this.servicePrice, 
        currency:'INR', 
        txnName:this.addAppointmentForm.value.services + '' + 'Payment'
      }
  }
  return cardJson; 
  }

onSuccessTxn(status) {
    let paymentSucess = Object.assign(status, this.upiPaymentJson(),this.updateDateAndUser())
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
    if (this.addAppointmentForm.value.modeOfPayment === 'Cash') {
      let cashPayment = Object.assign(this.cashPaymentJson(),this.updateDateAndUser());
      console.log(cashPayment)
        this.paymentDetails.push(cashPayment).then(res =>  {
          swal.fire('You booking is confirmed. Please pay the amount at diagnostic center')
          // console.log('Res',res.key);
          this.checkcndition(this.bookingId).then(res=>{
            this.updateCashDb(res);
            
          });
        this.route.navigate(['/appointment'])
        }, error =>  {
          swal.fire('Something Went Wrong'); 
        })
    }else if (this.addAppointmentForm.value.modeOfPayment === 'Card') {
          this.payWithRazor();
    }else {
      const options =  {
        action:this.webIntent.ACTION_VIEW, 
        url:this.paymentUrl + 'pa=' + this.payeeGateway + '&pn=' + this.payeeName + '&tid=' + this.transactionId + '&tr=' + this.userId + this.transactionId + '&am=' + this.servicePrice + '&cu=INR' + '&tn=' + this.addAppointmentForm.value.services + ' ' + 'Payment' + ' ' + this.bookingId
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
        let paymentFailure= Object.assign(this.paymentRefFailure,this.upiPaymentJson(), this.updateDateAndUser())
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
       this.updateSuccessObj.update({pStatus:reponseStatus, extras:{
        txnId: this.payId
       }
      }).then((res)=>{
        //  alert('Updated')
        });
      //  }
    //  })
  //  })
 }
 updateCashDb(key){
  //  this.dbKey.subscribe(res=>{
  //    let responseData=res;
  //    responseData.forEach(r=>{
  //      if(r.bookingId===this.bookingId){
       this.updateSuccessObj= this.afd.object("/bookings/"+key)
       this.updateSuccessObj.update({extras:{
        txnId:'', 
        txnRef:'',
        responseCode:'', 
        ApprovalRefNo:'', 
      }
      }).then((res)=>{
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


formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}
payWithRazor() {
  var options = {
    // description: 'Credits towards consultation',
    // image: 'https://i.imgur.com/3g7nmJC.png',
    currency: this.currency, // your 3 letter currency code
    key: this.config.secretId, // your Key Id from Razorpay dashboard
    amount: ((this.servicePrice*100) - ((this.servicePrice*100)*this.discountedPrice)), // Payment amount in smallest denomiation e.g. cents for USD
    notes: {
      booking_Id: this.bookingId,
      name: 'Sonigra'
    },
    prefill: {
      // email: 'aqueelshaikh1992@gmail.com ',
      contact: this.addAppointmentForm.value.mobileNumber,
      name: this.addAppointmentForm.value.name
    },
    theme: {
      color: '#F37254'
    },
    modal: {
      ondismiss: function () {
        alert('dismissed')
      }
    }
  };
  var successCallback = (payment_id) => { // <- Here!
    alert('payment_id: ' + payment_id);
    this.successCallback(payment_id);
  };
  
  var cancelCallback = (error) => { // <- Here!
    alert(error.description + ' (Error ' + error.code + ')');
  };
  
  this.platform.ready().then(() => {
    RazorpayCheckout.open(options, successCallback, cancelCallback);
  })
}
successCallback(payment_id) {
  this.payId=payment_id; 
  if(payment_id){
    console.log(payment_id);
    
    this.checkcndition(this.bookingId).then(res=>{
      this.updateDb('SUCCESS',res);
      
    });
    this.cardPayment('SUCCESS');
    this.route.navigate(['/payment-success']);
  }else{
    this.checkcndition(this.bookingId).then(res=>{
      this.updateDb('FAILURE',res);
    });
    this.cardPayment('FAILURE');
    this.route.navigate(['/payment-failure']);
  }
  this.getService.getPaymentDetails(payment_id).subscribe(res=>{
    // this.dummyTest.push(res);
  })
}
cardPayment(status){
  let payStatus={
    status: status
  }
  let paymentSucess = Object.assign(payStatus, this.cardPaymentJson(),this.updateDateAndUser());
  console.log(paymentSucess)
          this.paymentDetails.push(paymentSucess).then(res =>  {
            // this.route.navigate(['/appointment'])
            }, error =>  {
              swal.fire('Something Went Wrong'); 
            })
}

updateDateAndUser(){
 let updateDateUser=
  {
    'createdDate': Date.now(),
    'createdId' : this.userId,
    'updatedDate': Date.now(),
    'updatedId' : this.userId,
    'isActive' :true
  }
  return updateDateUser;

}
couponChange(event){
 this.discount=event.target.value;
}
}
