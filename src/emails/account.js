const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'q66p@hotmail.com',
    subject: 'Thanks for joining in',
    text: `Welcome to the app, ${name}. Let us know how you get along with the app!`
  });
}

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to:email,
    from: 'q66p@hotmail.com',
    subject: 'Share your feedback',
    text: `Thank you for your time, ${name}. Let us know the reasons why you canceled your subscription for us to improve user experiance!`
  });
}

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail
};