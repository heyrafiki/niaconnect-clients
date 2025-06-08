"use client";
import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-red-50">
      <div className="bg-white border border-red-300 p-8 rounded-xl shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-2">
          {error === "OAuthCallback"
            ? "Sign-in failed: This email is already registered as an expert. Please use a different account or sign in to your expert account."
            : error || "An unknown error occurred."}
        </p>
        <a href="/auth" className="mt-6 inline-block px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800">Back to login</a>
      </div>
    </div>
  );
}
