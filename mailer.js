const nodemailer = require('nodemailer');

/**
 * Sends an email notification when a new contact message is received.
 */
async function sendContactEmail(messageData) {
  const { name, email, subject, message } = messageData;

  // Check if email settings are provided
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Email settings missing in .env. Skipping email notification.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    secure: (process.env.EMAIL_PORT == 465), // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO || process.env.EMAIL_USER,
    subject: `New Message: ${subject || 'No Subject'}`,
    text: `You have a new message from your portfolio website:
    
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #00bcd4; border-bottom: 2px solid #00bcd4; padding-bottom: 10px;">New Portfolio Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #00bcd4; margin-top: 20px;">
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 0.8rem; color: #888; text-align: center;">Sent from your Professional Portfolio Website</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Contact email sent successfully: ' + info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Nodemailer Error:', error.message);
    if (error.code === 'EAUTH') {
      console.error('🔒 Authentication failed. Please check your EMAIL_USER and EMAIL_PASS (App Password).');
    }
    return false;
  }
}

module.exports = { sendContactEmail };
