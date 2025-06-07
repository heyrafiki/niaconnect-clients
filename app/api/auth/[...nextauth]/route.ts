import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/client";
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
    async redirect({ url, baseUrl, account, user }) {
      // For Google sign-in, always redirect to onboarding/step-1 with user info
      if (account?.provider === "google") {
        const params = new URLSearchParams({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || ''
        });
        return `${baseUrl}/onboarding/step-1?${params.toString()}`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async signIn({ user, account, profile, email }) {
      // Only handle Google provider
      if (account?.provider === "google") {
        await dbConnect();
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
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.onboarding = user.onboarding;
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.first_name = token.first_name;
        session.user.last_name = token.last_name;
        session.user.onboarding = token.onboarding;
        session.provider = token.provider;
      }
      return session;
    }
  },
  events: {
    async signIn({ user, account }) {
      // Redirect Google users to onboarding after login
      if (account?.provider === "google") {
        // This event cannot directly redirect, so handle on the client
      }
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
