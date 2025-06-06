"use client";
import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-red-50">
      <div className="bg-white border border-red-300 p-8 rounded-xl shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-2">{error ? error : "An unknown error occurred."}</p>
        <pre className="bg-red-100 text-red-800 rounded p-2 text-sm overflow-x-auto max-w-full">
          {JSON.stringify(error, null, 2)}
        </pre>
        <a href="/" className="mt-6 inline-block text-green-700 hover:underline">Back to Home</a>
      </div>
    </div>
  );
}
