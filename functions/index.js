const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({
  origin: ['http://localhost:3000', 'https://whatismlkit.firebaseapp.com']
})

admin.initializeApp();

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