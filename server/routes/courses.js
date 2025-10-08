import express from 'express';
import { protect } from '../middleware/auth.js';
import Course from '../models/Course.js';

const router = express.Router();

// Get all courses for user
router.get('/', protect, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.user._id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course
router.post('/', protect, async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      userId: req.user._id
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course
router.put('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course
router.delete('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
