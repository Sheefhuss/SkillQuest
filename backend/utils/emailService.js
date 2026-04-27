const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendVerificationEmail = async (toEmail, username, token) => {
  const link = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"SkillQuest" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your SkillQuest email',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:40px 32px;background:#0f0f13;color:#e2e8f0;border-radius:12px">
        <h1 style="margin:0 0 8px;font-size:24px;color:#a78bfa">SkillQuest</h1>
        <h2 style="margin:0 0 16px;font-size:18px;font-weight:500">Welcome, ${username}!</h2>
        <p style="color:#94a3b8;line-height:1.6">Click the button below to verify your email. This link expires in <strong style="color:#e2e8f0">24 hours</strong>.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Verify Email →</a>
        <p style="color:#475569;font-size:13px;margin-top:24px">If you didn't create a SkillQuest account, you can safely ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (toEmail, username, token) => {
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"SkillQuest" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your SkillQuest password',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:40px 32px;background:#0f0f13;color:#e2e8f0;border-radius:12px">
        <h1 style="margin:0 0 8px;font-size:24px;color:#a78bfa">SkillQuest</h1>
        <h2 style="margin:0 0 16px;font-size:18px;font-weight:500">Password Reset</h2>
        <p style="color:#94a3b8;line-height:1.6">Hi ${username}, click below to reset your password. This link expires in <strong style="color:#e2e8f0">1 hour</strong>.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Reset Password →</a>
        <p style="color:#475569;font-size:13px;margin-top:24px">If you didn't request this, ignore this email. Your password won't change.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
