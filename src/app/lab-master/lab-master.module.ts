import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { LabMasterPage } from './lab-master.page';
import { LabServiceMasterPage } from '../lab-service-master/lab-service-master.page';

const routes: Routes = [
  {
    path: '',
    component: LabMasterPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [LabMasterPage]
})
export class LabMasterPageModule {}
