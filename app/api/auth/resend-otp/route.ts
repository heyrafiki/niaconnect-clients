import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/client';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }
    await dbConnect();
    const user = await Client.findOne({ email, provider: 'email' });
    if (!user) {
      return NextResponse.json({ error: 'No user found with this email.' }, { status: 404 });
    }
    if (user.is_verified) {
      return NextResponse.json({ error: 'Email already verified.' }, { status: 409 });
    }
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otp = otp;
    user.otp_expiry = otp_expiry;
    await user.save();
    // Send OTP email
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
        to: email,
        subject: 'Your Heyrafiki OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      });
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to resend OTP.' }, { status: 500 });
  }
}
