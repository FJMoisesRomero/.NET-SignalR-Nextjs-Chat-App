import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Chat App",
  description: "Chat with friends and AI assistants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
          {/* Animated stars/particles */}
          <div className="fixed inset-0 pointer-events-none">
            <div
              className="absolute h-2 w-2 rounded-full bg-white/20 animate-pulse"
              style={{ top: "15%", left: "45%" }}
            />
            <div
              className="absolute h-3 w-3 rounded-full bg-white/30 animate-pulse"
              style={{ top: "25%", left: "25%" }}
            />
            <div
              className="absolute h-2 w-2 rounded-full bg-white/20 animate-pulse"
              style={{ top: "55%", left: "65%" }}
            />
            <div
              className="absolute h-4 w-4 rounded-full bg-white/10 animate-pulse"
              style={{ top: "75%", left: "35%" }}
            />
            <div
              className="absolute h-3 w-3 rounded-full bg-white/20 animate-pulse"
              style={{ top: "35%", left: "85%" }}
            />
            <div
              className="absolute h-2 w-2 rounded-full bg-white/30 animate-pulse"
              style={{ top: "85%", left: "15%" }}
            />
            <div
              className="absolute h-3 w-3 rounded-full bg-white/10 animate-pulse"
              style={{ top: "45%", left: "75%" }}
            />
            {/* Floating orbs */}
            <div
              className="absolute h-32 w-32 rounded-full bg-purple-500/20 blur-xl"
              style={{ top: "20%", left: "20%" }}
            />
            <div
              className="absolute h-40 w-40 rounded-full bg-blue-500/20 blur-xl"
              style={{ top: "60%", left: "70%" }}
            />
            <div
              className="absolute h-36 w-36 rounded-full bg-indigo-500/20 blur-xl"
              style={{ top: "40%", left: "50%" }}
            />
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "rgba(0, 0, 0, 0.8)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              },
              className: "backdrop-blur-lg",
            }}
          />
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
