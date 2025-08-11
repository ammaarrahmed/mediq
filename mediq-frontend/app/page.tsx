import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, FileText, MessageSquare, Activity, Shield, Users } from 'lucide-react'
import Link from "next/link"
import ApiConnectionStatus from "@/components/api-connection-status"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MedIQ</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          {/* Dynamic API Connection Status Alert */}
          <div className="mb-6">
            <ApiConnectionStatus />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your AI-Powered Healthcare Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload medical documents, chat with AI about your health, analyze symptoms, 
            and get personalized medical insights - all in one secure platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Health Journey
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comprehensive Healthcare Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Document Processing</CardTitle>
                <CardDescription>
                  Upload medical documents and get AI-powered OCR extraction with structured medical data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• OCR for images and PDFs</li>
                  <li>• Extract vital measurements</li>
                  <li>• Identify medications & dosages</li>
                  <li>• Parse lab results</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>AI Chat Assistant</CardTitle>
                <CardDescription>
                  Chat with AI about your medical documents and get personalized health insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Mistral-7B powered responses</li>
                  <li>• Document-aware conversations</li>
                  <li>• Session management</li>
                  <li>• Chat history</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle>Symptom Analysis</CardTitle>
                <CardDescription>
                  Analyze symptoms and get diagnostic guidance with follow-up recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Symptom checker</li>
                  <li>• Possible conditions</li>
                  <li>• Home care recommendations</li>
                  <li>• Medical attention guidance</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your medical data is protected with enterprise-grade security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• JWT authentication</li>
                  <li>• Row-level security</li>
                  <li>• HIPAA compliant</li>
                  <li>• Encrypted storage</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Different interfaces and features for patients and healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Patient dashboards</li>
                  <li>• Doctor interfaces</li>
                  <li>• Role-specific features</li>
                  <li>• Professional tools</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-pink-600 mb-2" />
                <CardTitle>Health Summaries</CardTitle>
                <CardDescription>
                  Generate comprehensive medical history summaries and track your health journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Medical history summaries</li>
                  <li>• Health trend analysis</li>
                  <li>• Progress tracking</li>
                  <li>• Shareable reports</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust MedIQ for their healthcare needs
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-6 w-6" />
            <span className="text-xl font-bold">MedIQ</span>
          </div>
          <p className="text-gray-400">
            © 2024 MedIQ. All rights reserved. Your health, our priority.
          </p>
        </div>
      </footer>
    </div>
  )
}
