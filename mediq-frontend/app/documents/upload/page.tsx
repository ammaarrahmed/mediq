'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Image, CheckCircle, AlertCircle, Heart, ArrowLeft, Eye } from 'lucide-react'
import { useAuth, getAuthHeaders } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface UploadedFile {
  file: File
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  result?: {
    extracted_text: string
    medical_data: {
      vital_signs?: Record<string, string>
      medications?: Array<{ name: string; dosage: string }>
      diagnoses?: string[]
      allergies?: string[]
      lab_results?: Record<string, string>
    }
  }
  error?: string
}

export default function DocumentUploadPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload images or PDFs.`,
          variant: "destructive",
        })
        return false
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
          variant: "destructive",
        })
        return false
      }
      
      return true
    })

    const uploadFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      status: 'uploading',
      progress: 0
    }))

    setFiles(prev => [...prev, ...uploadFiles])
    
    // Start uploading each file
    uploadFiles.forEach((uploadFile, index) => {
      uploadDocument(uploadFile, files.length + index)
    })
  }

  const uploadDocument = async (uploadFile: UploadedFile, index: number) => {
    const formData = new FormData()
    formData.append('file', uploadFile.file)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map((f, i) => 
          i === index && f.status === 'uploading' 
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ))
      }, 200)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs/upload`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()

      setFiles(prev => prev.map((f, i) => 
        i === index 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100,
              result: result
            }
          : f
      ))

      toast({
        title: "Document uploaded successfully",
        description: `${uploadFile.file.name} has been processed and analyzed.`,
      })

    } catch (error) {
      setFiles(prev => prev.map((f, i) => 
        i === index 
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : f
      ))

      toast({
        title: "Upload failed",
        description: `Failed to upload ${uploadFile.file.name}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  if (!user) {
    router.push('/auth/login')
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Medical Documents</h1>
          <p className="text-gray-600">
            Upload your medical documents for AI-powered analysis and extraction of key information.
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Drag and drop files or click to browse. Supports images (JPG, PNG) and PDFs up to 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop your medical documents here
              </h3>
              <p className="text-gray-600 mb-4">
                or click to browse your files
              </p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>Choose Files</span>
                </Button>
              </label>
              <div className="mt-4 text-sm text-gray-500">
                <p>Supported formats: JPG, PNG, PDF</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Uploaded Documents</h2>
            {files.map((uploadFile, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {uploadFile.file.type.startsWith('image/') ? (
                        <Image className="h-8 w-8 text-blue-600" />
                      ) : (
                        <FileText className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {uploadFile.file.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {uploadFile.status === 'completed' && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {uploadFile.status === 'error' && (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                          <Badge variant={
                            uploadFile.status === 'completed' ? 'default' :
                            uploadFile.status === 'error' ? 'destructive' :
                            'secondary'
                          }>
                            {uploadFile.status === 'uploading' ? 'Uploading' :
                             uploadFile.status === 'processing' ? 'Processing' :
                             uploadFile.status === 'completed' ? 'Completed' :
                             'Error'}
                          </Badge>
                        </div>
                      </div>
                      
                      {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                        <Progress value={uploadFile.progress} className="mb-2" />
                      )}
                      
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <p className="text-sm text-red-600 mb-2">{uploadFile.error}</p>
                      )}
                      
                      {uploadFile.status === 'completed' && uploadFile.result && (
                        <div className="mt-4 space-y-4">
                          {/* Extracted Text Preview */}
                          {uploadFile.result.extracted_text && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Extracted Text</h4>
                              <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                                {uploadFile.result.extracted_text.substring(0, 200)}
                                {uploadFile.result.extracted_text.length > 200 && '...'}
                              </div>
                            </div>
                          )}
                          
                          {/* Medical Data */}
                          {uploadFile.result.medical_data && (
                            <div className="grid md:grid-cols-2 gap-4">
                              {uploadFile.result.medical_data.vital_signs && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Vital Signs</h4>
                                  <div className="space-y-1">
                                    {Object.entries(uploadFile.result.medical_data.vital_signs).map(([key, value]) => (
                                      <div key={key} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{key}:</span>
                                        <span className="font-medium">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {uploadFile.result.medical_data.medications && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Medications</h4>
                                  <div className="space-y-1">
                                    {uploadFile.result.medical_data.medications.map((med, i) => (
                                      <div key={i} className="text-sm">
                                        <span className="font-medium">{med.name}</span>
                                        {med.dosage && <span className="text-gray-600"> - {med.dosage}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
