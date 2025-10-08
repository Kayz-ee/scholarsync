import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Task from '../models/Task.js';
import Exam from '../models/Exam.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/scholarsync');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Task.deleteMany({});
    await Exam.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@scholarsync.test',
      password: 'Password123!',
      role: 'admin',
      streak: 7
    });

    // Create regular user
    const regularUser = await User.create({
      name: 'Test Student',
      email: 'user@scholarsync.test',
      password: 'Password123!',
      streak: 3
    });

    // Create courses
    const courses = await Course.insertMany([
      {
        title: 'Mathematics',
        description: 'Advanced Calculus and Linear Algebra',
        color: '#001F54',
        userId: regularUser._id
      },
      {
        title: 'Computer Science',
        description: 'Data Structures and Algorithms',
        color: '#0096C7',
        userId: regularUser._id
      },
      {
        title: 'Physics',
        description: 'Classical Mechanics and Thermodynamics',
        color: '#2ECC71',
        userId: regularUser._id
      }
    ]);

    // Create tasks
    const tasks = await Task.insertMany([
      {
        title: 'Complete Calculus Assignment',
        description: 'Chapter 5 exercises 1-20',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        priority: 'high',
        courseId: courses[0]._id,
        userId: regularUser._id
      },
      {
        title: 'Study Linear Algebra',
        description: 'Review eigenvalues and eigenvectors',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        priority: 'medium',
        courseId: courses[0]._id,
        userId: regularUser._id
      },
      {
        title: 'Implement Binary Search Tree',
        description: 'Code implementation with test cases',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'high',
        courseId: courses[1]._id,
        userId: regularUser._id,
        completed: true
      },
      {
        title: 'Physics Lab Report',
        description: 'Experiment on Newton\'s Laws',
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (overdue)
        priority: 'high',
        courseId: courses[2]._id,
        userId: regularUser._id
      }
    ]);

    // Create exams
    const exam = await Exam.create({
      title: 'Final Mathematics Exam',
      courseId: courses[0]._id,
      examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      topics: [
        'Differential Calculus',
        'Integral Calculus',
        'Linear Algebra',
        'Vector Calculus',
        'Differential Equations',
        'Multivariable Calculus',
        'Series and Sequences'
      ],
      userId: regularUser._id
    });

    console.log('Database seeded successfully!');
    console.log('Admin credentials: admin@scholarsync.test / Password123!');
    console.log('User credentials: user@scholarsync.test / Password123!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
