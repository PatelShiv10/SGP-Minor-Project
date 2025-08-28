const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS not set; skipping email to', to);
    return;
  }
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
}

module.exports = { sendMail };