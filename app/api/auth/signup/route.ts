import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/client';
import bcrypt from 'bcryptjs';
import { validateClientEmail } from '@/lib/account-validation';

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, last_name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    await dbConnect();

    // First check if email exists in experts collection
    const expertValidation = await validateClientEmail(email);
    if (expertValidation) {
      return expertValidation;
    }

    const existing = await Client.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }
    const password_hash = await bcrypt.hash(password, 10);
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    const user = await Client.create({
      email,
      password_hash,
      first_name,
      last_name,
      is_verified: false,
      provider: 'email',
      otp,
      otp_expiry,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Send OTP email using nodemailer
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
      // Optionally log or return error, but do not block signup
      console.error('Failed to send OTP email:', mailErr);
    }

    return NextResponse.json({ success: true, user: { email: user.email, id: user._id } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signup failed.' }, { status: 500 });
  }
}
