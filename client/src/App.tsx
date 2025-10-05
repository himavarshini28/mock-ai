import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import { Toaster } from 'react-hot-toast'
import IntervieweeTab from './components/IntervieweeTab'
import InterviewerTab from './components/InterviewerTab'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { BrainCircuit, MessageSquare, Users } from 'lucide-react'

type TabType = 'interviewee' | 'interviewer'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('interviewee')
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null)
  const { token, user } = useSelector((state: RootState) => state.auth)

  // Show auth pages if not authenticated
  if (!token) {
    if (showAuth === 'login') {
      return (
        <div className="min-h-screen bg-neutral-50">
          <LoginPage />
          <div className="fixed bottom-4 right-4">
            <button
              onClick={() => setShowAuth('register')}
              className="text-primary-500 hover:text-primary-600 underline"
            >
              Need an account? Register
            </button>
          </div>
          <Toaster position="top-right" />
        </div>
      )
    }
    
    if (showAuth === 'register') {
      return (
        <div className="min-h-screen bg-neutral-50">
          <RegisterPage />
          <div className="fixed bottom-4 right-4">
            <button
              onClick={() => setShowAuth('login')}
              className="text-primary-500 hover:text-primary-600 underline"
            >
              Already have an account? Login
            </button>
          </div>
          <Toaster position="top-right" />
        </div>
      )
    }

    // Landing/Auth selection
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <BrainCircuit className="h-16 w-16 text-primary-500 mr-4" />
            <h1 className="text-4xl font-bold text-neutral-900">AI Interview Assistant</h1>
          </div>
          <p className="text-xl text-neutral-600 mb-8">Practice interviews with AI-powered assistance</p>
          <div className="space-x-4">
            <button
              onClick={() => setShowAuth('login')}
              className="btn-primary px-8 py-3 text-lg"
            >
              Login
            </button>
            <button
              onClick={() => setShowAuth('register')}
              className="btn-secondary px-8 py-3 text-lg"
            >
              Register
            </button>
          </div>
        </div>
        <Toaster position="top-right" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with Tabs */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container-max section-padding">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-neutral-900">AI Interview Assistant</span>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('interviewee')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === 'interviewee'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Interviewee</span>
              </button>
              <button
                onClick={() => setActiveTab('interviewer')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === 'interviewer'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Interviewer</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-600">Welcome, {user?.name}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  window.location.reload()
                }}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1">
        {activeTab === 'interviewee' && <IntervieweeTab />}
        {activeTab === 'interviewer' && <InterviewerTab />}
      </main>

      <Toaster position="top-right" />
    </div>
  )
}

export default App