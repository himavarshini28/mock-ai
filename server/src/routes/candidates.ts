import { Router, Response } from 'express'
import { candidate } from '../models/candidate'
import auth, { AuthRequest } from '../middleware/auth'
import { upload, createCandidate } from '../controllers/candidateController'

const router = Router()

// Get all candidates
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const candidates = await candidate.find({ userId: req.userId })
      .sort({ score: -1, createdAt: -1 })
      .select('-__v')

    res.json({
      success: true,
      data: candidates,
      count: candidates.length
    })
  } catch (error: any) {
    console.error('Error fetching candidates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates',
      error: error.message
    })
  }
})

// Get candidate by ID
router.get('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidateRecord = await candidate.findOne({
      _id: req.params.id,
      userId: req.userId
    })

    if (!candidateRecord) {
      res.status(404).json({
        success: false,
        message: 'Candidate not found'
      })
      return
    }

    res.json({
      success: true,
      data: candidateRecord
    })
  } catch (error: any) {
    console.error('Error fetching candidate:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate',
      error: error.message
    })
  }
})

// Update candidate
router.patch('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowedUpdates = ['name', 'email', 'phone', 'interviewStatus', 'score', 'summary']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      res.status(400).json({
        success: false,
        message: 'Invalid updates'
      })
      return
    }

    const candidateRecord = await candidate.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    )

    if (!candidateRecord) {
      res.status(404).json({
        success: false,
        message: 'Candidate not found'
      })
      return
    }

    res.json({
      success: true,
      data: candidateRecord
    })
  } catch (error: any) {
    console.error('Error updating candidate:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update candidate',
      error: error.message
    })
  }
})

// Delete candidate
router.delete('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidateRecord = await candidate.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    })

    if (!candidateRecord) {
      res.status(404).json({
        success: false,
        message: 'Candidate not found'
      })
      return
    }

    res.json({
      success: true,
      message: 'Candidate deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting candidate:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete candidate',
      error: error.message
    })
  }
})

// Get candidate statistics
router.get('/stats/overview', auth, async (req: AuthRequest, res: Response) => {
  try {
    const totalCandidates = await candidate.countDocuments({ userId: req.userId })
    const completedCandidates = await candidate.countDocuments({ 
      userId: req.userId, 
      interviewStatus: 'completed' 
    })
    const inProgressCandidates = await candidate.countDocuments({ 
      userId: req.userId, 
      interviewStatus: 'in-progress' 
    })
    
    // Calculate average score for completed interviews
    const completedCandidatesWithScores = await candidate.find({
      userId: req.userId,
      interviewStatus: 'completed',
      score: { $exists: true, $ne: null }
    }).select('score')

    const averageScore = completedCandidatesWithScores.length > 0
      ? Math.round(completedCandidatesWithScores.reduce((sum: number, c: any) => sum + c.score, 0) / completedCandidatesWithScores.length)
      : 0

    res.json({
      success: true,
      data: {
        totalCandidates,
        completedCandidates,
        inProgressCandidates,
        notStartedCandidates: totalCandidates - completedCandidates - inProgressCandidates,
        averageScore
      }
    })
  } catch (error: any) {
    console.error('Error fetching candidate statistics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    })
  }
})

// Upload resume endpoint for creating candidates - temporarily without auth for debugging
router.post('/upload-resume', upload.single('resume'), createCandidate)

export default router