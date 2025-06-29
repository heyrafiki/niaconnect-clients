import type { Metadata } from "next";
import { figtree, plusJakartaSans } from "@/lib/fonts";
import "./globals.css";
import Providers from "@/components/Providers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Heyrafiki - Mental Health Support",
  description: "Culturally-informed therapy and wellness tools",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(`${figtree.variable} ${plusJakartaSans.variable}`)}
      suppressHydrationWarning
    >
      <body className={figtree.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
