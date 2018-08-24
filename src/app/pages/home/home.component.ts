import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';

import { BusinessService } from '../../services/business.service';
import { AuthService } from '../../services/auth.service';
import * as firebase from 'firebase';
import {Location} from '@angular/common';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent  implements OnInit, OnDestroy  {
  subscription: Subscription;
  businesses: any = [];
  email: string;
  selectetId: number;
  searchStr = '';
  bussinesOwner = false;
  isAdmin = false;
  businessesiD: any = [];
  blockBtn = false;

  constructor(
    private service: BusinessService,
    private auth: AuthService,
    private router: Router,
    private location: Location) {
    this.email = localStorage.getItem('email');
  }
  
  ngOnInit() {
    this.service.subscribersOfInput.subscribe(data => {
      if (data) {
        this.blockBtn = true;
      } else {
        this.blockBtn = false;
      }
      // if
    });
    // this.getBussOwner();
    if (localStorage.getItem('token') != null) {
      this.subscription = this.service.businessesChahges.subscribe(
        (data: any[]) => {
          if (data) {
            this.handleBusinesses(data);
            // this.service.getBussOwner();
          }
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }
      getBussOwner() {
        firebase.database().ref('/bussinesOwner/')
          .on('value', (snapshot) => {
            this.bussinesOwner = snapshot.val().includes(this.email);
          });
      }
      
      
      handleBusinesses(businesses) {
        this.businesses = [];
        if (businesses) {
          this.longNameBuss(businesses);
          const keys = Object.keys(businesses);
          const values = Object.values(businesses);
     let i = 0;
     for (const key of keys) {
       const business = businesses[key];
       business['bussId'] = i ;
       i = i + 1;
       business['id'] = key;
       this.businesses.push(business);
     }
   }
  }

  async selectedBusiness(id: number, name) {
    if (this.blockBtn) {
      if (confirm('Data is not saved, Continue?')) {
        this.blockBtn = false;
        this.router.navigate(['home/form'])
        .then(
        () => {
          this.selectetId = name['bussId'];
          setTimeout(() => {
            this.service.selectedBusiness.next(name['bussId']);
          }, 200);
        });
      } else {
        this.router.navigate(['/home/form']);
      }
    } else {
      this.router.navigate(['home/form'])
      .then(
      () => {
        this.selectetId = name['bussId'];
        setTimeout(() => {
          this.service.selectedBusiness.next(name['bussId']);
        }, 200);
      });
    }

  }

  addNewBusiness() {
    if (this.blockBtn) {      
      if (confirm('Data is not saved, Continue?')) {
        this.router.navigate(['/home/form']);
        this.service.selectedBusiness.next(null);
        this.service.clearForm.next();
        this.selectetId = null;
        this.blockBtn = false;
      } else {
        this.router.navigate(['/home/form']);
      }
    } else {
      this.router.navigate(['/home/form']);
      this.service.selectedBusiness.next(null);
      this.service.clearForm.next();
      this.selectetId = null;
    }
  }

  userList(e) {
    if (this.blockBtn) {
      if (confirm('Data is not saved, Continue?')) {
        this.router.navigate(['/home/table']);
        this.blockBtn = false;
        this.selectetId = null;
        setTimeout(() => {
          this.service.getSubscribers();
        }, 1);
      } else {
        this.router.navigate(['/home/form']);
      }
    } else {
      this.router.navigate(['/home/table']);
      this.selectetId = null;
      setTimeout(() => {
        this.service.getSubscribers();
      }, 1);
    }
  }

  logOut() {
    this.auth.logOut();
  }
  longNameBuss(businesses) {
    this.businessesiD = [];
    const bus  = Object.values(businesses);
    bus.forEach((element, i) => {
      const lengName = element['name'].length;
      this.businessesiD.push( lengName);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
