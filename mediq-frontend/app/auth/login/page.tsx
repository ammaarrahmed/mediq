'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Eye, EyeOff } from 'lucide-react'
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import ApiStatusIndicator from "@/components/api-status-indicator"
import logger from "@/lib/logger"

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    logger.info("Login form submitted", { username });
    console.log("Login form submitted", { username, apiUrl: process.env.NEXT_PUBLIC_API_URL });
    
    try {
      logger.info("Initiating login process", { apiUrl: process.env.NEXT_PUBLIC_API_URL });
      await login(username, password)
      
      logger.info("Login successful, redirecting to dashboard");
      console.log("About to redirect to dashboard - auth state:", { 
        authenticated: true, 
        hasToken: !!localStorage.getItem('mediq_token'),
        hasUser: !!localStorage.getItem('mediq_user')
      });
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      })
      
      // Short delay to ensure state is updated before navigation
      setTimeout(() => {
        console.log("Redirecting to dashboard now");
        router.push('/dashboard');
      }, 100)
    } catch (error) {
      logger.error("Login error in component", error);
      console.error("Login error:", error);
      
      // Enhanced error logging
      const errorMessage = error instanceof Error ? error.message : "Please check your credentials and try again.";
      logger.error("Error details for user", { errorMessage });
      
      // Force a specific error message if empty
      toast({
        title: "Login failed",
        description: errorMessage || "Authentication failed. Please check your username and password.",
        variant: "destructive",
        className:"text-white"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MedIQ</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your username and password to access your healthcare dashboard
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-2 text-xs text-blue-600">
                  <Link href="/connection-test" className="hover:underline">
                    Having trouble? Check API connection
                  </Link>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">{"Don't have an account? "}</span>
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t pt-4 pb-2 px-6">
            <div className="text-xs text-gray-500">
              {process.env.NEXT_PUBLIC_API_URL ? (
                <span>API: {process.env.NEXT_PUBLIC_API_URL.split('//')[1]}</span>
              ) : (
                <span>API: Not configured</span>
              )}
            </div>
            <ApiStatusIndicator />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
