import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const dataFile = join(__dirname, '../data/tasks.json');

// Helper function to read tasks
const readTasks = async () => {
  try {
    const data = await readFile(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
};

// Helper function to write tasks
const writeTasks = async (tasks) => {
  await writeFile(dataFile, JSON.stringify(tasks, null, 2));
};

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// Add new task
router.post('/', async (req, res) => {
  try {
    const { subject, topic, datetime, status } = req.body;
    
    if (!subject || !topic || !datetime) {
      return res.status(400).json({ error: 'Subject, topic, and datetime are required' });
    }

    const tasks = await readTasks();
    const newTask = {
      id: uuidv4(),
      subject,
      topic,
      datetime,
      status: status || 'pending',
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    await writeTasks(tasks);
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, topic, datetime, status } = req.body;

    const tasks = await readTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      subject: subject || tasks[taskIndex].subject,
      topic: topic || tasks[taskIndex].topic,
      datetime: datetime || tasks[taskIndex].datetime,
      status: status || tasks[taskIndex].status,
      updatedAt: new Date().toISOString()
    };

    await writeTasks(tasks);
    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await readTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);

    if (tasks.length === filteredTasks.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await writeTasks(filteredTasks);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Toggle task status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks[taskIndex].status = tasks[taskIndex].status === 'completed' ? 'pending' : 'completed';
    tasks[taskIndex].updatedAt = new Date().toISOString();

    await writeTasks(tasks);
    res.json(tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle task status' });
  }
});

export default router;
