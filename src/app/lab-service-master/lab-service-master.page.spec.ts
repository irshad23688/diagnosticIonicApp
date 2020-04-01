import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabServiceMasterPage } from './lab-service-master.page';

describe('LabServiceMasterPage', () => {
  let component: LabServiceMasterPage;
  let fixture: ComponentFixture<LabServiceMasterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabServiceMasterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabServiceMasterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
