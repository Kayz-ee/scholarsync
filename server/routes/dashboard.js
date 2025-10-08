import express from 'express';
import { protect } from '../middleware/auth.js';
import Task from '../models/Task.js';
import Exam from '../models/Exam.js';
import Course from '../models/Course.js';

const router = express.Router();

// Get dashboard data
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Upcoming tasks (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingTasks = await Task.find({
      userId,
      deadline: { $lte: nextWeek, $gte: new Date() },
      completed: false
    })
      .populate('courseId')
      .sort({ deadline: 1 })
      .limit(5);

    // Upcoming exams (next 30 days)
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    
    const upcomingExams = await Exam.find({
      userId,
      examDate: { $lte: nextMonth, $gte: new Date() }
    })
      .populate('courseId')
      .sort({ examDate: 1 })
      .limit(5);

    // Task statistics
    const totalTasks = await Task.countDocuments({ userId });
    const completedTasks = await Task.countDocuments({ 
      userId, 
      completed: true 
    });
    const overdueTasks = await Task.countDocuments({
      userId,
      deadline: { $lt: new Date() },
      completed: false
    });

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.json({
      streak: req.user.streak,
      upcomingTasks,
      upcomingExams,
      stats: {
        totalTasks,
        completedTasks,
        overdueTasks,
        progress: Math.round(progress)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
