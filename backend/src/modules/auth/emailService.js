// src/modules/auth/emailService.js
const { Resend } = require("resend");

const resend  = new Resend(process.env.RESEND_API_KEY);

// ─── FROM address ────────────────────────────────────────────────────────────
// Development: onboarding@resend.dev works out of the box BUT can only deliver
// to the email address registered on your Resend account.
//
// Production: verify your own domain at resend.com/domains, then change to:
//   "DCS Platform <noreply@yourdomain.com>"
// ─────────────────────────────────────────────────────────────────────────────
const FROM    = "DCS Platform <onboarding@resend.dev>";
const APP_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ── helper: log Resend result so failures are visible in the terminal ─────────
function logResult(label, result) {
  if (result?.error) {
    console.error(`[emailService] ${label} FAILED:`, JSON.stringify(result.error));
  } else {
    console.log(`[emailService] ${label} sent — id: ${result?.data?.id}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

async function sendVerificationEmail({ name, email, token }) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const result = await resend.emails.send({
    from: FROM,
    to:   email,
    subject: "Verify your DCS account",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:'DM Sans',Arial,sans-serif;background:#070d18;color:#e2e8f0;margin:0;padding:40px 0;">
          <div style="max-width:520px;margin:0 auto;background:#0f1929;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">
            <div style="background:linear-gradient(135deg,#0e7490,#7c3aed);padding:32px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">DCS Platform</h1>
            </div>
            <div style="padding:40px 32px;">
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#f1f5f9;">Hi ${name},</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">
                Thanks for creating an account. Click the button below to verify your email address.
                This link expires in <strong style="color:#e2e8f0;">24 hours</strong>.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${verifyUrl}"
                   style="display:inline-block;background:#06b6d4;color:#070d18;font-weight:700;font-size:14px;
                          padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.3px;">
                  Verify Email Address
                </a>
              </div>
              <p style="margin:24px 0 0;font-size:12px;color:#475569;line-height:1.6;">
                If you didn't create this account, you can safely ignore this email.<br/>
                Or copy this URL: <span style="color:#67e8f9;">${verifyUrl}</span>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  logResult("sendVerificationEmail", result);
}

async function sendResendVerificationEmail({ name, email, token }) {
  return sendVerificationEmail({ name, email, token });
}

async function sendPasswordResetEmail({ name, email, token }) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const result = await resend.emails.send({
    from: FROM,
    to:   email,
    subject: "Reset your DCS password",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family:'DM Sans',Arial,sans-serif;background:#070d18;color:#e2e8f0;margin:0;padding:40px 0;">
          <div style="max-width:520px;margin:0 auto;background:#0f1929;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">
            <div style="background:linear-gradient(135deg,#0e7490,#7c3aed);padding:32px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">DCS Platform</h1>
            </div>
            <div style="padding:40px 32px;">
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#f1f5f9;">Password Reset</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.7;">
                Hi ${name}, we received a request to reset your password. This link expires in <strong style="color:#e2e8f0;">1 hour</strong>.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}"
                   style="display:inline-block;background:#a78bfa;color:#070d18;font-weight:700;font-size:14px;
                          padding:14px 32px;border-radius:10px;text-decoration:none;">
                  Reset Password
                </a>
              </div>
              <p style="margin:24px 0 0;font-size:12px;color:#475569;">
                If you didn't request this, ignore this email — your password won't change.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  logResult("sendPasswordResetEmail", result);
}

module.exports = {
  sendVerificationEmail,
  sendResendVerificationEmail,
  sendPasswordResetEmail,
};
