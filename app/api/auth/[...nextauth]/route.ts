import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/client";
import mongoose from "mongoose";

// Minimal Expert model for cross-check
const ExpertSchema = new mongoose.Schema({ email: { type: String, required: true, unique: true } });
const ExpertValidation = mongoose.models.Expert || mongoose.model('Expert', ExpertSchema);
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true }
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await Client.findOne({ email: credentials?.email, provider: "email" });
        if (!user) throw new Error("No user found with this email");
        if (!user.is_verified) throw new Error("Email not verified. Please check your inbox for the OTP.");
        if (!user.password_hash) throw new Error("No password set for this account.");
        const isValid = await bcrypt.compare(credentials!.password, user.password_hash);
        if (!isValid) throw new Error("Invalid password");
        return {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          onboarding: user.onboarding,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Always redirect to onboarding after Google login
      authorization: {
        params: {
          prompt: "select_account",
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/error",
    // NextAuth will handle Google callback automatically
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile) {
        token.provider = "google";
        token.picture = profile.picture;
        token.id = user?.id;
        token.email = profile.email;
        token.first_name = user?.first_name || profile.given_name;
        token.last_name = user?.last_name || profile.family_name;
        token.onboarding = user?.onboarding;
      } else if (user) {
        // Always set fullname for email signin/signup
        token.first_name = user.first_name || "";
        token.last_name = user.last_name || "";
        token.id = user.id;
        token.email = user.email;
        token.provider = user.provider || "email";
        token.onboarding = user.onboarding;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.provider = token.provider;
        session.user.onboarding = token.onboarding;
      }
      return session;
    },
    async redirect({ url, baseUrl, token }) {
      // Always redirect to dashboard after sign-in
      return `${baseUrl}/client/dashboard`;
    },
    async signIn({ user, account, profile, email }) {
      // Only handle Google provider
      if (account?.provider === "google") {
        await dbConnect();
        // Cross-check Expert collection
        const expertExists = await ExpertValidation.findOne({ email: user.email });
        if (expertExists) {
          // Block sign in if email exists as expert
          throw new Error("This email is already registered as an expert. Please use a different account.");
        }
        let existing = await Client.findOne({ email: user.email, provider: "google" });
        if (!existing) {
          // Create user if doesn't exist
          existing = await Client.create({
            email: user.email,
            first_name: profile?.given_name || "",
            last_name: profile?.family_name || "",
            provider: "google",
            is_verified: true,
            onboarding: { completed: false },
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
        // Ensure user object has all required fields
        user.id = existing._id.toString();
        user.first_name = existing.first_name;
        user.last_name = existing.last_name;
        user.onboarding = existing.onboarding;
        user.email = existing.email;
      }
      return true;
    }
  },
  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: process.env.NODE_ENV === 'production',
  //       domain: process.env.NODE_ENV === 'production' ? process.env.NEXTAUTH_URL?.split('://')[1] : 'localhost',
  //     },
  //   },
  // },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
