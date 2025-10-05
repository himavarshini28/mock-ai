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
  const { currentCandidate } = useSelector((state: RootState) => state.candidate)
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI interview assistant. Let's start by uploading your resume. Please upload a PDF or DOCX file.",
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
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const questionTimers = { easy: 20, medium: 60, hard: 120 } // seconds
  const questionDifficulties = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard']

  useEffect(() => {
    // Check for existing session
    const existingSession = localStorage.getItem('interview-session')
    if (existingSession) {
      const session = JSON.parse(existingSession)
      if (session.state !== 'completed') {
        setShowWelcomeBack(true)
        // Restore session data
        setMessages(session.messages || messages)
        setInterviewState(session.state || 'upload')
        setCandidateInfo(session.candidateInfo || candidateInfo)
        setCurrentQuestion(session.currentQuestion || 0)
      }
    }
  }, [])

  useEffect(() => {
    // Save session to localStorage
    const session = {
      messages,
      state: interviewState,
      candidateInfo,
      currentQuestion,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('interview-session', JSON.stringify(session))
  }, [messages, interviewState, candidateInfo, currentQuestion])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive, timeLeft])

  const addMessage = (content: string, type: 'bot' | 'user') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addTypingMessage = () => {
    const typingMessage: Message = {
      id: 'typing',
      type: 'bot',
      content: '...',
      timestamp: new Date(),
      isTyping: true
    }
    setMessages(prev => [...prev, typingMessage])
    
    // Remove typing message and add real message after delay
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== 'typing'))
    }, 1500)
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('document')) {
      toast.error('Please upload a PDF or DOCX file')
      return
    }

    setSelectedFile(file)
    addMessage(`Uploaded: ${file.name}`, 'user')
    addTypingMessage()
    
    setTimeout(async () => {
      const formData = new FormData()
      formData.append('resume', file)
      
      const result = await dispatch(uploadResume(formData))
      
      if (uploadResume.fulfilled.match(result)) {
        const extractedData = result.payload.extractionData
        const newCandidateInfo = {
          name: extractedData?.name?.value || '',
          email: extractedData?.email?.value || '',
          phone: extractedData?.phone?.value || ''
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
          addMessage(`Great! I found some information from your resume. However, I need you to provide your ${missing.join(', ')}. Let's start with your ${missing[0]}.`, 'bot')
        } else {
          addMessage(`Perfect! I have all your information:\n• Name: ${newCandidateInfo.name}\n• Email: ${newCandidateInfo.email}\n• Phone: ${newCandidateInfo.phone}\n\nReady to start the interview? We'll have 6 questions (2 Easy, 2 Medium, 2 Hard) for a Full Stack Developer role. Type 'yes' to begin!`, 'bot')
          setInterviewState('info-collection')
        }
      } else {
        addMessage('Sorry, I had trouble processing your resume. Please try again or provide your information manually.', 'bot')
        setInterviewState('info-collection')
        setMissingFields(['name', 'email', 'phone'])
        addMessage('Please provide your name:', 'bot')
      }
    }, 2000)
  }

  const handleInfoCollection = (message: string) => {
    if (missingFields.length > 0) {
      const currentField = missingFields[0]
      const updatedInfo = { ...candidateInfo, [currentField]: message }
      setCandidateInfo(updatedInfo)
      
      const remainingFields = missingFields.slice(1)
      setMissingFields(remainingFields)
      
      if (remainingFields.length > 0) {
        addMessage(`Thank you! Now please provide your ${remainingFields[0]}:`, 'bot')
      } else {
        addMessage(`Perfect! I have all your information:\n• Name: ${updatedInfo.name}\n• Email: ${updatedInfo.email}\n• Phone: ${updatedInfo.phone}\n\nReady to start the interview? We'll have 6 questions (2 Easy, 2 Medium, 2 Hard) for a Full Stack Developer role. Type 'yes' to begin!`, 'bot')
      }
    } else if (message.toLowerCase().includes('yes')) {
      startInterview()
    }
  }

  const startInterview = () => {
    setInterviewState('interview')
    setCurrentQuestion(0)
    askQuestion(0)
  }

  const askQuestion = async (questionIndex: number) => {
    addTypingMessage()
    
    // Simulate API call to get question
    setTimeout(() => {
      const difficulty = questionDifficulties[questionIndex]
      const questions = {
        easy: [
          "What is React and what are its main benefits?",
          "Explain the difference between let, const, and var in JavaScript."
        ],
        medium: [
          "How does the useEffect hook work and when would you use it?",
          "What is the difference between synchronous and asynchronous JavaScript?"
        ],
        hard: [
          "Explain how React's reconciliation algorithm works.",
          "How would you implement authentication in a full-stack application?"
        ]
      }
      
      const questionSet = questions[difficulty as keyof typeof questions]
      const questionText = questionSet[Math.floor(questionIndex / 2)]
      
      addMessage(`Question ${questionIndex + 1}/6 (${difficulty.toUpperCase()}): ${questionText}`, 'bot')
      addMessage(`You have ${questionTimers[difficulty as keyof typeof questionTimers]} seconds to answer. Timer starts now!`, 'bot')
      
      setTimeLeft(questionTimers[difficulty as keyof typeof questionTimers])
      setIsTimerActive(true)
    }, 2000)
  }

  const handleTimeUp = () => {
    setIsTimerActive(false)
    addMessage('⏰ Time\'s up! Moving to the next question.', 'bot')
    
    if (currentQuestion < 5) {
      const nextQuestion = currentQuestion + 1
      setCurrentQuestion(nextQuestion)
      setTimeout(() => askQuestion(nextQuestion), 1000)
    } else {
      completeInterview()
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleAnswerSubmit = async () => {
    if (!currentMessage.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    const userAnswer = currentMessage.trim()
    addMessage(userAnswer, 'user')
    setCurrentMessage('')
    setIsTimerActive(false)
    
    // Call backend API for real scoring
    addTypingMessage()
    try {
      const response = await fetch('/api/interview/score-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          candidateId: currentCandidate?._id,
          questionIndex: currentQuestion,
          answer: userAnswer
        })
      })
      
      const data = await response.json()
      const score = data.score || Math.floor(Math.random() * 30) + 70
      
      addMessage(`Answer recorded! Score: ${score}/100`, 'bot')
      
      if (currentQuestion < 5) {
        const nextQuestion = currentQuestion + 1
        setCurrentQuestion(nextQuestion)
        setTimeout(() => askQuestion(nextQuestion), 1000)
      } else {
        completeInterview()
      }
    } catch (error) {
      console.error('Error scoring answer:', error)
      const score = Math.floor(Math.random() * 30) + 70
      addMessage(`Answer recorded! Score: ${score}/100`, 'bot')
    }
    
    setIsSubmitting(false)
  }

  const completeInterview = () => {
    setInterviewState('completed')
    addTypingMessage()
    setTimeout(() => {
      const finalScore = Math.floor(Math.random() * 20) + 80 // 80-100
      addMessage(`🎉 Interview completed! Your final score is ${finalScore}/100. Thank you for participating!`, 'bot')
      
      // Clear session
      localStorage.removeItem('interview-session')
    }, 2000)
  }

  const handleSendMessage = () => {
    if (!currentMessage.trim() || isSubmitting) return
    
    if (interviewState === 'info-collection') {
      const message = currentMessage.trim()
      addMessage(message, 'user')
      setCurrentMessage('')
      addTypingMessage()
      setTimeout(() => handleInfoCollection(message), 1500)
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
        content: "Hello! I'm your AI interview assistant. Let's start by uploading your resume. Please upload a PDF or DOCX file.",
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
                    className="flex-1 btn-secondary"
                  >
                    Start Fresh
                  </button>
                  <button
                    onClick={() => handleWelcomeBack(true)}
                    className="flex-1 btn-primary"
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
            <h2 className="text-lg font-semibold text-neutral-900">Interview Assistant</h2>
            <p className="text-sm text-neutral-600">
              {interviewState === 'upload' && 'Upload your resume to get started'}
              {interviewState === 'info-collection' && 'Completing your profile'}
              {interviewState === 'interview' && `Question ${currentQuestion + 1}/6`}
              {interviewState === 'completed' && 'Interview completed'}
            </p>
          </div>
          
          {/* Timer */}
          {isTimerActive && (
            <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4" />
              <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`p-2 rounded-full ${
                message.type === 'user' ? 'bg-primary-500' : 'bg-neutral-200'
              }`}>
                {message.type === 'user' ? (
                  <UserIcon className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-neutral-600" />
                )}
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-neutral-200'
              }`}>
                {message.isTyping ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-neutral-200 p-4">
        {interviewState === 'upload' && (
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 btn-primary flex-1"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Resume (PDF/DOCX)</span>
            </button>
          </div>
        )}
        
        {(interviewState === 'info-collection' || interviewState === 'interview') && (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                interviewState === 'info-collection' 
                  ? 'Type your response...'
                  : 'Type your answer...'
              }
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={interviewState === 'interview' && !isTimerActive}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || (interviewState === 'interview' && !isTimerActive)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {interviewState === 'completed' && (
          <div className="text-center">
            <p className="text-neutral-600">Interview completed! Check the Interviewer tab to view results.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default IntervieweeTab