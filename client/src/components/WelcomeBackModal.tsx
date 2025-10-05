import React from 'react'
import { motion } from 'framer-motion'
import { Clock, RotateCcw, X } from 'lucide-react'

interface WelcomeBackModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  candidateName: string
  questionsCompleted: number
  totalQuestions: number
  timeElapsed: string
}

const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  candidateName,
  questionsCompleted,
  totalQuestions,
  timeElapsed
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Welcome Back!</h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-neutral-700 mb-4">
            We found an unfinished interview session for <strong>{candidateName}</strong>.
          </p>
          
          <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Progress:</span>
              <span className="text-sm font-medium text-neutral-900">
                {questionsCompleted} of {totalQuestions} questions
              </span>
            </div>
            
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questionsCompleted / totalQuestions) * 100}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Time elapsed:</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-900">{timeElapsed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Start Fresh
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Interview
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default WelcomeBackModal