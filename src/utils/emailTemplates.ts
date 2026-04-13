export const getPasswordChangeOtpEmailTemplate = (otp: string): string => {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Password Change Request – NAGA Shop</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #F2F1EE;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper { width: 100%; background-color: #F2F1EE; padding: 48px 0 64px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 4px; overflow: hidden; }
    .header-band { background-color: #111111; padding: 36px 48px 30px; text-align: center; }
    .brand-name { font-family: 'Georgia', 'Times New Roman', Times, serif; font-size: 30px; font-weight: normal; color: #FFFFFF; letter-spacing: 10px; margin: 0 0 6px; text-transform: uppercase; }
    .brand-tagline { font-size: 10px; letter-spacing: 5px; color: #C6A664; text-transform: uppercase; margin: 0; }
    .gold-line { width: 40px; height: 1px; background-color: #C6A664; margin: 16px auto 0; }
    .content { padding: 48px 48px 40px; }
    .email-label { font-size: 11px; letter-spacing: 3px; color: #C6A664; text-transform: uppercase; margin: 0 0 20px; }
    .email-heading { font-size: 22px; font-weight: 700; color: #111111; margin: 0 0 16px; line-height: 1.3; }
    .email-body { font-size: 15px; color: #555555; line-height: 1.7; margin: 0 0 36px; }
    .otp-section { background-color: #FAFAF9; border: 1px solid #E8E5DF; border-radius: 4px; padding: 28px 24px; text-align: center; margin-bottom: 36px; }
    .otp-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #999999; margin: 0 0 14px; }
    .otp-code { font-size: 40px; font-weight: 800; letter-spacing: 14px; color: #111111; margin: 0 0 14px; padding-left: 14px; display: block; }
    .otp-expiry { font-size: 12px; color: #999999; margin: 0; }
    .otp-expiry strong { color: #555555; }
    .divider { height: 1px; background-color: #EFEFEF; margin: 0 0 32px; }
    .security-notice { border-left: 3px solid #F5C6C6; padding: 12px 16px; margin-bottom: 36px; background-color: #FFFAFA; }
    .security-notice p { font-size: 13px; color: #888888; line-height: 1.6; margin: 0; }
    .security-notice strong { color: #C0392B; }
    .footer { background-color: #FAFAF9; border-top: 1px solid #EFEFEF; padding: 28px 48px; text-align: center; }
    .footer-brand { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #BBBBBB; margin: 0 0 8px; }
    .footer-copy { font-size: 11px; color: #CCCCCC; margin: 0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header-band">
        <p class="brand-name">NAGA</p>
        <p class="brand-tagline">Shop</p>
        <div class="gold-line"></div>
      </div>
      <div class="content">
        <p class="email-label">Security Alert</p>
        <h1 class="email-heading">Password Change Request</h1>
        <p class="email-body">
          We received a request to change the password for your NAGA Shop account. Use the verification code below to authorise this action. The code is valid for <strong>10 minutes</strong>.
        </p>
        <div class="otp-section">
          <p class="otp-label">Your Verification Code</p>
          <span class="otp-code">${otp}</span>
          <p class="otp-expiry">Expires in <strong>10 minutes</strong></p>
        </div>
        <div class="divider"></div>
        <div class="security-notice">
          <p>
            <strong>Did not request this?</strong> If you did not initiate a password change, your account may be at risk. We recommend securing your account immediately by contacting our support team.
          </p>
        </div>
      </div>
      <div class="footer">
        <p class="footer-brand">NAGA Shop</p>
        <p class="footer-copy">
          Premium E-Commerce Experience<br>
          &copy; ${year} NAGA Shop. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

export const getOtpEmailTemplate = (otp: string): string => {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Identity – NAGA Shop</title>
  <style>
    /* Base Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #F2F1EE;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    /* Wrapper */
    .wrapper {
      width: 100%;
      background-color: #F2F1EE;
      padding: 48px 0 64px;
    }

    /* Container */
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 4px;
      overflow: hidden;
    }

    /* Header Banner */
    .header-band {
      background-color: #111111;
      padding: 36px 48px 30px;
      text-align: center;
    }
    .brand-name {
      font-family: 'Georgia', 'Times New Roman', Times, serif;
      font-size: 30px;
      font-weight: normal;
      color: #FFFFFF;
      letter-spacing: 10px;
      margin: 0 0 6px;
      text-transform: uppercase;
    }
    .brand-tagline {
      font-size: 10px;
      letter-spacing: 5px;
      color: #C6A664;
      text-transform: uppercase;
      margin: 0;
    }
    .gold-line {
      width: 40px;
      height: 1px;
      background-color: #C6A664;
      margin: 16px auto 0;
    }

    /* Content */
    .content {
      padding: 48px 48px 40px;
    }
    .email-label {
      font-size: 11px;
      letter-spacing: 3px;
      color: #C6A664;
      text-transform: uppercase;
      margin: 0 0 20px;
    }
    .email-heading {
      font-size: 22px;
      font-weight: 700;
      color: #111111;
      margin: 0 0 16px;
      line-height: 1.3;
    }
    .email-body {
      font-size: 15px;
      color: #555555;
      line-height: 1.7;
      margin: 0 0 36px;
    }

    /* OTP Box */
    .otp-section {
      background-color: #FAFAF9;
      border: 1px solid #E8E5DF;
      border-radius: 4px;
      padding: 28px 24px;
      text-align: center;
      margin-bottom: 36px;
    }
    .otp-label {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #999999;
      margin: 0 0 14px;
    }
    .otp-code {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: 14px;
      color: #111111;
      margin: 0 0 14px;
      /* Offset right padding to compensate for letter-spacing on last char */
      padding-left: 14px;
      display: block;
    }
    .otp-expiry {
      font-size: 12px;
      color: #999999;
      margin: 0;
    }
    .otp-expiry strong {
      color: #555555;
    }

    /* Security Notice */
    .security-notice {
      border-left: 3px solid #E8E5DF;
      padding: 12px 16px;
      margin-bottom: 36px;
    }
    .security-notice p {
      font-size: 13px;
      color: #888888;
      line-height: 1.6;
      margin: 0;
    }
    .security-notice strong {
      color: #555555;
    }

    /* Divider */
    .divider {
      height: 1px;
      background-color: #EFEFEF;
      margin: 0 0 32px;
    }

    /* Footer */
    .footer {
      background-color: #FAFAF9;
      border-top: 1px solid #EFEFEF;
      padding: 28px 48px;
      text-align: center;
    }
    .footer-brand {
      font-size: 11px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #BBBBBB;
      margin: 0 0 8px;
    }
    .footer-copy {
      font-size: 11px;
      color: #CCCCCC;
      margin: 0;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">

      <!-- Header -->
      <div class="header-band">
        <p class="brand-name">NAGA</p>
        <p class="brand-tagline">Shop</p>
        <div class="gold-line"></div>
      </div>

      <!-- Body -->
      <div class="content">
        <p class="email-label">Account Verification</p>
        <h1 class="email-heading">Confirm Your Identity</h1>
        <p class="email-body">
          You recently requested to create an account with NAGA Shop. To complete your registration and secure your account, please use the one-time verification code below.
        </p>

        <!-- OTP Box -->
        <div class="otp-section">
          <p class="otp-label">Your Verification Code</p>
          <span class="otp-code">${otp}</span>
          <p class="otp-expiry">This code expires in <strong>10 minutes</strong></p>
        </div>

        <div class="divider"></div>

        <!-- Security Notice -->
        <div class="security-notice">
          <p>
            <strong>Did not request this?</strong> If you did not initiate this registration, please disregard this email. Your account will not be activated without completing verification. For any concerns, contact our support team.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-brand">NAGA Shop</p>
        <p class="footer-copy">
          Premium E-Commerce Experience<br>
          &copy; ${year} NAGA Shop. All rights reserved.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
};
