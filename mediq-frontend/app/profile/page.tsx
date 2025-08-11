'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Heart, ArrowLeft, Save, Stethoscope, Calendar, Phone, Mail, MapPin, Shield, Edit } from 'lucide-react'
import { useAuth, getAuthHeaders } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface PatientProfile {
  date_of_birth?: string
  gender?: string
  blood_type?: string
  height?: string
  weight?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_conditions?: string[]
  medications?: string[]
  allergies?: string[]
  insurance_provider?: string
  insurance_policy_number?: string
}

interface DoctorProfile {
  license_number?: string
  specialty?: string
  years_of_experience?: number
  hospital_affiliation?: string
  education?: string
  certifications?: string[]
  consultation_fee?: number
  availability_hours?: string
}

export default function ProfilePage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [basicInfo, setBasicInfo] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    username: user?.username || '',
    phone: '',
    address: ''
  })
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({})
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>({})

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    fetchProfileData()
  }, [user, router])

  const fetchProfileData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      if (user?.role === 'patient') {
        setPatientProfile({
          date_of_birth: '1990-05-15',
          gender: 'Male',
          blood_type: 'O+',
          height: '5\'10"',
          weight: '175 lbs',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '+1-555-0123',
          medical_conditions: ['Hypertension', 'Type 2 Diabetes'],
          medications: ['Metformin 500mg', 'Lisinopril 10mg'],
          allergies: ['Penicillin', 'Shellfish'],
          insurance_provider: 'Blue Cross Blue Shield',
          insurance_policy_number: 'BC123456789'
        })
      } else {
        setDoctorProfile({
          license_number: 'MD123456',
          specialty: 'Internal Medicine',
          years_of_experience: 12,
          hospital_affiliation: 'General Hospital',
          education: 'MD from Harvard Medical School',
          certifications: ['Board Certified Internal Medicine', 'ACLS Certified'],
          consultation_fee: 200,
          availability_hours: 'Mon-Fri 9AM-5PM'
        })
      }
      
      setBasicInfo(prev => ({
        ...prev,
        phone: '+1-555-0100',
        address: '123 Main St, Anytown, ST 12345'
      }))
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    }
  }

  const handleSaveBasicInfo = async () => {
    setLoading(true)
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Profile updated",
        description: "Your basic information has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePatientProfile = async () => {
    setLoading(true)
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Medical profile updated",
        description: "Your medical information has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDoctorProfile = async () => {
    setLoading(true)
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Professional profile updated",
        description: "Your professional information has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
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
          <Badge variant={user.role === 'doctor' ? 'default' : 'secondary'}>
            {user.role === 'doctor' ? 'Healthcare Provider' : 'Patient'}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account information and {user.role === 'doctor' ? 'professional' : 'medical'} details.
          </p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center space-x-2">
              {user.role === 'doctor' ? (
                <Stethoscope className="h-4 w-4" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
              <span>{user.role === 'doctor' ? 'Professional' : 'Medical'}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={basicInfo.first_name}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={basicInfo.last_name}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={basicInfo.email}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={basicInfo.username}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={basicInfo.phone}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={basicInfo.address}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, address: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveBasicInfo} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical/Professional Information */}
          <TabsContent value="medical">
            {user.role === 'patient' ? (
              <div className="space-y-6">
                {/* Personal Health Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5" />
                      <span>Personal Health Information</span>
                    </CardTitle>
                    <CardDescription>
                      Your basic health and demographic information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="dob"
                            type="date"
                            value={patientProfile.date_of_birth}
                            onChange={(e) => setPatientProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Input
                          id="gender"
                          value={patientProfile.gender}
                          onChange={(e) => setPatientProfile(prev => ({ ...prev, gender: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="blood_type">Blood Type</Label>
                        <Input
                          id="blood_type"
                          value={patientProfile.blood_type}
                          onChange={(e) => setPatientProfile(prev => ({ ...prev, blood_type: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          value={patientProfile.height}
                          onChange={(e) => setPatientProfile(prev => ({ ...prev, height: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          value={patientProfile.weight}
                          onChange={(e) => setPatientProfile(prev => ({ ...prev, weight: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Medical History</CardTitle>
                    <CardDescription>
                      Your medical conditions, medications, and allergies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Medical Conditions</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {patientProfile.medical_conditions?.map((condition, index) => (
                          <Badge key={index} variant="secondary">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                      <Textarea
                        placeholder="List your medical conditions (one per line)"
                        value={patientProfile.medical_conditions?.join('\n') || ''}
                        onChange={(e) => setPatientProfile(prev => ({ 
                          ...prev, 
                          medical_conditions: e.target.value.split('\n').filter(Boolean) 
                        }))}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Current Medications</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {patientProfile.medications?.map((medication, index) => (
                          <Badge key={index} variant="outline">
                            {medication}
                          </Badge>
                        ))}
                      </div>
                      <Textarea
                        placeholder="List your current medications with dosages (one per line)"
                        value={patientProfile.medications?.join('\n') || ''}
                        onChange={(e) => setPatientProfile(prev => ({ 
                          ...prev, 
                          medications: e.target.value.split('\n').filter(Boolean) 
                        }))}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Allergies</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {patientProfile.allergies?.map((allergy, index) => (
                          <Badge key={index} variant="destructive">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                      <Textarea
                        placeholder="List your allergies (one per line)"
                        value={patientProfile.allergies?.join('\n') || ''}
                        onChange={(e) => setPatientProfile(prev => ({ 
                          ...prev, 
                          allergies: e.target.value.split('\n').filter(Boolean) 
                        }))}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact & Insurance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contact & Insurance</CardTitle>
                    <CardDescription>
                      Important contact and insurance information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergency_name">Emergency Contact Name</Label>
                        <Input
                          id="emergency_name"
                          value={patientProfile.emergency_contact_name}
                          onChange={(e) => setPatientProfile(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
                        <Input
                          id="emergency_phone"
                          value={patientProfile.emergency_contact_phone}
                          onChange={(e) => setPatientProfile(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="insurance_provider">Insurance Provider</Label>
                        <Input
                          id="insurance_provider"
                          value={patientProfile.insurance_provider}
                          onChange={(e) => setPatientProfile(prev => ({ ...prev, insurance_provider: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="insurance_policy">Policy Number</Label>
                        <Input
                          id="insurance_policy"
                          value={patientProfile.insurance_policy_number}
                          onChange={(e) => setPatientProfile(prev => ({ ...prev, insurance_policy_number: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSavePatientProfile} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Medical Profile'}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Professional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Stethoscope className="h-5 w-5" />
                      <span>Professional Information</span>
                    </CardTitle>
                    <CardDescription>
                      Your medical license and professional details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="license_number">Medical License Number</Label>
                        <Input
                          id="license_number"
                          value={doctorProfile.license_number}
                          onChange={(e) => setDoctorProfile(prev => ({ ...prev, license_number: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Specialty</Label>
                        <Input
                          id="specialty"
                          value={doctorProfile.specialty}
                          onChange={(e) => setDoctorProfile(prev => ({ ...prev, specialty: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          type="number"
                          value={doctorProfile.years_of_experience}
                          onChange={(e) => setDoctorProfile(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hospital">Hospital Affiliation</Label>
                        <Input
                          id="hospital"
                          value={doctorProfile.hospital_affiliation}
                          onChange={(e) => setDoctorProfile(prev => ({ ...prev, hospital_affiliation: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      <Textarea
                        id="education"
                        value={doctorProfile.education}
                        onChange={(e) => setDoctorProfile(prev => ({ ...prev, education: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Certifications</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {doctorProfile.certifications?.map((cert, index) => (
                          <Badge key={index} variant="secondary">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                      <Textarea
                        placeholder="List your certifications (one per line)"
                        value={doctorProfile.certifications?.join('\n') || ''}
                        onChange={(e) => setDoctorProfile(prev => ({ 
                          ...prev, 
                          certifications: e.target.value.split('\n').filter(Boolean) 
                        }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
                        <Input
                          id="consultation_fee"
                          type="number"
                          value={doctorProfile.consultation_fee}
                          onChange={(e) => setDoctorProfile(prev => ({ ...prev, consultation_fee: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="availability">Availability Hours</Label>
                        <Input
                          id="availability"
                          value={doctorProfile.availability_hours}
                          onChange={(e) => setDoctorProfile(prev => ({ ...prev, availability_hours: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSaveDoctorProfile} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Professional Profile'}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Enter a new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirm your new password"
                  />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </Button>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Sharing</p>
                        <p className="text-sm text-gray-600">Allow anonymized data to be used for research</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Account Deletion</p>
                        <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
