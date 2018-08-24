import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import * as firebase from 'firebase';

@Injectable()
export class AuthService {
  token: string;
  errorMsg = new Subject<string>();

  constructor(private router: Router) {
  }

  signInUser(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(
        () => {
          this.router.navigate(['/home']);
          firebase.auth().currentUser.getToken()
            .then(
              (token: string) => {
                this.token = token;
                localStorage.setItem('token', this.token);
              }
            );
        }
      )
      .catch(
        (error) => {
          this.errorMsg.next(error.message);
        }
      );

  }

  getToken() {
    firebase.auth().currentUser.getIdToken()
      .then(
        (token: string) => {
          this.token = token;
          console.log(token);
        }
      );
    return this.token;
  }

  isAuthentacated() {
    return this.token != null;
  }

  logOut() {
    this.router.navigate(['/login']);
    firebase.auth().signOut();
    this.token = null;
    localStorage.clear();
  }
}
