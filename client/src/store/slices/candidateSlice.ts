import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../services/api'

interface Candidate {
  _id: string
  name: string
  email: string
  phone: string
  resumeUrl: string
  interviewStatus: 'not-started' | 'in-progress' | 'completed'
  score: number
  summary: string
  extractionData?: {
    name: {
      value: string | null
      confidence: number
      source: 'ai' | 'regex' | 'manual'
    }
    email: {
      value: string | null
      confidence: number
      source: 'ai' | 'regex' | 'manual'
    }
    phone: {
      value: string | null
      confidence: number
      source: 'ai' | 'regex' | 'manual'
    }
  }
  createdAt: string
  updatedAt: string
}

interface CandidateState {
  candidates: Candidate[]
  currentCandidate: Candidate | null
  isLoading: boolean
  error: string | null
  uploadProgress: number
}

const initialState: CandidateState = {
  candidates: [],
  currentCandidate: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,
}

export const uploadResume = createAsyncThunk(
  'candidate/uploadResume',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/candidates/upload-resume', formData, {
        // Don't set Content-Type for FormData - browser sets it automatically with boundary
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          console.log('Upload progress:', progress + '%')
        },
      })
      console.log('Upload successful:', response.data)
      // Backend returns { success: true, data: candidate, message: string }
      return response.data.data
    } catch (error: any) {
      console.error('Upload error:', error.response?.data || error.message)
      return rejectWithValue(error.response?.data?.message || 'Failed to upload resume')
    }
  }
)

export const fetchCandidates = createAsyncThunk(
  'candidate/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/candidates')
      console.log('Fetch candidates response:', response.data)
      return response.data.data || response.data.candidates || []
    } catch (error: any) {
      console.error('Fetch candidates error:', error.response?.data)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidates')
    }
  }
)

export const getCandidateById = createAsyncThunk(
  'candidate/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/candidates/${id}`)
      return response.data.candidate
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidate')
    }
  }
)

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentCandidate: (state, action: PayloadAction<Candidate>) => {
      state.currentCandidate = action.payload
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentCandidate = action.payload
        state.candidates.push(action.payload)
        state.uploadProgress = 0
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.uploadProgress = 0
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.candidates = action.payload
      })
      .addCase(getCandidateById.fulfilled, (state, action) => {
        state.currentCandidate = action.payload
      })
  },
})

export const { clearError, setCurrentCandidate, setUploadProgress, resetUploadProgress } = candidateSlice.actions
export default candidateSlice.reducer