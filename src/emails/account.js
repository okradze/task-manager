const sgMail = require('@sendgrid/mail');

const key = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(key);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'okradzemirian@gmail.com',
        subject: 'Mirian Okradze LLC',
        html: `Welcome, ${name}.<br>Thanks for joining the task application.<br>Let me know your experience with app.<br><br>Mirian`,
    });
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'okradzemirian@gmail.com',
        subject: 'Mirian Okradze LLC',
        html: `Hello, ${name}.<br>We'd like to know why use stopped using Task Manager?<br>What feature would you like to add or improve?<br><br>Mirian Okradze LLC`,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail,
};
