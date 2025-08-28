const express = require('express');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // Save data to MongoDB
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    // Prepare an attractive email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #008080;">Hi ${name},</h2>
        <p>Thank you for contacting <strong>LawMate</strong>.</p>
        <p>We have received your message and one of our legal experts will connect with you soon!</p>

        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #008080; margin: 20px 0;">
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong> ${message}</p>
        </div>

        <p style="margin-bottom: 30px;">We value your trust and will get back to you within <strong>24 hours</strong>.</p>

        <p>Warm regards,<br/><strong>LawMate Support Team</strong></p>

        <hr/>
        <p style="font-size: 12px; color: gray;">This is an automated confirmation email from LawMate. If you did not send this message, please ignore.</p>
      </div>
    `;

    // Send confirmation email to user
    await transporter.sendMail({
      from: `"LawMate Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message - LawMate",
      html: htmlContent,
    });

    res.status(200).json({ success: true, message: "Message saved and email sent." });

  } catch (error) {
    console.error('Error saving contact or sending email:', error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

module.exports = router;
