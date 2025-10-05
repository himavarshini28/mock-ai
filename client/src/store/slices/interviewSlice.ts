import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../services/api'

interface Interview {
  _id: string
  candidateId: string
  jobPosition: string
  experienceLevel: string
  techStack: string[]
  questions: Array<{
    question: string
    answer?: string
    score?: number
    reasoning?: string
    breakdown?: {
      technical_accuracy: number
      clarity: number
      completeness: number
      depth: number
    }
  }>
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
}

interface InterviewState {
  currentInterview: Interview | null
  interviews: Interview[]
  isLoading: boolean
  error: string | null
  currentQuestionIndex: number
  currentQuestion: any | null
  isInterviewStarted: boolean
}

const initialState: InterviewState = {
  currentInterview: null,
  interviews: [],
  isLoading: false,
  error: null,
  currentQuestionIndex: 0,
  currentQuestion: null,
  isInterviewStarted: false,
}

export const createInterview = createAsyncThunk(
  'interview/create',
  async (interviewData: {
    candidateId: string
    jobPosition: string
    experienceLevel: string
    techStack: string[]
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/interviews', interviewData)
      return response.data.interview
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create interview')
    }
  }
)

export const fetchInterviews = createAsyncThunk(
  'interview/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/interviews')
      return response.data.interviews
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interviews')
    }
  }
)

export const startInterview = createAsyncThunk(
  'interview/start',
  async (candidateId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/interview/${candidateId}/start`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start interview')
    }
  }
)

export const fetchInterview = createAsyncThunk(
  'interview/fetchOne',
  async (interviewId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/interviews/${interviewId}`)
      return response.data.interview
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch interview')
    }
  }
)

export const submitAnswer = createAsyncThunk(
  'interview/submitAnswer',
  async ({
    interviewId,
    questionIndex,
    answer,
  }: {
    interviewId: string
    questionIndex: number
    answer: string
  }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/interviews/${interviewId}/answer`, {
        questionIndex,
        answer,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit answer')
    }
  }
)

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentInterview: (state, action: PayloadAction<Interview>) => {
      state.currentInterview = action.payload
    },
    setCurrentQuestion: (state, action: PayloadAction<any>) => {
      state.currentQuestion = action.payload
    },
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1
    },
    resetQuestionIndex: (state) => {
      state.currentQuestionIndex = 0
    },
    setInterviewStarted: (state, action: PayloadAction<boolean>) => {
      state.isInterviewStarted = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createInterview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createInterview.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentInterview = action.payload
        state.interviews.push(action.payload)
      })
      .addCase(createInterview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.interviews = action.payload
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        if (state.currentInterview) {
          const { questionIndex, score, reasoning, breakdown } = action.payload
          // Ensure we have enough questions in the array
          while (state.currentInterview.questions.length <= questionIndex) {
            state.currentInterview.questions.push({ question: '', answer: '' })
          }
          state.currentInterview.questions[questionIndex] = {
            ...state.currentInterview.questions[questionIndex],
            score,
            reasoning,
            breakdown,
          }
        }
      })
      .addCase(startInterview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(startInterview.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentQuestion = action.payload.question
        state.isInterviewStarted = true
        state.currentQuestionIndex = (action.payload.questionNumber || 1) - 1
      })
      .addCase(startInterview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchInterview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInterview.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentInterview = action.payload
      })
      .addCase(fetchInterview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentInterview, setCurrentQuestion, nextQuestion, resetQuestionIndex, setInterviewStarted } = interviewSlice.actions
export default interviewSlice.reducer