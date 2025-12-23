const nodemailer = require('nodemailer');

const sendOTP = async (to, otp) => {
  const from = process.env.FROM_EMAIL || 'no-reply@example.com';

  // If SMTP credentials are provided, use them. Otherwise create an Ethereal test account.
  let transporter;
  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
  });

  // If using Ethereal, return the preview URL for testing
  const preview = nodemailer.getTestMessageUrl(info);
  return { info, preview };
};

module.exports = { sendOTP };
