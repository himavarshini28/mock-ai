import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  BrainCircuit, 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  Clock,
  BarChart3,
  Award,
  MessageSquare,
  Play,
  AlertCircle
} from 'lucide-react'
import { AppDispatch, RootState } from '../store'
import { 
  submitAnswer, 
  nextQuestion, 
  resetQuestionIndex, 
  fetchInterview, 
  startInterview,
  setCurrentQuestion,
  setInterviewStarted
} from '../store/slices/interviewSlice'

const InterviewPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  
  const { 
    currentInterview, 
    currentQuestionIndex, 
    currentQuestion, 
    isInterviewStarted, 
    isLoading 
  } = useSelector((state: RootState) => state.interview) as {
    currentInterview: any,
    currentQuestionIndex: number,
    currentQuestion: any,
    isInterviewStarted: boolean,
    isLoading: boolean
  }

  useEffect(() => {
    if (id) {
      // First, fetch the interview data
      dispatch(fetchInterview(id))
    }
  }, [id, dispatch])

  useEffect(() => {
    // Check if this is a returning user to a pending interview (only on initial load)
    if (currentInterview && currentInterview.status === 'pending' && currentInterview.questions.length > 0 && !isInterviewStarted) {
      setShowWelcomeModal(true)
      dispatch(setInterviewStarted(true))
      // Set current question based on progress
      const lastAnsweredIndex = currentInterview.questions.findIndex((q: any) => !q.answer)
      const questionIndex = lastAnsweredIndex === -1 ? currentInterview.questions.length : lastAnsweredIndex
      dispatch(resetQuestionIndex())
      for (let i = 0; i < questionIndex; i++) {
        dispatch(nextQuestion())
      }
      if (questionIndex < currentInterview.questions.length) {
        dispatch(setCurrentQuestion(currentInterview.questions[questionIndex]))
      }
    }
  }, [currentInterview, dispatch, isInterviewStarted])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    return () => {
      dispatch(resetQuestionIndex())
      dispatch(setInterviewStarted(false))
    }
  }, [dispatch])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartInterview = async () => {
    if (!id) return
    
    try {
      const result = await dispatch(startInterview(id))
      if (startInterview.fulfilled.match(result)) {
        dispatch(setInterviewStarted(true))
        toast.success('Interview started! Good luck!')
      }
    } catch (error) {
      toast.error('Failed to start interview')
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer')
      return
    }

    if (!currentInterview) {
      toast.error('Interview not found')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await dispatch(submitAnswer({
        interviewId: currentInterview._id,
        questionIndex: currentQuestionIndex,
        answer: currentAnswer.trim()
      }))

      if (submitAnswer.fulfilled.match(result)) {
        toast.success('Answer submitted successfully!')
        setCurrentAnswer('')
        
        // Check if the interview is complete
        if (result.payload.isInterviewComplete) {
          toast.success('Interview completed! Redirecting to dashboard...')
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        } else {
          // Move to next question
          dispatch(nextQuestion())
          
          // Use the next question from the response
          if (result.payload.nextQuestion) {
            dispatch(setCurrentQuestion(result.payload.nextQuestion))
          } else {
            // Fallback: generate next question if not provided
            console.warn('No next question provided in response')
          }
        }
      }
    } catch (error) {
      toast.error('Failed to submit answer')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <BrainCircuit className="h-12 w-12 text-primary-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-neutral-600">Loading interview...</p>
        </div>
      </div>
    )
  }

  if (!currentInterview) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-neutral-600">Interview not found</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Show start interview screen for new interviews
  if (!isInterviewStarted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <BrainCircuit className="h-16 w-16 text-primary-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            Ready to Start Your Interview?
          </h1>
          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-center justify-between py-2 border-b border-neutral-200">
              <span className="text-neutral-600">Position:</span>
              <span className="font-medium">{currentInterview.jobPosition}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-200">
              <span className="text-neutral-600">Level:</span>
              <span className="font-medium capitalize">{currentInterview.experienceLevel}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-neutral-600">Questions:</span>
              <span className="font-medium">6 questions</span>
            </div>
          </div>
          <button
            onClick={handleStartInterview}
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center"
          >
            <Play className="h-5 w-5 mr-2" />
            {isLoading ? 'Starting...' : 'Start Interview'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full btn-secondary mt-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestionIndex + 1) / 6) * 100

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Welcome Back Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Welcome Back!</h3>
              <p className="text-neutral-600 mb-6">
                You have an interview in progress. You can continue where you left off.
              </p>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="btn-primary w-full"
              >
                Continue Interview
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="container-max section-padding">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </button>
              <div className="h-6 w-px bg-neutral-300" />
              <div className="flex items-center space-x-2">
                <BrainCircuit className="h-6 w-6 text-primary-500" />
                <span className="font-semibold text-neutral-900">{currentInterview.jobPosition}</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-neutral-500" />
                <span className="text-sm text-neutral-600">{formatTime(timeElapsed)}</span>
              </div>
              <div className="text-sm text-neutral-600">
                {currentQuestionIndex + 1} of 6
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-max section-padding py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Interview Progress</span>
            <span className="text-sm text-neutral-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <motion.div
              className="bg-primary-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Interview Area */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="card mb-6"
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    Question {currentQuestionIndex + 1}
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {currentQuestion?.text || currentQuestion?.question || 'Loading question...'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Answer Section */}
            <div className="card">
              <h4 className="font-semibold text-neutral-900 mb-4">Your Answer</h4>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={8}
                className="w-full p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200 resize-none"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-neutral-500">
                  {currentAnswer.length} characters
                </span>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !currentAnswer.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Answer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Interview Info */}
            <div className="card">
              <h4 className="font-semibold text-neutral-900 mb-4">Interview Details</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-neutral-600">Position</span>
                  <p className="font-medium text-neutral-900">{currentInterview.jobPosition}</p>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">Level</span>
                  <p className="font-medium text-neutral-900 capitalize">{currentInterview.experienceLevel}</p>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">Tech Stack</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentInterview.techStack?.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Answers */}
            {currentQuestionIndex > 0 && (
              <div className="card">
                <h4 className="font-semibold text-neutral-900 mb-4">Previous Questions</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {currentInterview.questions?.slice(0, currentQuestionIndex).map((q: any, index: number) => (
                    <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-700 mb-2">
                        Q{index + 1}: {q.question?.substring(0, 60)}...
                      </p>
                      {q.score && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">
                            Score: {q.score}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="flex items-center space-x-2 mb-3">
                <Award className="h-5 w-5 text-primary-500" />
                <h4 className="font-semibold text-primary-900">Interview Tips</h4>
              </div>
              <ul className="text-sm text-primary-800 space-y-2">
                <li>• Be specific and provide examples</li>
                <li>• Structure your answers clearly</li>
                <li>• Explain your thought process</li>
                <li>• Mention relevant technologies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewPage