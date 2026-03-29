const nodemailer = require('nodemailer');

console.log('Nodemailer object:', typeof nodemailer);
console.log('Has createTransport:', typeof nodemailer.createTransport);
console.log('Keys:', Object.keys(nodemailer));
