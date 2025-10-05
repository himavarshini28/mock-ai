import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  BrainCircuit, 
  Plus, 
  Upload, 
  FileText, 
  Calendar, 
  User, 
  LogOut,
  BarChart3,
  Target,
  Clock
} from 'lucide-react'
import { AppDispatch, RootState } from '../store'
import { logoutUser } from '../store/slices/authSlice'
import { uploadResume, fetchCandidates } from '../store/slices/candidateSlice'
import { fetchInterviews, createInterview } from '../store/slices/interviewSlice'

const DashboardPage = () => {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  
  const { user } = useSelector((state: RootState) => state.auth)
  const { candidates, currentCandidate, isLoading: candidateLoading } = useSelector((state: RootState) => state.candidate) as {
    candidates: any[],
    currentCandidate: any,
    isLoading: boolean
  }
  const { interviews, isLoading: interviewLoading } = useSelector((state: RootState) => state.interview) as {
    interviews: any[],
    isLoading: boolean
  }

  useEffect(() => {
    dispatch(fetchCandidates())
    dispatch(fetchInterviews())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logoutUser())
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('resume', selectedFile)

    console.log('Starting file upload...', selectedFile.name)
    
    const result = await dispatch(uploadResume(formData))
    
    if (uploadResume.fulfilled.match(result)) {
      console.log('Upload successful:', result.payload)
      toast.success('Resume uploaded successfully!')
      setShowUploadModal(false)
      setSelectedFile(null)
      // Refresh candidates list
      dispatch(fetchCandidates())
    } else if (uploadResume.rejected.match(result)) {
      console.error('Upload failed:', result.payload)
      toast.error(result.payload as string || 'Failed to upload resume')
    }
  }

  const handleCreateInterview = async (data: {
    jobPosition: string
    experienceLevel: string
    techStack: string[]
  }) => {
    if (!currentCandidate) {
      toast.error('Please upload a resume first')
      return
    }

    try {
      const result = await dispatch(createInterview({
        candidateId: currentCandidate._id,
        ...data
      }))
      if (createInterview.fulfilled.match(result)) {
        toast.success('Interview created successfully!')
        navigate(`/interview/${result.payload._id}`)
      }
    } catch (error) {
      toast.error('Failed to create interview')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="container-max section-padding">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-neutral-900">InterviewAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-neutral-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-max section-padding py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Interviews</p>
                <p className="text-2xl font-bold text-neutral-900">{interviews.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Avg Score</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {interviews.length > 0 ? '85%' : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Target className="h-6 w-6 text-primary-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Practice Time</p>
                <p className="text-2xl font-bold text-neutral-900">12h</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <Clock className="h-6 w-6 text-primary-500" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center"
              >
                <Upload className="h-5 w-5 text-primary-500 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-neutral-900">Upload Resume</p>
                  <p className="text-sm text-neutral-600">Upload your resume for analysis</p>
                </div>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!currentCandidate}
                className="w-full p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5 text-primary-500 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-neutral-900">Start New Interview</p>
                  <p className="text-sm text-neutral-600">Begin a practice interview session</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Recent Interviews */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Recent Interviews</h2>
            {interviews.length > 0 ? (
              <div className="space-y-3">
                {interviews.slice(0, 3).map((interview: any) => (
                  <div
                    key={interview._id}
                    className="p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/interview/${interview._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">{interview.jobPosition}</p>
                        <p className="text-sm text-neutral-600">{interview.experienceLevel}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary-500">{interview.status}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">No interviews yet</p>
                <p className="text-sm text-neutral-500">Start your first practice interview</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 section-padding">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Upload Resume</h3>
            <form onSubmit={handleFileUpload}>
              <div className="mb-4">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full p-3 border border-neutral-300 rounded-lg"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || candidateLoading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {candidateLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Interview Modal */}
      {showCreateModal && (
        <CreateInterviewModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateInterview}
          isLoading={interviewLoading}
        />
      )}
    </div>
  )
}

interface CreateInterviewModalProps {
  onClose: () => void
  onSubmit: (data: { jobPosition: string; experienceLevel: string; techStack: string[] }) => void
  isLoading: boolean
}

const CreateInterviewModal: React.FC<CreateInterviewModalProps> = ({
  onClose,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    jobPosition: '',
    experienceLevel: 'junior',
    techStack: [] as string[]
  })

  const techOptions = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'Go', 'Rust', 'Docker', 'Kubernetes', 'AWS', 'MongoDB', 'PostgreSQL'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.jobPosition || formData.techStack.length === 0) {
      toast.error('Please fill all required fields')
      return
    }
    onSubmit(formData)
  }

  const toggleTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 section-padding">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Create New Interview</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Job Position *
            </label>
            <input
              type="text"
              value={formData.jobPosition}
              onChange={(e) => setFormData(prev => ({ ...prev, jobPosition: e.target.value }))}
              className="input-field"
              placeholder="e.g., Frontend Developer, Full Stack Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Experience Level
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
              className="input-field"
            >
              <option value="junior">Junior (0-2 years)</option>
              <option value="mid">Mid-level (2-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tech Stack * (Select relevant technologies)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {techOptions.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTech(tech)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    formData.techStack.includes(tech)
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Start Interview'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default DashboardPage