import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
declare var swal :any;
@Component({
  selector: 'app-labsregister',
  templateUrl: './labsregister.page.html',
  styleUrls: ['./labsregister.page.scss'],
})
export class LabsregisterPage implements OnInit {
  labsignup: FormGroup;
  labsignupdetails:any;
  constructor(public formBuilder: FormBuilder,private afd: AngularFireDatabase,public router : Router) { 
    this.labsignupdetails=this.afd.list('/labsignup')
    }

  ngOnInit() {
    this.labsignup=this.formBuilder.group({
      labname:['',Validators.required],
      email:['',Validators.required],
      address:['',Validators.required],
      addressline1:['',Validators.required],
      city:['',Validators.required],
      state:['',Validators.required],
      pincode:['',Validators.required],
      personname:['',Validators.required],
      mobilenumber:['',Validators.required]
    });
  }
  onSubmit(){  
    this.labsignupdetails.push(this.labsignup.value);
    swal.fire('Data Saved successfully');
    this.labsignup.reset();
    this.router.navigate(['']);
}
onCancel(){  
   this.router.navigate(['']);
}
}
