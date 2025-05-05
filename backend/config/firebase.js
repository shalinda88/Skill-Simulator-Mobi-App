const admin = require('firebase-admin');

const serviceAccount = require('../utils/firebase-service-account.json');;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "skillquest-ff588.firebasestorage.app",   // Update as your firebase storage bucket credentials
});

const bucket = admin.storage().bucket();

module.exports = bucket;

