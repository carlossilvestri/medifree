const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const util = require('util');
const emailConfig = require('../../config/email'); // Para pruebas con SMTP
var inlineBase64 = require('nodemailer-plugin-inline-base64');
//Importar las variables de entorno:
require('dotenv').config({ path: 'variables.env' });

// create reusable transporter object using the default SMTP transport
/*
// Para pruebas.
let transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user, // generated ethereal user
        pass: emailConfig.pass // generated ethereal password
    }
});
*/

let transporter = nodemailer.createTransport({
    // service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL, // email
        pass: process.env.PASSWORDEMAIL // password
    }
});

/* let transporter =  nodemailer.createTransport("SMTP", {
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'myzoho@zoho.com',
        pass: 'myPassword'
    }
});
*/
const generarHTML = (archivo, opciones) => {
    const html = pug.renderFile(`${__dirname}/../views/emails/${archivo}.pug`, opciones);
    return juice(html);
}

// send mail with defined transport object
exports.enviar = async(opciones) => {
    const html = generarHTML(opciones.archivo, opciones);
    const text = htmlToText.fromString(html);
    let info = {
        from: 'MediFree <no-reply@medifree.com>', // sender address
        to: opciones.usuario.emailU, // list of receivers
        subject: opciones.subject, // Subject line
        text,
        html
    };
    transporter.use('compile', inlineBase64({cidPrefix: 'somePrefix_'}));
    const enviarEmail = util.promisify(transporter.sendMail, transporter);
    return enviarEmail.call(transporter, info);

}