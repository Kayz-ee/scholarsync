import express from 'express';
import { protect } from '../middleware/auth.js';
import Task from '../models/Task.js';

const router = express.Router();

// Get all tasks for user
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id })
      .populate('courseId')
      .sort({ deadline: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', protect, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user._id
    });
    await task.populate('courseId');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    ).populate('courseId');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
