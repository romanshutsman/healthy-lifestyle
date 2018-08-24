import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';

export class BusinessService {
  businessesChahges = new Subject<any[]>();
  subscribersChahges = new Subject<any[]>();
  subscribersOfInput = new Subject<any[]>();
  selectedBusiness = new Subject<number>();
  selectedPromise = new Subject<Promise<void>>();
  clearForm = new Subject<void>();
  email: string;

  constructor() {
  }
  transferData(e) {
    this.subscribersOfInput.next(e);
  }
  getBussOwner(){
    firebase.database().ref('/bussinesOwner').on('value', function(snap) {
      const bOwn =  snap.val();
      if (bOwn.includes(this.email)) {
        this.bussinesOwner = this.email;
      }
    });
  }
   getBusinesses() {
    this.getAdmins().then((admins: string[]) => {
      if (admins.indexOf(this.email) > -1) {
        firebase.database().ref('/business/')
          .on('value', (snap) => {
            this.businessesChahges.next(snap.val());
          });
        } else {
          firebase.database().ref('/business/').orderByChild('owner').equalTo(this.email)
          .on('value', (snap) => {
            this.businessesChahges.next(snap.val());
          });
      }
    });
  }

  getSubscribers() {
    setTimeout(() => {
      firebase.database().ref('/users/')
        .on('value', (snap) => {
          this.subscribersChahges.next(snap.val());
        });
    }, 0 );
  }

  getAdmins(): Promise<string[]> {
    return firebase.database().ref('/admins/')
      .once('value')
      .then((data) => {
        this.email = localStorage.getItem('email');
        return data.val();
      });
  }
}
