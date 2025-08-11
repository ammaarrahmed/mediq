'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Activity, Heart, ArrowLeft, AlertTriangle, CheckCircle, Clock, Thermometer, Stethoscope, Brain, Eye, Loader2 } from 'lucide-react'
import { useAuth, getAuthHeaders } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface SymptomAnalysis {
  id: string
  symptoms: string[]
  severity: 'mild' | 'moderate' | 'severe'
  possible_conditions: Array<{
    name: string
    probability: number
    description: string
  }>
  recommendations: {
    home_care: string[]
    seek_medical_attention: boolean
    urgency_level: 'low' | 'medium' | 'high'
    suggested_tests: string[]
  }
  follow_up_questions: string[]
  created_at: string
}

export default function AnalysisPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [symptoms, setSymptoms] = useState('')
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null)
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({})

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Please describe your symptoms",
        description: "Enter at least one symptom to analyze.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      // Mock analysis - replace with actual API call
      setTimeout(() => {
        const mockAnalysis: SymptomAnalysis = {
          id: Date.now().toString(),
          symptoms: symptoms.split(',').map(s => s.trim()),
          severity,
          possible_conditions: [
            {
              name: "Common Cold",
              probability: 75,
              description: "A viral infection of the upper respiratory tract, typically mild and self-limiting."
            },
            {
              name: "Seasonal Allergies",
              probability: 60,
              description: "Allergic reaction to environmental allergens like pollen, dust, or pet dander."
            },
            {
              name: "Sinusitis",
              probability: 45,
              description: "Inflammation of the sinuses, often following a cold or due to allergies."
            }
          ],
          recommendations: {
            home_care: [
              "Get plenty of rest and stay hydrated",
              "Use a humidifier or breathe steam from a hot shower",
              "Consider over-the-counter pain relievers if needed",
              "Gargle with warm salt water for sore throat"
            ],
            seek_medical_attention: false,
            urgency_level: 'low',
            suggested_tests: [
              "Complete Blood Count (CBC) if symptoms persist",
              "Allergy testing if seasonal pattern is suspected"
            ]
          },
          follow_up_questions: [
            "Have you been around anyone who was sick recently?",
            "Do you have any known allergies?",
            "Have you traveled recently or been exposed to new environments?",
            "Are you taking any medications currently?"
          ],
          created_at: new Date().toISOString()
        }
        
        setAnalysis(mockAnalysis)
        setLoading(false)
        
        toast({
          title: "Analysis completed",
          description: "Your symptoms have been analyzed. Review the results below.",
        })
      }, 3000)

    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please try again later.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleFollowUpSubmit = async () => {
    if (Object.keys(followUpAnswers).length === 0) {
      toast({
        title: "Please answer the follow-up questions",
        description: "Your answers will help provide more accurate recommendations.",
        variant: "destructive",
      })
      return
    }

    // Mock follow-up processing
    toast({
      title: "Follow-up answers recorded",
      description: "Thank you for providing additional information.",
    })
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'mild': return 'text-green-600 bg-green-50'
      case 'moderate': return 'text-yellow-600 bg-yellow-50'
      case 'severe': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'medium': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'high': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <CheckCircle className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MedIQ</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Symptom Analysis</h1>
          <p className="text-gray-600">
            Describe your symptoms to get AI-powered health insights and recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Symptom Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Describe Your Symptoms</span>
                </CardTitle>
                <CardDescription>
                  Provide detailed information about what you're experiencing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms *</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Describe your symptoms (e.g., headache, fever, cough, fatigue)"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="How long have you had these symptoms? (e.g., 2 days, 1 week)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Severity Level</Label>
                  <div className="flex space-x-2">
                    {(['mild', 'moderate', 'severe'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={severity === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSeverity(level)}
                        className={severity === level ? getSeverityColor(level) : ''}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional">Additional Information</Label>
                  <Textarea
                    id="additional"
                    placeholder="Any other relevant information (medications, recent travel, medical history, etc.)"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleAnalyzeSymptoms} 
                  disabled={loading || !symptoms.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Symptoms...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analyze Symptoms
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 mb-1">Medical Disclaimer</p>
                    <p className="text-yellow-700">
                      This analysis is for informational purposes only and should not replace professional medical advice. 
                      Always consult with a healthcare provider for proper diagnosis and treatment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {loading && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Symptoms</h3>
                  <p className="text-gray-600">
                    Our AI is processing your symptoms and generating personalized insights...
                  </p>
                </CardContent>
              </Card>
            )}

            {analysis && (
              <>
                {/* Possible Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Stethoscope className="h-5 w-5" />
                      <span>Possible Conditions</span>
                    </CardTitle>
                    <CardDescription>
                      Based on your symptoms, here are potential conditions to consider
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.possible_conditions.map((condition, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{condition.name}</h3>
                          <Badge variant="secondary">
                            {condition.probability}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{condition.description}</p>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${condition.probability}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getUrgencyIcon(analysis.recommendations.urgency_level)}
                      <span>Recommendations</span>
                    </CardTitle>
                    <CardDescription>
                      Personalized care recommendations based on your analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-green-600" />
                        <span>Home Care</span>
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {analysis.recommendations.home_care.map((care, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{care}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2 flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span>Medical Attention</span>
                      </h4>
                      <div className={`p-3 rounded-lg ${
                        analysis.recommendations.seek_medical_attention 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <p className="text-sm font-medium">
                          {analysis.recommendations.seek_medical_attention 
                            ? 'You should consider seeing a healthcare provider'
                            : 'Home care should be sufficient for now'
                          }
                        </p>
                        <p className="text-xs mt-1 opacity-75">
                          Urgency level: {analysis.recommendations.urgency_level}
                        </p>
                      </div>
                    </div>

                    {analysis.recommendations.suggested_tests.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2 flex items-center space-x-2">
                            <Thermometer className="h-4 w-4 text-purple-600" />
                            <span>Suggested Tests</span>
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {analysis.recommendations.suggested_tests.map((test, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2" />
                                <span>{test}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Follow-up Questions */}
                {analysis.follow_up_questions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Follow-up Questions</CardTitle>
                      <CardDescription>
                        Answer these questions to get more personalized recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.follow_up_questions.map((question, index) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={`followup-${index}`}>{question}</Label>
                          <Textarea
                            id={`followup-${index}`}
                            placeholder="Your answer..."
                            value={followUpAnswers[question] || ''}
                            onChange={(e) => setFollowUpAnswers(prev => ({
                              ...prev,
                              [question]: e.target.value
                            }))}
                            rows={2}
                          />
                        </div>
                      ))}
                      <Button onClick={handleFollowUpSubmit} className="w-full">
                        Submit Follow-up Answers
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!loading && !analysis && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
                  <p className="text-gray-600">
                    Fill out the form on the left to get started with your symptom analysis.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
