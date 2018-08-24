import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import {} from '@types/googlemaps';
import * as firebase from 'firebase';

import { BusinessService } from '../../services/business.service';
import { CoordinatesService } from '../../services/coordinates.service';
import { TimeValidator } from './time.validator';
import { Business } from './business.interface';
import { HomeComponent } from './../home/home.component';
import { SortEvent } from './../../draggable/sortable-list.directive';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnDestroy {
  @ViewChild('check') check: ElementRef;
  days: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];
  discounts: string[] = [
    'standart',
    'double',
    'premium'
  ];
  images: any = [];
  imgArray: any = [];
  imagesTemp: any = [];
  businesses: Business[];
  selectedBusiness: Business;
  businessForm: FormGroup;
  subscBusinesses: Subscription;
  subscSelectedBusiness: Subscription;
  subscClrForm: Subscription;
  selectedId: number;
  categories: any = [];
  dataKey: string;
  lat: number;
  lng: number;
  email: string;
  currentId: number;
  isAdmin = false;
  location;
  showBtn = true;

  selectedValueFrom = [];
  selectedValueTo = [];
  trappedBoxes = ['Trapped 1', 'Trapped 2'];
  imgDragDrop = [];

  sortableList = [];
  sortableList1 = [1];
  sortableList2 = [1, 2];
  sortableList3 = [1, 2, 3];
  sortableList4 = [1, 2, 3, 4];


  constructor(private service: BusinessService,
              public geocode: CoordinatesService,
              private router: Router, 
              public home: HomeComponent) {
    this.initForm();
    this.email = localStorage.getItem('email');
    this.getAllBusiness();
  }

  ngOnInit() {
    // this.updateFormatHours();
    this.getAdmins();
    if (localStorage.getItem('token') != null) {
      this.service.getBusinesses();
      this.subscriptions();
      this.getCategories();
    } else {
      this.router.navigate(['/login']);
    }
    this.service.getBusinesses();
  }

  checkName(event) {
    this.service.subscribersOfInput.next(event);
  }
  checkCategory(event) {
    this.service.transferData(event);
  }
  checkAddress(event) {
    this.service.transferData(event);
  }
  checkPhone(event) {
    this.service.transferData(event);
  }
  checkWebsite(event) {
    this.service.transferData(event);
  }
  checkSchedule(event) {
    this.service.transferData(event);
  }
  checkPremiumDiscount(event) {
    this.service.transferData(event);
  }
  checkDiscountPercent(event) {
    this.service.transferData(event);
  }
  checkOwner(event) {
    // this.service.transferData(event);
  }
  onSearchChange(hours, num, j) {
    const from = 'hours_from' + j;
    const to = 'hours_to' + j;
    if (num == 1) {
      this.selectedValueFrom[j] = 'am';
    }
    if (num == 2) {
      this.selectedValueTo[j] = 'pm';
    }
  }
  updateFormatHours() {
    firebase.database().ref('/business').once('value', function(snap) {
      const data = snap.val();
      const keys = Object.keys(snap.val());
      for (let i = 0; i < keys.length; i++) {
        const upId = {id: i};
        const element = keys[i];
        firebase.database().ref('/business/' + element + '/schedule').once('value', function(sn) {
          const schedule = Object.values(sn.val());
          // console.log(schedule);
          for (let j = 0; j < schedule.length; j++) {
            const el = schedule[j];
            if (el['from']) {
                // console.log(el);
              const sch = { from_h: 'am', to_h: 'pm'};
                firebase.database().ref('/business/' + element + '/schedule/' + j ).update(sch);
            }
          }
        });
      }
    });
  }

  getAdmins() {
    firebase.database().ref('/admins/')
      .on('value', (snapshot) => {
        this.isAdmin = snapshot.val().includes(this.email);
        // this.currentId = Object.keys(snapshot.val()).length;
      });
  }

  subscriptions() {
    this.subscBusinesses = this.service.businessesChahges.subscribe(
      (businesses: Business[]) => {
        this.handleBusinesses(businesses);
      });
      this.subscSelectedBusiness = this.service.selectedBusiness.subscribe(
        (index: number | null) => {
          this.service.selectedPromise.next();
          this.selectedId = index;
          // console.log(this.businesses);
          // console.log(index);
          // console.log(this.businesses[index]);

          if (index != null) {
            this.selectedBusiness = this.businesses[index];
            if (this.selectedId != null || this.businesses[index] != null) {
              this.fillForm(this.selectedBusiness);
              this.getImages(this.selectedBusiness);
              this.showBtn = true;
            }
          }
        }
      );
    this.subscClrForm = this.service.clearForm.subscribe(
      () => {
        this.clearForm();
        this.images = [];
        this.imgArray = [];
      }
    );
    this.images = [];
    this.imgArray = [];
  }

  onSubmit() {
    const data = this.validateFields();
    if (this.location) {
      data['address'] = this.location;
      // console.log(this.location);
    }
    this.setOwner(data);
    // const location = this.gejtAddressOnChange();
    if (this.selectedId != null) {
      // console.log(1);
      firebase.database().ref('/business/' + this.selectedBusiness['id']).update(data).then(() => {
        this.putImgToDataStorage();
        this.getGeocordinates(null);
        setTimeout(() => {
          if (!this.showBtn) {
            this.setChangeLocationPhoto();
          }
        }, 500);
        alert('Successfully updated!');
      })
      .then(() => {
        this.location = '';
      });
      this.service.getBusinesses();
    } else {
      // console.log(2);
      this.dataKey = firebase.database().ref('/business/').push().key;
      firebase.database().ref('/business/' + this.dataKey).update(data).then(() => {
        this.putImgToDataStorage();
        this.getGeocordinates(this.dataKey);
        this.setId(this.dataKey);
      }).then(() => {
        this.clearForm();
        this.images = [];
        this.imgArray = [];
        this.location = '';
        alert('Successfully created!');
      });
    }
  }
  setOwner(data) {
    firebase.database().ref('/bussinesOwner').once('value', function(snap) {
      const owners =  snap.val();
       const arrOfKey = Object.keys(owners);
       const arrLen = arrOfKey.length;
       const lastOfArr = arrOfKey[arrLen - 1];
       const id = +lastOfArr + 1;
       const ownObj = {};
       ownObj[id] = data.owner;
      //  console.log(data.owner);
       firebase.database().ref('/admins').once('value', function(snapshot) {
         const admins =  snapshot.val();
        //  console.log(admins);
        //  console.log(owners.includes(data.owner))
         if (admins.includes(data.owner)) {
          //  console.log('it is superadmin');
          } else {
            // console.log('it is just admin');
            if (!owners.includes(data.owner)) {
              firebase.database().ref('/bussinesOwner').update(ownObj);
            }
         }
       });
     });
  }
  setId(key) {
    const milisec = +new Date();
    const data = new Object();
    firebase.database().ref('/constants/lastBusinessId').once('value', function (snap) {
      const id = snap.val();
      const incrementId = id + 1;
      data['id'] = id + milisec;
      const inc = {lastBusinessId: incrementId};
      firebase.database().ref('/business/' + key).update(data);
      firebase.database().ref('/constants').update(inc);
    });
  }
  updateId() {
    firebase.database().ref('/business').once('value', function(snap) {
      const data = snap.val();
      const keys = Object.keys(snap.val());
      for (let i = 0; i < keys.length; i++) {
        const upId = {id: i};
        const element = keys[i];
        
        firebase.database().ref('/business/' + element).once('value', function(sn) {
          // console.log(sn.val());
        //   firebase.database().ref('/business/' + element).update(upId);
        });
        // console.log(element);
      }
    });
  }

  getLocation(address) {
    // console.log(address);
  }
  getAddressOnChange(event) {
    // console.log(event.formatted_address);
    this.location = event.formatted_address;
    return event.formatted_address;
  }
  onDelete() {
   if (confirm('Would you like to delete business ' + this.selectedBusiness.name + ' ?')) {
      setTimeout(() => {
        firebase.database().ref('/business/' + this.selectedBusiness.key + '/photos').once('value', function (snap) {
          // console.log(Object.values(snap.val()));
          Object.values(snap.val()).forEach(element => {
            let str = '';
            const substringProd = 'https://firebasestorage.googleapis.com/v0/b/hls-prod-54695';
            if (element.includes(substringProd)) {
              str = element.replace('formImages%2F', '?formImages=');
              str = str.replace('?alt', '&alt');
              // console.log(str);
              const name = 'formImages'.replace(/[\[\]]/g, '\\$&');
              let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
              let results = regex.exec(str);
              if (!results) {
                return null;
              }
              if (!results[2]) {
                return '';
              }
              const photoId = decodeURIComponent(results[2].replace(/\+/g, ''));
              // console.log(photoId);
              firebase.storage().ref().child('formImages/' + photoId).delete().then(function () {
                // console.log('successfully');
              }).catch(function (error) {
                // console.log(error);
              });
            }
            // console.log(element);
          });
        });
        firebase.database().ref('/business/' + this.selectedBusiness.key).remove();
      }, 1000);
      setTimeout(() => {
        // console.log(this.selectedBusiness.key);
        this.home.addNewBusiness();
      }, 1001);
    }
  }

  handleBusinesses(businesses) {
    this.businesses = [];
    if (businesses) {
      const keys = Object.keys(businesses);
      for (const key of keys) {
        const business = businesses[key];
        business['key'] = key;
        this.businesses.push(business);
      }
    }
  }

  validateFields() {
    const data = this.businessForm.value;
    data.schedule = this.schedule(data);
    // if (!this.selectedBusiness) {
      // data['id'] = this.currentId;
    // }
    if (!data.owner) {
      data['owner'] = this.email;
    }
    const obj = {};
    if (!data.webSite) {
      data['webSite'] = '';
    }
    if (!data.discountPercent) {
      data['discountPercent'] = 0;
    }
    if (!data.premiumDiscount.standart) {
      this.businessForm.value['premiumDiscount'].forEach((a, i) => {
        const key = this.discounts[i];
        obj[key] = a.percent;
      });
      delete data.premiumDiscount;
      data.premiumDiscount = obj;
    }
    return data;
  }

  validatePhoneNumber(el) {
    const str = el.value;
    if (el.value.length > 5 && str.charAt(0) !== '+') {
      el.value = '+' + el.value;
    }
    if (el.value.length !== 0) {
      el.value = '+' + el.value.replace(/\D/g, '');
    } else {
      el.value = el.value;
    }

  }

  getGeocordinates(key) {
    this.geocode.getLatLan(this.businessForm.value.address).subscribe(
      (result) => {
        const data = new Object();
        if (result) {
          data['lat'] = result.lat();
          data['lng'] = result.lng();
        }
        this.setCoordinates(data, key);
      });
  }

  setCoordinates(data, key) {
    const lat = data.lat;
    const lng = data.lng;
    const res = {lng, lat};
    if (this.selectedId != null) {
      firebase.database().ref('/business/' + this.selectedBusiness['id']).update(res);
    } else if (key) {
      firebase.database().ref('/business/' + key).update(res);
    }
  }


  putImgToDataStorage() {
    let photoUrl = [];
    const pictures = this.imagesTemp.slice();
    this.imagesTemp = [];
    const datePhoto = [];
    console.log(pictures);
    pictures.forEach((img, i) => {
      if (img.file) {
        const date = new Date().getTime();
        const number = Math.random();
        const number17 = number * 100000000000000000;
        const numberStr = number17.toString();
        const num13 = numberStr.substring(0, 13);
        const namePhoto = +num13 + 1530870672397;
        let namePhoto13 =  namePhoto.toString();
        namePhoto13 =  namePhoto13.substring(0, 13);

        const ref = firebase.storage().ref().child('formImages/' + namePhoto13).put(img.file);
        ref.on('state_changed', () => {
        }, (error) => {
        }, () => {
          const downloadURL = ref.snapshot.downloadURL;
          this.imagesTemp.splice(i, 1);
          photoUrl.push(downloadURL);
          if (pictures.length == photoUrl.length) {
            let dataUpdate = {};
            if ((this.selectedId != null)) {
              firebase.database().ref('/business/' + this.selectedBusiness['id'] + '/photos/').once('value', (snap) => {
                const snapshot = snap.val();
                if (snapshot) {
                  firebase.database().ref('/business/' + this.selectedBusiness['id'] + '/photos/').once('value', (snapsh) => {
                    const data = snapsh.val();
                    let addNewPhoto = [];
                    let oldPhoto;
                    oldPhoto = Object.values(data);
                    addNewPhoto = oldPhoto.concat(photoUrl);
                    addNewPhoto = Array.from(new Set(addNewPhoto));
                    if (addNewPhoto.length == 4) {
                      dataUpdate = {
                        '0a': addNewPhoto[0],
                        '1a': addNewPhoto[1],
                        '2a': addNewPhoto[2],
                        '3a': addNewPhoto[3],
                      };
                    } else if (addNewPhoto.length == 3) {
                        dataUpdate = {
                          '0a': addNewPhoto[0],
                          '1a': addNewPhoto[1],
                          '2a': addNewPhoto[2]
                        };
                    } else if (addNewPhoto.length == 2) {
                        dataUpdate = {
                          '0a': addNewPhoto[0],
                          '1a': addNewPhoto[1]
                        };
                    } else if (addNewPhoto.length == 1) {
                      dataUpdate = {
                        '0a': addNewPhoto[0]
                      };
                    }
                    firebase.database().ref('/business/' + this.selectedBusiness['id'] + '/photos/').set(dataUpdate)
                    .then(() => {
                      this.imagesTemp = [];
                      alert('Successfully photo uploaded!');
                    });
                  });
                } else {
                  if (photoUrl.length == 4) {
                    dataUpdate = {
                      '0a': photoUrl[0],
                      '1a': photoUrl[1],
                      '2a': photoUrl[2],
                      '3a': photoUrl[3],
                    };
                  } else if (photoUrl.length == 3) {
                      dataUpdate = {
                        '0a': photoUrl[0],
                        '1a': photoUrl[1],
                        '2a': photoUrl[2]
                      };
                  } else if (photoUrl.length == 2) {
                      dataUpdate = {
                        '0a': photoUrl[0],
                        '1a': photoUrl[1]
                      };
                  } else if (photoUrl.length == 1) {
                    dataUpdate = {
                      '0a': photoUrl[0]
                    };
                  }
                  firebase.database().ref('/business/' + this.selectedBusiness['id'] + '/photos/').update(dataUpdate)
                  .then(() => {
                    this.imagesTemp = [];
                    alert('Successfully photo uploaded!');
                  });
                }
                });
              } else {
                // console.log(photoUrl);
                photoUrl = Array.from(new Set(photoUrl));
                // console.log(photoUrl);
                if (photoUrl.length == 4) {
                  dataUpdate = {
                    '0a': photoUrl[0],
                    '1a': photoUrl[1],
                    '2a': photoUrl[2],
                    '3a': photoUrl[3],
                  };
                } else if (photoUrl.length == 3) {
                    dataUpdate = {
                      '0a': photoUrl[0],
                      '1a': photoUrl[1],
                      '2a': photoUrl[2]
                    };
                } else if (photoUrl.length == 2) {
                    dataUpdate = {
                      '0a': photoUrl[0],
                      '1a': photoUrl[1]
                    };
                } else if (photoUrl.length == 1) {
                  dataUpdate = {
                    '0a': photoUrl[0]
                  };
                }
                  firebase.database().ref('/business/' + this.dataKey + '/photos/').set(dataUpdate)
                  .then(() => {
                    this.imagesTemp = [];
                    alert('Successfully photo uploaded!');
                  });

              }

          }
        });
      }
    });
  }
  setChangeLocationPhoto () {
    let dataUpdate = {};
    const locationPhoto = [];
    const keyPhoto = [];
    // console.log(this.images);
    // console.log(this.imgArray);
    this.images.forEach(element => {
      locationPhoto.push(element.url);
      keyPhoto.push(element.key);
    });
    // console.log(locationPhoto);
    // console.log(keyPhoto);
    if (locationPhoto.length == 4) {
      dataUpdate = {
        '0a': locationPhoto[0],
        '1a': locationPhoto[1],
        '2a': locationPhoto[2],
        '3a': locationPhoto[3],
      };
    } else if (locationPhoto.length == 3) {
        dataUpdate = {
          '0a': locationPhoto[0],
          '1a': locationPhoto[1],
          '2a': locationPhoto[2]
        };
    } else if (locationPhoto.length == 2) {
        dataUpdate = {
          '0a': locationPhoto[0],
          '1a': locationPhoto[1]
        };
    } else if (locationPhoto.length == 1) {
      dataUpdate = {
        '0a': locationPhoto[0]
      };
    }
    // console.log(dataUpdate);
    firebase.database().ref('/business/' + this.selectedBusiness['id'] + '/photos/').set(dataUpdate)
    .then(() => {
      this.imagesTemp = [];
      // console.log('Success!!!');
    });
  }
  createOrUpdateBussiness (data) {
    if (this.selectedId != null) {
      firebase.database().ref('/business/' + this.selectedBusiness['id'] + '/photos/').remove();
      firebase.database().ref('/business/' + this.selectedBusiness['id'] + '/photos').update(data)
      .then(() => {
        // console.log('SUCCESS  update photo');
      });
    } else {
      firebase.database().ref('/business/' + this.dataKey + '/photos/').remove();
      firebase.database().ref('/business/' + this.dataKey + '/photos').update(data)
      .then(() => {
        // console.log('SUCCESS  update photo');
      });
    }
  }

  clearForm() {
    this.businessForm.reset({owner: this.email});
    this.check.nativeElement.checked = false;
    this.images = [];
  }

  getCategories() {
    firebase.database().ref('/constants/businessTypes/')
      .on('value', (snapshot) => {
        this.categories = snapshot.val();
      });
  }

  schedule(data) {
    const schedule: any = [];
    for (const day of data.schedule) {
      if ((day.from || day.to) == null ) {
        day.from = null;
        day.to = null;
      } else {
        day.from = (+day.from).toFixed(2);
        day.to = (+day.to).toFixed(2);
      }
      if ( (day.from_h || day.to_h) == null) {
        day.from_h = null;
        day.to_h = null;
        if ((day.from || day.to) != null) {
          day.from_h = "am"
          day.to_h = "pm"
        }
      } else {
        day.from_h =  day.from_h;
        day.to_h = day.to_h;
        if (!day.from_h) {
          day.from_h = "am"
        }
        if (!day.to_h) {
          day.to_h = "pm"
        }
      }

      if (day.isOpen == null) {
        day.isOpen = false;
      }
      schedule.push(day);
    }
    return schedule;
  }

  premiumDiscount(data) {
    const discount: any = [];
    for (const d of Object.keys(data.premiumDiscount)) {
      discount.push({percent: data.premiumDiscount[d]});
    }
    discount.sort((a, b) => {
      return a.percent - b.percent;
    });
    return discount;
  }

  checkFreeDiscount() {
    if (!this.check.nativeElement.checked) {
      this.businessForm.controls['discountPercent'].reset(null);
      this.businessForm.get('discountPercent').setValidators(null);
      this.businessForm.get('discountPercent').updateValueAndValidity();
    } else {
      this.businessForm.get('discountPercent').setValidators([Validators.required, Validators.min(1), Validators.max(99)]);
      this.businessForm.get('discountPercent').updateValueAndValidity();
    }
  }

  getImages(data) {
    this.images = [];
    this.imgArray = [];
    // console.log(data.photos);
    if (data.photos) {
      for (const key of Object.keys(data.photos)) {
        this.images.push({url: data.photos[key], key: key});
        this.imgArray.push({url: data.photos[key], key: key});
      }
    }
  }

  getAllBusiness() {
    firebase.database().ref('/business/')
      .on('value', (snapshot) => {
        if (snapshot.val()) {
        this.currentId = Object.keys(snapshot.val()).length;
        }
      });
  }

  fillForm(data) {
    const discount = this.premiumDiscount(data);
    const schedule = this.schedule(data);

    if (data.discountPercent || data.discountPercent != 0) {
      this.check.nativeElement.checked = true;
    }
    // console.log(data.phone.replace(/\D/g,''));
    const form = {
      address: data.address,
      type: data.type,
      description: data.description,
      discountPercent: data.discountPercent,
      name: data.name,
      phone: '+' + data.phone.replace(/\D/g, ''),
      webSite: data.webSite,
      premiumDiscount: discount,
      schedule: schedule,
      owner: data.owner
    };
    this.businessForm.patchValue(form);

  }

  onDiscountType(event) {
    event.target.value = event.target.value.replace(/\D/gi, '');
  }

  initScheduleFormArray() {
    const schedule = new FormArray([]);
    if (this.selectedBusiness) {
      for (const i of this.selectedBusiness.schedule) {
        schedule.push(
          new FormGroup({
            'isOpen': new FormControl(i.isOpen),
            'from': new FormControl(i.from, [TimeValidator.validate]),
            'from_h': new FormControl(i.from_h),
            'to': new FormControl(i.to, [TimeValidator.validate]),
            'to_h': new FormControl(i.to_h)
          })
        );
      }
    } else {
      for (const i of this.days) {
        schedule.push(
          new FormGroup({
            'isOpen': new FormControl(false),
            'from': new FormControl(null, TimeValidator.validate),
            'from_h': new FormControl('am'),
            'to': new FormControl(null, TimeValidator.validate),
            'to_h': new FormControl('pm')
          })
        );
      }
    }
    return schedule;
  }

  initPremiumDiscountFormArray() {
    const premiumDiscount = new FormArray([]);
    if (this.selectedBusiness) {
      for (const i of Object.keys(this.selectedBusiness.premiumDiscount)) {
        const index = i[0];
        premiumDiscount.push(
          new FormGroup({
            'percent': new FormControl(i[index], [Validators.required, Validators.min(0), Validators.max(99)])
          })
        );
      }
    } else {
      for (const i of this.discounts) {
        premiumDiscount.push(
          new FormGroup({
            'percent': new FormControl(null, [Validators.required, Validators.min(0), Validators.max(99)])
          })
        );
      }
    }
    return premiumDiscount;
  }

  initForm() {
    const schedule = this.initScheduleFormArray();
    const premiumDiscount = this.initPremiumDiscountFormArray();

    this.businessForm = new FormGroup({
      'name': new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      'type': new FormControl(null, Validators.required),
      'address': new FormControl(null, [Validators.required, Validators.maxLength(250)]),
      'phone': new FormControl(null,
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(15)]
      ),
      'webSite': new FormControl(null, Validators.maxLength(1000)),
      'schedule': schedule,
      'premiumDiscount': premiumDiscount,
      'discountPercent': new FormControl(null, [Validators.min(0), Validators.max(99)]),
      'description': new FormControl(null, [Validators.required, Validators.maxLength(1500)]),
      'owner': new FormControl(null, [Validators.email, Validators.maxLength(150)]) 
    });
  }

  onAddImg(event) {
    // console.log(event.target.files);
    // console.log(event.target.files[0]);
    const file = event.srcElement.files;
    if (this.images.length < 4) {
      if (file[0]) {
        if (file[0].size <= 2228571) {
          if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
              const url = event.target.result;
              this.imagesTemp.push({url: url, file: file[0]});
              this.images.push({url: url});
              // console.log(this.images);
              // console.log(this.imagesTemp);
            };
            reader.readAsDataURL(event.target.files[0]);
          }
        } else {
          alert('File size must be less than 2MB.');
        }
      }
    }
  }
  
  
  onDeleteImg(index: number, key: string) {
    // console.log(this.images);
    // console.log(this.imagesTemp);
    this.images.splice(index, 1);
    this.imagesTemp.splice(index, 1);
    // console.log(this.images);
    // console.log(this.imagesTemp);
    if (key) {
      this.imgArray.splice(index, 1);
      if (confirm('Are you sure? (it remove photo without saving)')) {
        firebase.database().ref('/business/' + this.selectedBusiness.key + '/photos/' + key).once('value').then(function (snapshot) {
          const urlPhoto = snapshot.val();
          let str = urlPhoto.replace('formImages%2F', '?formImages=');
          str = str.replace('?alt', '&alt');
          const name = 'formImages'.replace(/[\[\]]/g, '\\$&');
          let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
          let results = regex.exec(str);
          if (!results) {
            return null;
          }
          if (!results[2]) {
            return '';
          }
          const photoId = decodeURIComponent(results[2].replace(/\+/g, ''));
          // console.log(photoId);
          firebase.storage().ref().child('formImages/' + photoId).delete().then(function () {
            // console.log('successfully');
          }).catch(function (error) {
            // console.log(error);
          });
        });
        firebase.database().ref('/business/' + this.selectedBusiness.key + '/photos/' + key).remove();
      }
    } else {
      // console.log(this.imgArray);
      this.imgArray.splice(index, 1);
      // console.log(this.imgArray);

      // console.log(this.images);
      // this.images.splice(index, 1);
      // console.log(this.images);
    }
  }

  getDiscount(): any {
    return <FormArray>this.businessForm.get('premiumDiscount');
  }

  getSchedule(): any {
    return <FormArray>this.businessForm.get('schedule');
  }
  add(): void {
    this.trappedBoxes.push('New trapped');
  }

  sort(event: SortEvent) {
    // console.log(event);
    const current = this.images[event.currentIndex];
    const swapWith = this.images[event.newIndex];
    this.images[event.newIndex] = current;
    this.images[event.currentIndex] = swapWith;
    // console.log(this.images);
  }
  sort1(event: SortEvent) {
    const current = this.sortableList1[event.currentIndex];
    const swapWith = this.sortableList1[event.newIndex];
    this.sortableList1[event.newIndex] = current;
    this.sortableList1[event.currentIndex] = swapWith;
  }
  sort2(event: SortEvent) {
    const current = this.sortableList2[event.currentIndex];
    const swapWith = this.sortableList2[event.newIndex];
    this.sortableList2[event.newIndex] = current;
    this.sortableList2[event.currentIndex] = swapWith;
  }
  sort3(event: SortEvent) {
    const current = this.sortableList3[event.currentIndex];
    const swapWith = this.sortableList3[event.newIndex];
    this.sortableList3[event.newIndex] = current;
    this.sortableList3[event.currentIndex] = swapWith;
  }
  sort4(event: SortEvent) {
    const current = this.sortableList4[event.currentIndex];
    const swapWith = this.sortableList4[event.newIndex];
    this.sortableList4[event.newIndex] = current;
    this.sortableList4[event.currentIndex] = swapWith;
  }
  showButton() {
    this.showBtn = false;
  }

  ngOnDestroy() {
    if (this.subscBusinesses) {
      this.subscBusinesses.unsubscribe();
    }
    if (this.subscSelectedBusiness) {
      this.subscSelectedBusiness.unsubscribe();
    }
    if (this.subscClrForm) {
      this.subscClrForm.unsubscribe();
    }
  }

}
