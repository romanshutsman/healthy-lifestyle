import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  ngOnInit() {

    // Production



    // HLS-staging
    const config = {
      apiKey: 'AIzaSyBAHA6fagfQ8KTXH4PVu60r1PHIta0Yf_k',
      authDomain: 'hls-staging-5020c.firebaseapp.com',
      databaseURL: 'https://hls-staging-5020c.firebaseio.com',
      projectId: 'hls-staging-5020c',
      storageBucket: 'hls-staging-5020c.appspot.com',
      messagingSenderId: '685365863987'
    };

    firebase.initializeApp(config);
  }
}
