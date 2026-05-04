const https = require('https');

const brevoRequest = (to, subject, html) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      sender: { 
        name: process.env.BREVO_SENDER_NAME, 
        email: process.env.BREVO_SENDER_EMAIL 
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Brevo error ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

const sendVerificationEmail = async (toEmail, username, token) => {
  const link = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;
  await brevoRequest(toEmail, 'Verify your SkillQuest email', `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:40px 32px;background:#0f0f13;color:#e2e8f0;border-radius:12px">
      <h1 style="margin:0 0 8px;font-size:24px;color:#a78bfa">SkillQuest</h1>
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:500">Welcome, ${username}!</h2>
      <p style="color:#94a3b8;line-height:1.6">Click the button below to verify your email. This link expires in <strong style="color:#e2e8f0">24 hours</strong>.</p>
      <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Verify Email</a>
      <p style="color:#475569;font-size:13px;margin-top:24px">If you didn't create a SkillQuest account, you can safely ignore this email.</p>
    </div>
  `);
};

const sendPasswordResetEmail = async (toEmail, username, token) => {
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await brevoRequest(toEmail, 'Reset your SkillQuest password', `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:40px 32px;background:#0f0f13;color:#e2e8f0;border-radius:12px">
      <h1 style="margin:0 0 8px;font-size:24px;color:#a78bfa">SkillQuest</h1>
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:500">Password Reset</h2>
      <p style="color:#94a3b8;line-height:1.6">Hi ${username}, click below to reset your password. This link expires in <strong style="color:#e2e8f0">1 hour</strong>.</p>
      <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Reset Password</a>
      <p style="color:#475569;font-size:13px;margin-top:24px">If you didn't request this, ignore this email. Your password won't change.</p>
    </div>
  `);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
