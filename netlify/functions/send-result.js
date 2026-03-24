// Netlify serverless function to send quiz results via email using Nodemailer.

const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' }),
    };
  }

  try {
    const { studentName, bodyText } = JSON.parse(event.body || '{}');

    if (!studentName || !bodyText) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'بيانات غير مكتملة.' }),
      };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    const toEmail = process.env.TO_EMAIL || 'info@elyptek.com';

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: `تقييم لرحلة عمرك - ${studentName}`,
      text: bodyText,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    console.error('Error sending email from Netlify function', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'فشل إرسال البريد.' }),
    };
  }
};


