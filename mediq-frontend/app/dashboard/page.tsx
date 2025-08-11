'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, MessageSquare, Activity, User, Upload, Heart, LogOut, Settings, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { useAuth, getAuthHeaders } from "@/lib/auth"
import Link from "next/link"

interface DashboardStats {
  documents_count: number
  chat_sessions_count: number
  analyses_count: number
  recent_activity: Array<{
    type: string
    description: string
    timestamp: string
  }>
}

export default function DashboardPage() {
  const { user, token, logout, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    // Enhanced logging
    console.log("Dashboard auth state:", { 
      user, 
      token, 
      loading,
      localStorageToken: localStorage.getItem('mediq_token'),
      localStorageUser: localStorage.getItem('mediq_user')
    });
    
    // Allow a little time for auth state to load from localStorage
    const checkAuth = setTimeout(() => {
      // Check both context and localStorage
      const storedToken = localStorage.getItem('mediq_token');
      
      // If we have a token in localStorage but not in context, we might need to reload the page
      if (storedToken && !token && !loading) {
        console.log("Token found in localStorage but not in context, will try to recover");
        window.location.reload();
        return;
      }
      
      // Only redirect if we're not loading and don't have auth data anywhere
      if (!loading && !user && !storedToken) {
        console.log("No authentication found, redirecting to login page");
        router.push('/auth/login');
        return;
      }
      
      // Proceed with dashboard if we have either context auth or localStorage auth
      if ((user && token) || storedToken) {
        console.log("User authenticated, fetching dashboard stats");
        fetchDashboardStats();
      }
    }, 500);
    
    return () => clearTimeout(checkAuth);
  }, [user, token, loading, router])

  const fetchDashboardStats = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setStats({
        documents_count: 12,
        chat_sessions_count: 8,
        analyses_count: 5,
        recent_activity: [
          {
            type: 'document',
            description: 'Uploaded blood test results',
            timestamp: '2 hours ago'
          },
          {
            type: 'chat',
            description: 'Asked about medication interactions',
            timestamp: '1 day ago'
          },
          {
            type: 'analysis',
            description: 'Completed symptom analysis for headache',
            timestamp: '2 days ago'
          }
        ]
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MedIQ</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={user.role === 'doctor' ? 'default' : 'secondary'}>
              {user.role === 'doctor' ? 'Healthcare Provider' : 'Patient'}
            </Badge>
            <span className="text-sm text-gray-600">
              {user.first_name} {user.last_name}
            </span>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.first_name}!
          </h1>
          <p className="text-gray-600">
            {user.role === 'doctor' 
              ? 'Manage your patients and access professional healthcare tools.'
              : 'Track your health journey and get AI-powered insights.'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/documents/upload">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">Upload Document</h3>
                <p className="text-sm text-gray-600">Add medical files</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/chat">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">AI Chat</h3>
                <p className="text-sm text-gray-600">Ask health questions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analysis">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-semibold">Symptom Analysis</h3>
                <p className="text-sm text-gray-600">Check symptoms</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Profile</h3>
                <p className="text-sm text-gray-600">Manage account</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.documents_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Medical files uploaded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.chat_sessions_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                AI conversations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analyses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.analyses_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Health assessments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest interactions with MedIQ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recent_activity.length ? (
              <div className="space-y-4">
                {stats.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {activity.type === 'document' && <FileText className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'chat' && <MessageSquare className="h-4 w-4 text-green-600" />}
                      {activity.type === 'analysis' && <Activity className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No recent activity</p>
                <p className="text-sm">Start by uploading a document or asking a question</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
