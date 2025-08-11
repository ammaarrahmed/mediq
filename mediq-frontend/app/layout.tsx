import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from "@/lib/auth"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedIQ - AI-Powered Healthcare Assistant",
  description: "Upload medical documents, chat with AI about your health, analyze symptoms, and get personalized medical insights.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
