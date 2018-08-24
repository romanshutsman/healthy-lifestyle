import {Component, OnDestroy, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { PasswordValidator } from './password.validator';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  signInForm: FormGroup;
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  errorSubscription: Subscription;
  error: string;
  errorMsg = 'The e-mail or password is invalid!';

  constructor(private router: Router, private auth: AuthService) { }

  ngOnInit() {
    this.initForm();
    this.subscribeOnError();
  }

  onSubmit() {
    const email = this.signInForm.value.email;
    const password = this.signInForm.value.password;
    this.auth.signInUser(email, password);
    localStorage.setItem('email', email);
  }

  subscribeOnError() {
    this.errorSubscription = this.auth.errorMsg.subscribe(
      (error: string) => {
        this.error = error;
      }
    );
  }

  initForm() {
    this.signInForm = new FormGroup({
      'email': new FormControl(null,
        [
          Validators.required,
          Validators.pattern(this.emailPattern),
          Validators.maxLength(150)]),
      'password': new FormControl(null,
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(32),
          PasswordValidator.strong])
    });
  }

  validate() {
    const emptyM = this.signInForm.value.email === '';
    const nullM = this.signInForm.value.email == null;
    const emptyP = this.signInForm.value.password === '';
    const nullP = this.signInForm.value.password == null;
    return emptyM  || emptyP || nullM || nullP;
  }

  ngOnDestroy() {
    this.errorSubscription.unsubscribe();
  }

}
