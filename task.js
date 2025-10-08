import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

taskSchema.virtual('isOverdue').get(function() {
  return !this.completed && this.deadline < new Date();
});

taskSchema.virtual('isDueSoon').get(function() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return !this.completed && this.deadline <= tomorrow && this.deadline >= new Date();
});

export default mongoose.model('Task', taskSchema);
