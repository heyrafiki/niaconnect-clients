import crypto from 'crypto'

// Generate a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Hash OTP with user's email for storage
export const hashOTP = (otp: string, email: string) => {
  const hmac = crypto.createHmac('sha256', process.env.OTP_SECRET_KEY!)
  hmac.update(otp + email)
  return hmac.digest('hex')
}

// Verify OTP
export const verifyOTP = (storedHash: string, providedOTP: string, email: string) => {
  const providedHash = hashOTP(providedOTP, email)
  return crypto.timingSafeEqual(
    Buffer.from(storedHash),
    Buffer.from(providedHash)
  )
}

// Check if OTP is expired
export const isOTPExpired = (createdAt: Date) => {
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES)
  const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60000)
  return new Date() > expiryTime
} 