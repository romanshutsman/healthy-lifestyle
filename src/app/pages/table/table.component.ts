import { Component, OnDestroy, OnInit } from '@angular/core';
import { BusinessService } from '../../services/business.service';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from './interface.user';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})


export class TableComponent implements OnInit, OnDestroy {
  term: number;
  subscribers: User[] = [];
  subscription: Subscription;

  constructor(
    private service: BusinessService,
    private auth: AuthService,
    private router: Router) { }

  ngOnInit() {
    if (localStorage.getItem('token') != null) {
      this.service.getBusinesses();
      this.getSubscribers();
    } else {
      this.router.navigate(['/login']);
    }
  }

  getSubscribers() {
    this.service.getSubscribers();
    this.subscription = this.service.subscribersChahges.subscribe(
      (subscribers: User[]) => {
        if (subscribers) {
          this.handleSubscribers(subscribers);
        }
      }
    );
  }

  handleSubscribers(subscribers: User[]) {
    this.subscribers = [];
    const keys = Object.keys(subscribers);
    for (const key of keys) {
      if (subscribers[key].subscription) {
        const data: User = {
          name: subscribers[key].name,
          phone: subscribers[key].phone,
          subscription_from: new Date(subscribers[key].subscription.buyTimestamp),
          subscription_to: new Date(subscribers[key].subscription.expirationTimestamp),
          type: subscribers[key].subscription.type
        };
        this.subscribers.push(data);
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
