import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  Trophy,
  Clock,
  Star
} from 'lucide-react'
import { AppDispatch, RootState } from '../store'
import { fetchCandidates } from '../store/slices/candidateSlice'

interface Candidate {
  _id: string
  name: string
  email: string
  phone: string
  score: number
  summary: string
  interviewStatus: 'not-started' | 'in-progress' | 'completed'
  createdAt: string
  chatHistory?: any[]
  questions?: any[]
}

type SortField = 'name' | 'score' | 'createdAt'
type SortOrder = 'asc' | 'desc'

const InterviewerTab = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { candidates, isLoading, error } = useSelector((state: RootState) => state.candidate)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    dispatch(fetchCandidates())
    
    // Auto-refresh every 30 seconds to sync data
    const interval = setInterval(() => {
      dispatch(fetchCandidates())
    }, 30000)
    
    return () => clearInterval(interval)
  }, [dispatch])

  // Filter and sort candidates
  const filteredAndSortedCandidates = candidates
    .filter(candidate => {
      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phone.includes(searchTerm)
      
      const matchesStatus = statusFilter === 'all' || candidate.interviewStatus === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]
      
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'not-started': { color: 'bg-gray-100 text-gray-700', label: 'Not Started' },
      'in-progress': { color: 'bg-yellow-100 text-yellow-700', label: 'In Progress' },
      'completed': { color: 'bg-green-100 text-green-700', label: 'Completed' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['not-started']
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setShowDetails(true)
  }

  const mockQuestions = [
    {
      question: "What is React and what are its main benefits?",
      answer: "React is a JavaScript library for building user interfaces...",
      score: 85,
      difficulty: 'easy',
      timeSpent: 18
    },
    {
      question: "Explain the difference between let, const, and var in JavaScript.",
      answer: "Let and const were introduced in ES6 and have block scope...",
      score: 92,
      difficulty: 'easy',
      timeSpent: 15
    },
    {
      question: "How does the useEffect hook work?",
      answer: "useEffect is a React hook that allows you to perform side effects...",
      score: 78,
      difficulty: 'medium',
      timeSpent: 45
    }
  ]

  return (
    <div className="p-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-neutral-600">Loading candidates...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Candidates</p>
              <p className="text-2xl font-bold text-neutral-900">{candidates.length}</p>
            </div>
            <User className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-neutral-900">
                {candidates.filter(c => c.interviewStatus === 'completed').length}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-neutral-900">
                {candidates.filter(c => c.interviewStatus === 'in-progress').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Avg Score</p>
              <p className="text-2xl font-bold text-neutral-900">
                {candidates.length > 0 
                  ? Math.round(candidates.reduce((sum, c) => sum + (c.score || 0), 0) / candidates.length)
                  : 0
                }%
              </p>
            </div>
            <Star className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="not-started">Not Started</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Candidate</span>
                    {sortField === 'name' && (
                      sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Contact
                </th>
                <th 
                  onClick={() => handleSort('score')}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Score</span>
                    {sortField === 'score' && (
                      sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  onClick={() => handleSort('createdAt')}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {sortField === 'createdAt' && (
                      sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredAndSortedCandidates.map((candidate) => (
                <motion.tr
                  key={candidate._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-neutral-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">{candidate.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 flex items-center">
                      <Mail className="h-4 w-4 text-neutral-400 mr-1" />
                      {candidate.email}
                    </div>
                    <div className="text-sm text-neutral-500 flex items-center">
                      <Phone className="h-4 w-4 text-neutral-400 mr-1" />
                      {candidate.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${getScoreColor(candidate.score || 0)}`}>
                      {candidate.score || 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(candidate.interviewStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(candidate)}
                      className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedCandidates.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No candidates found</p>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Details Modal */}
      {showDetails && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{selectedCandidate.name}</h3>
                  <p className="text-sm text-neutral-600">{selectedCandidate.email}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Candidate Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-neutral-400 mr-2" />
                      {selectedCandidate.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-neutral-400 mr-2" />
                      {selectedCandidate.phone}
                    </div>
                  </div>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">Interview Score</h4>
                  <div className={`text-3xl font-bold ${getScoreColor(selectedCandidate.score || 0)}`}>
                    {selectedCandidate.score || 0}%
                  </div>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">Status</h4>
                  {getStatusBadge(selectedCandidate.interviewStatus)}
                </div>
              </div>

              {/* AI Summary */}
              {selectedCandidate.summary && (
                <div className="mb-8">
                  <h4 className="font-medium text-neutral-900 mb-3">AI Summary</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-neutral-700">{selectedCandidate.summary}</p>
                  </div>
                </div>
              )}

              {/* Questions and Answers */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-4">Interview Questions & Answers</h4>
                <div className="space-y-6">
                  {mockQuestions.map((qa, index) => (
                    <div key={index} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-neutral-900">Question {index + 1}</h5>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            qa.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            qa.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {qa.difficulty.toUpperCase()}
                          </span>
                          <span className={`text-lg font-bold ${getScoreColor(qa.score)}`}>
                            {qa.score}/100
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-neutral-50 p-3 rounded mb-3">
                        <p className="text-sm text-neutral-700">{qa.question}</p>
                      </div>
                      
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-neutral-700">{qa.answer}</p>
                      </div>
                      
                      <div className="mt-2 text-xs text-neutral-500">
                        Time spent: {qa.timeSpent}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default InterviewerTab