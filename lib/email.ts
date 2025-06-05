import nodemailer from 'nodemailer'

// Email transporter configuration
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Email template for OTP verification
export const generateOTPEmailTemplate = (firstName: string, otp: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
          }
          .logo {
            margin-bottom: 20px;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #066338;
            letter-spacing: 4px;
            margin: 20px 0;
          }
          .expiry-text {
            color: #666;
            font-size: 14px;
            margin-top: 20px;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://your-domain.com/images/heyrafiki-logo.png" alt="Heyrafiki Logo" width="180" />
          </div>
          <h2>Verify Your Email</h2>
          <p>Hi ${firstName},</p>
          <p>Please use the following verification code to complete your email verification:</p>
          <div class="otp-code">${otp}</div>
          <p class="expiry-text">This code will expire in ${process.env.OTP_EXPIRY_MINUTES} minutes.</p>
          <div class="footer">
            <p>If you didn't request this verification, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Heyrafiki. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Function to send OTP email
export const sendVerificationEmail = async (
  to: string,
  firstName: string,
  otp: string
) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify Your Email - Heyrafiki',
    html: generateOTPEmailTemplate(firstName, otp),
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
} 