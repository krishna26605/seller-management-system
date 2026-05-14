import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Seller Admin System",
  description: "Full-stack Seller and Admin Management System with JWT Authentication",
};

/**
 * ROOT LAYOUT
 * ===========
 * The root layout wraps the entire application.
 * - AuthProvider: makes auth state available to all pages
 * - Toaster: enables toast notifications anywhere in the app
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* AuthProvider wraps everything so all components can use useAuth() */}
        <AuthProvider>
          {children}
          {/* Toaster renders notification popups - can be triggered from anywhere */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1f2937",
                color: "#f9fafb",
                border: "1px solid #374151",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#f9fafb",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#f9fafb",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
