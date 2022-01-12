const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({
  origin: ['http://localhost:3000', 'https://whatismlkit.firebaseapp.com', 'https://places.astider.reviews']
})

admin.initializeApp();

const db = admin.firestore();
const capi = functions.https.onRequest;

exports.sample = capi((req, res) => {
  cors(req, res, () => {
    const original = req.query.text;
    return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
      // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
      return res.redirect(303, snapshot.ref.toString());
    });
  })
});

exports.savePlace = capi((req, res) => {
  cors(req, res, () => {
    const name = req.body.name;
    const data = req.body.data;
    db.collection('save')
    .doc(name).set(data)
    .then(docRef => {
      id = docRef.id
      console.log('save to id: ', id);
      return res.json({ error: null })
    })
    .catch(error => {
      return res.json({ error })
    })
  })
})

exports.loadPlace = capi((req, res) => {
  cors(req, res, () => {
    const name = req.query.name;
    db.collection('save')
    .doc(name).get()
    .then(snap => {
      if (!snap.exists) return res.json({ error: 'document not exists' });
      else {
        console.log(JSON.stringify(snap));
        const data = snap.data();
        console.log('data', data);
        return res.json({ error: null, data })
      }
    })
    .catch(error => {
      return res.json({ error })
    })
  })
})

exports.searchPlace = capi((req, res) => {
  cors(req, res, () => {
    const query = req.query.place;
    const placeSearchURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyDflsDUpu_e7MRMMaWA3o1oEvvHuu7TA2M&query=' + query;
    axios.get(placeSearchURL)
    .then(data => {
      console.log(data);
      return res.status(200).json(data.data);
    })
    .catch(error => {
      return res.status(500).json(error)
    })
  })
})

exports.searchImage = capi((req, res) => {
  cors(req, res, () => {
    const query = 'photoreference=' + req.query.ref + '&maxwidth=' + req.query.width;
    const imgSearchURL = 'https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyDflsDUpu_e7MRMMaWA3o1oEvvHuu7TA2M&' + query;
    console.log(imgSearchURL);
    axios({
      method: 'GET',
      url: imgSearchURL,
    })
    .then(data => {
      console.log(Object.keys(data.request._redirectable._redirects));
      console.log(data.request._redirectable._currentUrl);
      return res.status(200).json({ src: data.request._redirectable._currentUrl });
    })
    .catch(error => {
      return res.status(500).json(error)
    })
  })
})