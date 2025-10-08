import express from 'express';
import { protect } from '../middleware/auth.js';
import Exam from '../models/Exam.js';

const router = express.Router();

// Get all exams for user
router.get('/', protect, async (req, res) => {
  try {
    const exams = await Exam.find({ userId: req.user._id })
      .populate('courseId')
      .sort({ examDate: 1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create exam with revision plan
router.post('/', protect, async (req, res) => {
  try {
    const { title, courseId, examDate, topics } = req.body;
    
    // Generate revision plan (spread over 2 weeks before exam)
    const revisionPlan = [];
    const startDate = new Date(examDate);
    startDate.setDate(startDate.getDate() - 14);
    
    const topicsPerSession = Math.ceil(topics.length / 7);
    for (let i = 0; i < 7; i++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + i * 2);
      
      const sessionTopics = topics.slice(
        i * topicsPerSession,
        (i + 1) * topicsPerSession
      );
      
      revisionPlan.push({
        date: sessionDate,
        topics: sessionTopics,
        completed: false
      });
    }

    const exam = await Exam.create({
      title,
      courseId,
      examDate,
      revisionPlan,
      userId: req.user._id
    });

    await exam.populate('courseId');
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update revision plan completion
router.put('/:id/revision/:sessionId', protect, async (req, res) => {
  try {
    const exam = await Exam.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const session = exam.revisionPlan.id(req.params.sessionId);
    if (session) {
      session.completed = req.body.completed;
      await exam.save();
    }

    await exam.populate('courseId');
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
