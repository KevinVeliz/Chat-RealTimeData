// dashboard.page.ts
import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController } from '@ionic/angular';
import { AuthenticateService } from '../services/authentication.service';
import { FirebaseService } from '../services/firebase.service'
import * as crypto from 'crypto-js';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  userID: string;
  userEmail: string;
  message: string;
  chats: any = [];
  tmpImage: any = undefined;
  encryptKey: string = "*/*-$%^@!@#";

  imageId = Math.floor(Math.random() * 500);


  constructor(
    private navCtrl: NavController,
    private authService: AuthenticateService,
    private firebaseServ: FirebaseService,
  ) { }

  ngOnInit() {

    this.authService.userDetails().subscribe(res => {
      console.log('res', res);
      if (res !== null) {
        this.userID = res.uid;
        this.userEmail = res.email;
      } else {
        this.navCtrl.navigateBack('');
      }
    }, err => {
      console.log('err', err);
    })
    this.firebaseServ.getMessage().on('value', (messageSnap) => {
      this.chats = [];
      messageSnap.forEach((messageData) => {
        console.log('messageData', messageData.val());
        if (messageData.val().imageMessage) {
          this.chats.push({
            email: messageData.val().email,
            imageMessage: messageData.val().message,
            uid: messageData.val().uid,
          });
        } else {
          this.chats.push({
            email: messageData.val().email,
            message: messageData.val().message,
            uid: messageData.val().uid,
          });
        }
      })
    });
  }


  logout() {
    this.authService.logoutUser()
      .then(res => {
        console.log(res);
        this.navCtrl.navigateBack('');
      })
      .catch(error => {
        console.log(error);
      })
  }

  async sendMessage() {
    let messageToSend = {};
    if (this.tmpImage !== undefined) {
      messageToSend = {
        uid: this.userID,
        email: this.userEmail,
      };
      this.tmpImage = undefined;
    } else {
      messageToSend = {
        uid: this.userID,
        email: this.userEmail,
        message: this.message
      };
    }
    try {
      await this.firebaseServ.sendMessage(messageToSend);
      this.message = '';
    } catch (e) {
      console.log('error', e);
    }
  }

 


}
