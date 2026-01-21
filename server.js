// Simple Express server to send quiz results via email using Nodemailer.
// تأكد من إعداد بيانات البريد في ملف .env قبل التشغيل.

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/send-result', async (req, res) => {
  const { studentName, bodyText } = req.body || {};

  if (!studentName || !bodyText) {
    return res.status(400).json({ ok: false, error: 'بيانات غير مكتملة.' });
  }

  try {
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
      subject: `نتيجة اختبار الديرما بن والميزوثيرابي - ${studentName}`,
      text: bodyText,
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Error sending email', error);
    res.status(500).json({ ok: false, error: 'فشل إرسال البريد.' });
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});


