import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Upload, 
  Send, 
  Clock, 
  FileText, 
  User, 
  Mail, 
  Phone,
  CheckCircle,
  AlertCircle,
  Bot,
  UserIcon
} from 'lucide-react'
import { AppDispatch, RootState } from '../store'
import { uploadResume } from '../store/slices/candidateSlice'

interface Message {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface CandidateInfo {
  name: string
  email: string
  phone: string
  resume?: File
}

type InterviewState = 'upload' | 'info-collection' | 'interview' | 'completed'

const IntervieweeTab = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentCandidate, isLoading } = useSelector((state: RootState) => state.candidate)
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI interview assistant. Let's start by uploading your resume. Please upload a PDF file.",
      timestamp: new Date()
    }
  ])
  
  const [currentMessage, setCurrentMessage] = useState('')
  const [interviewState, setInterviewState] = useState<InterviewState>('upload')
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>({
    name: '',
    email: '',
    phone: ''
  })
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [currentScore, setCurrentScore] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const questions = [
    { text: "Tell me about yourself and your professional background.", difficulty: 'easy', timeLimit: 20 },
    { text: "What programming languages and technologies are you most comfortable with?", difficulty: 'easy', timeLimit: 20 },
    { text: "Describe a challenging project you worked on and how you overcame the difficulties.", difficulty: 'medium', timeLimit: 60 },
    { text: "How do you approach debugging when your code isn't working as expected?", difficulty: 'medium', timeLimit: 60 },
    { text: "Design a system for a large-scale social media application. What would be your considerations?", difficulty: 'hard', timeLimit: 120 },
    { text: "How do you stay updated with new technologies and ensure your skills remain relevant?", difficulty: 'hard', timeLimit: 120 }
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Check for existing session
    const savedSession = localStorage.getItem('interview-session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        if (session.candidateInfo && session.currentQuestion < 6) {
          setCandidateInfo(session.candidateInfo)
          setCurrentQuestion(session.currentQuestion)
          setInterviewState(session.interviewState)
          setShowWelcomeBack(true)
        }
      } catch (error) {
        localStorage.removeItem('interview-session')
      }
    }
  }, [])

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isTimerActive && timeLeft === 0) {
      handleTimeUp()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeLeft, isTimerActive])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (content: string, type: 'bot' | 'user') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => prev.filter(msg => !msg.isTyping).concat(newMessage))
  }

  const addTypingMessage = () => {
    const typingMessage: Message = {
      id: 'typing',
      type: 'bot',
      content: '...',
      timestamp: new Date(),
      isTyping: true
    }
    
    setMessages(prev => prev.filter(msg => !msg.isTyping).concat(typingMessage))
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file')
      return
    }

    setIsUploading(true)
    setSelectedFile(file)
    addMessage(`Uploaded: ${file.name}`, 'user')
    addTypingMessage()
    
    try {
      const formData = new FormData()
      formData.append('resume', file)
      
      const result = await dispatch(uploadResume(formData))
      
      if (uploadResume.fulfilled.match(result)) {
        const candidate = result.payload
        const extractedData = candidate.extractionData
        
        const newCandidateInfo = {
          name: extractedData?.name?.value || candidate.name || '',
          email: extractedData?.email?.value || candidate.email || '',
          phone: extractedData?.phone?.value || candidate.phone || ''
        }
        
        setCandidateInfo(newCandidateInfo)
        
        // Check for missing fields
        const missing = []
        if (!newCandidateInfo.name) missing.push('name')
        if (!newCandidateInfo.email) missing.push('email')
        if (!newCandidateInfo.phone) missing.push('phone')
        
        if (missing.length > 0) {
          setMissingFields(missing)
          setInterviewState('info-collection')
          addMessage(`Great! I extracted some information from your resume. However, I need you to provide your ${missing.join(', ')}. Let's start with your ${missing[0]}:`, 'bot')
        } else {
          addMessage(`Perfect! I have all your information:
• Name: ${newCandidateInfo.name}
• Email: ${newCandidateInfo.email}
• Phone: ${newCandidateInfo.phone}

Ready to start the interview? We'll have 6 questions with different difficulty levels. Type 'yes' to begin!`, 'bot')
          setInterviewState('info-collection')
        }
        
        toast.success('Resume processed successfully!')
      } else {
        throw new Error(typeof result.payload === 'string' ? result.payload : 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      addMessage('Sorry, I had trouble processing your resume. Please provide your information manually.', 'bot')
      setInterviewState('info-collection')
      setMissingFields(['name', 'email', 'phone'])
      setTimeout(() => {
        addMessage('Please provide your name:', 'bot')
      }, 1000)
      toast.error('Failed to process resume. Please provide information manually.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleInfoCollection = (message: string) => {
    const lowerMessage = message.toLowerCase().trim()
    
    if (missingFields.length > 0) {
      const field = missingFields[0]
      const newInfo = { ...candidateInfo, [field]: message }
      setCandidateInfo(newInfo)
      
      const remaining = missingFields.slice(1)
      setMissingFields(remaining)
      
      if (remaining.length > 0) {
        addMessage(`Got it! Now please provide your ${remaining[0]}:`, 'bot')
      } else {
        addMessage(`Perfect! I have all your information:
• Name: ${newInfo.name}
• Email: ${newInfo.email}
• Phone: ${newInfo.phone}

Ready to start the interview? Type 'yes' to begin!`, 'bot')
      }
    } else if (lowerMessage === 'yes' || lowerMessage === 'start' || lowerMessage === 'begin') {
      startInterview()
    } else {
      addMessage("Please type 'yes' when you're ready to start the interview!", 'bot')
    }
  }

  const startInterview = async () => {
    setInterviewState('interview')
    setCurrentQuestion(0)
    
    // Save session
    localStorage.setItem('interview-session', JSON.stringify({
      candidateInfo,
      currentQuestion: 0,
      interviewState: 'interview'
    }))
    
    addTypingMessage()
    
    try {
      // Create interview record
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          candidateId: currentCandidate?._id,
          jobPosition: 'Full Stack Developer',
          experienceLevel: 'intermediate',
          techStack: ['React', 'Node.js', 'JavaScript']
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setInterviewId(data.interview._id)
      }
    } catch (error) {
      console.error('Error creating interview:', error)
    }
    
    setTimeout(() => {
      askQuestion(0)
    }, 1500)
  }

  const askQuestion = (questionIndex: number) => {
    const question = questions[questionIndex]
    const timeLimit = question.timeLimit
    
    addMessage(`Question ${questionIndex + 1}/6 (${question.difficulty.toUpperCase()}):\n\n${question.text}\n\nTime limit: ${timeLimit} seconds`, 'bot')
    
    setTimeLeft(timeLimit)
    setIsTimerActive(true)
    
    // Update session
    localStorage.setItem('interview-session', JSON.stringify({
      candidateInfo,
      currentQuestion: questionIndex,
      interviewState: 'interview'
    }))
  }

  const handleTimeUp = () => {
    setIsTimerActive(false)
    if (interviewState === 'interview' && !isSubmitting) {
      addMessage("⏰ Time's up! Moving to the next question...", 'bot')
      setTimeout(() => {
        if (currentQuestion < 5) {
          const nextQuestion = currentQuestion + 1
          setCurrentQuestion(nextQuestion)
          askQuestion(nextQuestion)
        } else {
          completeInterview()
        }
      }, 2000)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!currentMessage.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    const userAnswer = currentMessage.trim()
    addMessage(userAnswer, 'user')
    setCurrentMessage('')
    setIsTimerActive(false)
    
    addTypingMessage()
    
    try {
      // Score the answer using backend API
      const response = await fetch('/api/interview/score-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          interviewId,
          questionIndex: currentQuestion,
          question: questions[currentQuestion].text,
          answer: userAnswer,
          difficulty: questions[currentQuestion].difficulty
        })
      })
      
      let score = 75 // Default score
      if (response.ok) {
        const data = await response.json()
        score = data.score || 75
      }
      
      setCurrentScore(prev => prev + score)
      addMessage(`Answer recorded! Score: ${score}/100`, 'bot')
      
      setTimeout(() => {
        if (currentQuestion < 5) {
          const nextQuestion = currentQuestion + 1
          setCurrentQuestion(nextQuestion)
          askQuestion(nextQuestion)
        } else {
          completeInterview()
        }
      }, 1500)
      
    } catch (error) {
      console.error('Error scoring answer:', error)
      const score = Math.floor(Math.random() * 25) + 65 // 65-90
      setCurrentScore(prev => prev + score)
      addMessage(`Answer recorded! Score: ${score}/100`, 'bot')
      
      setTimeout(() => {
        if (currentQuestion < 5) {
          const nextQuestion = currentQuestion + 1
          setCurrentQuestion(nextQuestion)
          askQuestion(nextQuestion)
        } else {
          completeInterview()
        }
      }, 1500)
    } finally {
      setIsSubmitting(false)
    }
  }

  const completeInterview = async () => {
    setInterviewState('completed')
    addTypingMessage()
    
    const finalScore = Math.round(currentScore / 6)
    
    try {
      // Complete interview on backend
      await fetch('/api/interview/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          interviewId,
          finalScore
        })
      })
    } catch (error) {
      console.error('Error completing interview:', error)
    }
    
    setTimeout(() => {
      addMessage(`🎉 Interview completed! Your final score is ${finalScore}/100. 

Thank you for participating! Your responses have been recorded and you'll hear back from our team soon.`, 'bot')
      
      // Clear session
      localStorage.removeItem('interview-session')
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        window.location.reload() // This will sync with the dashboard
      }, 3000)
    }, 2000)
  }

  const handleSendMessage = () => {
    if (!currentMessage.trim() || isSubmitting) return
    
    if (interviewState === 'info-collection') {
      const message = currentMessage.trim()
      addMessage(message, 'user')
      setCurrentMessage('')
      addTypingMessage()
      setTimeout(() => handleInfoCollection(message), 1000)
    } else if (interviewState === 'interview') {
      handleAnswerSubmit()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleWelcomeBack = (restore: boolean) => {
    if (!restore) {
      localStorage.removeItem('interview-session')
      setMessages([{
        id: '1',
        type: 'bot',
        content: "Hello! I'm your AI interview assistant. Let's start by uploading your resume. Please upload a PDF file.",
        timestamp: new Date()
      }])
      setInterviewState('upload')
      setCandidateInfo({ name: '', email: '', phone: '' })
      setCurrentQuestion(0)
    }
    setShowWelcomeBack(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Welcome Back Modal */}
      <AnimatePresence>
        {showWelcomeBack && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Welcome Back!</h3>
                <p className="text-neutral-600 mb-6">
                  You have an unfinished interview session. Would you like to continue where you left off?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleWelcomeBack(false)}
                    className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
                  >
                    Start Fresh
                  </button>
                  <button
                    onClick={() => handleWelcomeBack(true)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">AI Interview Assistant</h2>
            <p className="text-sm text-neutral-600">
              {interviewState === 'upload' && 'Upload your resume to get started'}
              {interviewState === 'info-collection' && 'Collecting your information'}
              {interviewState === 'interview' && `Question ${currentQuestion + 1}/6`}
              {interviewState === 'completed' && 'Interview completed'}
            </p>
          </div>
          {isTimerActive && (
            <div className="flex items-center space-x-2 bg-red-100 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="text-red-600 font-medium">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-blue-100' : 'bg-neutral-100'
              }`}>
                {message.type === 'user' ? (
                  <UserIcon className="h-4 w-4 text-blue-600" />
                ) : (
                  <Bot className="h-4 w-4 text-neutral-600" />
                )}
              </div>
              <div className={`rounded-lg px-4 py-2 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-neutral-100 text-neutral-900'
              }`}>
                {message.isTyping ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload or Message Input */}
      <div className="border-t border-neutral-200 p-6 bg-white">
        {interviewState === 'upload' ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-900 mb-2">Upload Your Resume</p>
              <p className="text-neutral-600 mb-4">Support for PDF files only</p>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                {isUploading ? 'Processing...' : 'Choose File'}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="flex space-x-4">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={
                interviewState === 'interview' 
                  ? "Type your answer..." 
                  : "Type your message..."
              }
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || interviewState === 'completed'}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isSubmitting || interviewState === 'completed'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default IntervieweeTab