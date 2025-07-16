import { Inter } from "next/font/google";

import { AuthStoreHydrator } from "@/store/auth-hydrator";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import "./globals.css";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088/api/v1";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Sykell Challenge",
  description: "Crawl the web with GoLang",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Get the auth token on the server
  const token = (await cookies()).get("access_token")?.value;
  let userData = null;

  // 2. If a token exists, fetch the user data from our Go API
  if (token) {
    try {
      // This is a secure, server-to-server request.
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          // We manually create the cookie header for the server-side request
          Cookie: `access_token=${token}`,
        },
        cache: "no-store", // Ensure we always get the latest user data
      });

      if (res.ok) {
        userData = await res.json();
      }
    } catch (error) {
      console.error("Failed to fetch user on server:", error);
      // userData remains null
    }
  }

  return (
    <html lang="en" className="dark scheme-only-dark">
      <body
        className={`${fontSans.variable} font-sans antialiased max-w-full overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <AuthStoreHydrator user={userData}>
          {children}
          <Toaster position="top-center" closeButton richColors />
        </AuthStoreHydrator>
      </body>
    </html>
  );
}
