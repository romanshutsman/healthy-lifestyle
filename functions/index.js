const functions = require('firebase-functions');
const admin = require('firebase-admin');

const geometry = require('spherical-geometry-js');

admin.initializeApp(functions.config().firebase);

const db = admin.database();

exports.createUser = functions.auth.user().onCreate(user => {
  const phoneNumber = user.phoneNumber;
  const id = user.uid;
  const data = {
    phone: phoneNumber
  };
  return db.ref('/users/' + id).set(data);
});

exports.checkIn = functions.https.onRequest((req, res) => {
  const uid = req.query.uid;
  const lat = req.query.lat;
  const lng = req.query.lng;

  let counterCheckIn = 0;
  let points = {};
  let businesses = [];
  const timestamp = new Date().getTime();
  let checkinsId = [];
  const hour = 3600000;

  if (!uid || !lat || !lng) {
    res.status(500).json('Parameters uid, lat and lng are required !')
  }

  checkInBusinesses();
  checkCheckins();
  
  function checkCheckins() {
    db.ref('/userCheckins/' + uid).once('value')
      .then((snap) => {
          console.log(snap.val(), 'DDDDDDDDDDD');
        const chekins = snap.val();
        console.log(snap.val(), 'AAAA');
        const keys = Object.keys(chekins);
        for (let key of keys) {
          if (timestamp - chekins[key].checkinTimestamp >= hour) {
            db.ref('/userCheckins/' + uid + '/' + key).remove();
          } else {
            checkinsId.push(chekins[key].businessId);
          }
        }
        return
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function checkInBusinesses() {
    getPoints();
    db.ref('/business/').once('value')
      .then((allBusinesses) => {
        const allBus = allBusinesses.val();
        const allBusKey = Object.keys(allBus);
        if (allBus) {
          for (let key of allBusKey) {
            businesses.push(allBus[key]);
          }
        }
        return;
      })
      .then(() => {
        setPoints();
        return
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function getDistance(currentLat, currentLng) {
    return geometry.computeDistanceBetween(new geometry.LatLng(currentLat, currentLng), new geometry.LatLng(lat, lng));
  }

  function getPoints() {
    const defaultPoints = {
      "gym": 0,
      "restaurant": 0,
      "food_delivery": 0,
      "shops": 0,
      "nutritionists": 0
    };
    db.ref('/users/' + uid + '/points/' ).once('value').then((snap) => {
      if(!snap.val()) {
        console.log('USER HASNT POINTS');
        db.ref('/users/' + uid + '/points' ).update(defaultPoints);
      } else {
        console.log('USER HAS POINTS');
      }
    })
    db.ref('/users/' + uid + '/points/' ).once('value')
    .then((snap) => {
      console.log(snap.val());
      points = snap.val();
        return points;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function setPoints() {
    businesses.forEach((business, i) => {
      console.log('CAN BE UNDEFINED', business.lat);
      if(typeof business.lat != "number" && typeof business.lng != "number") {
        console.log('ONLY NUMBER', business.lat);
        business.lat = 99999
        business.lng = 99999
        console.log('HAHAHAHAHHAH');
      }
              if (getDistance(business.lat, business.lng) < 16) {
                if (checkinsId.indexOf(business.id) === -1) {
                  counterCheckIn++;
                  if (points !== null && Object.keys(points).indexOf(business.type) !== -1) {
                    const oldPoints = points[Object.keys(points)[Object.keys(points).indexOf(business.type)]];
                    db.ref('/users/' + uid + '/points/' + business.type).set(oldPoints + 1)
                  } else {
                    db.ref('/users/' + uid + '/points/' + business.type).set(1)
                  }
                  addToUserCheckins(business.id);
                } else {
                  res.status(500).send('You can check-in only once an hour in the same place!');
                }
              }
              if (businesses.length === i + 1 && counterCheckIn === 0) {
                res.status(500).send('You are not near any business place from App!');
              }  if (businesses.length === i + 1 && counterCheckIn > 0) {
                res.status(200).send('Checkins added!');
              }
    })
  }

  function addToUserCheckins(businessId) {
    if (checkinsId.indexOf(businessId) === -1) {
      db.ref('/userCheckins/' + uid).push({
        businessId: businessId,
        checkinTimestamp: timestamp
      });
    }
  }
});
