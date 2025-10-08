import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    datetime: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      // If backend is not available, use sample data
      setTasks([
        {
          id: "1",
          subject: "Mathematics",
          topic: "Linear Algebra",
          datetime: "2024-01-15T10:00",
          status: "pending",
          createdAt: "2024-01-10T08:00:00.000Z"
        },
        {
          id: "2",
          subject: "Physics",
          topic: "Quantum Mechanics",
          datetime: "2024-01-16T14:00",
          status: "completed",
          createdAt: "2024-01-09T10:30:00.000Z"
        }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask.id}`, formData);
      } else {
        await axios.post('/api/tasks', formData);
      }
      
      setFormData({ subject: '', topic: '', datetime: '' });
      setShowForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      subject: task.subject,
      topic: task.topic,
      datetime: task.datetime
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const toggleStatus = async (taskId, currentStatus) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/toggle`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const calculateProgress = () => {
    const completed = tasks.filter(task => task.status === 'completed').length;
    const total = tasks.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const formatDate = (datetime) => {
    return new Date(datetime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (datetime) => {
    const now = new Date();
    const taskDate = new Date(datetime);
    const diff = taskDate - now;
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Less than 1h left';
  };

  const progress = calculateProgress();
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;

  return (
    <div className="app">
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div className="container">
          <div style={styles.navContent}>
            <h1 style={styles.logo}>ScholarSync</h1>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowForm(true);
                setEditingTask(null);
                setFormData({ subject: '', topic: '', datetime: '' });
              }}
            >
              + Add Task
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={styles.main}>
        {/* Progress Section */}
        <section style={styles.progressSection}>
          <div className="card">
            <h2 style={styles.sectionTitle}>Study Progress</h2>
            <div style={styles.progressContainer}>
              <div style={styles.progressStats}>
                <div style={styles.progressNumber}>{completedTasks}/{totalTasks}</div>
                <div style={styles.progressLabel}>Tasks Completed</div>
              </div>
              <div style={styles.progressBarContainer}>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${progress}%`,
                      backgroundColor: progress === 100 ? '#28A745' : '#EF233C'
                    }}
                  ></div>
                </div>
                <div style={styles.progressText}>{progress}% Complete</div>
              </div>
            </div>
          </div>
        </section>

        {/* Task Form Modal */}
        {showForm && (
          <div style={styles.modalOverlay}>
            <div className="card" style={styles.modal}>
              <h2 style={styles.modalTitle}>
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Mathematics, Physics"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Topic</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Linear Algebra, Quantum Mechanics"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={formData.datetime}
                    onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.formActions}>
                  <button type="submit" className="btn btn-primary">
                    {editingTask ? 'Update Task' : 'Add Task'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingTask(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tasks Section */}
        <section style={styles.tasksSection}>
          <h2 style={styles.sectionTitle}>Study Tasks</h2>
          
          {tasks.length === 0 ? (
            <div className="card" style={styles.emptyState}>
              <div style={styles.emptyIcon}>📚</div>
              <h3 style={styles.emptyTitle}>No tasks yet</h3>
              <p style={styles.emptyText}>Start by adding your first study task!</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Add Your First Task
              </button>
            </div>
          ) : (
            <div style={styles.tasksGrid}>
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="card"
                  style={{
                    ...styles.taskCard,
                    borderLeft: `4px solid ${task.status === 'completed' ? '#28A745' : '#EF233C'}`
                  }}
                >
                  <div style={styles.taskHeader}>
                    <h3 style={styles.taskSubject}>{task.subject}</h3>
                    <div style={styles.taskActions}>
                      <button
                        style={styles.actionBtn}
                        onClick={() => handleEdit(task)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        style={styles.actionBtn}
                        onClick={() => handleDelete(task.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <p style={styles.taskTopic}>{task.topic}</p>
                  
                  <div style={styles.taskMeta}>
                    <div style={styles.taskDateTime}>
                      <span style={styles.metaIcon}>📅</span>
                      {formatDate(task.datetime)}
                    </div>
                    <div style={styles.taskCountdown}>
                      <span style={styles.metaIcon}>⏰</span>
                      {getTimeRemaining(task.datetime)}
                    </div>
                  </div>
                  
                  <div style={styles.taskFooter}>
                    <button
                      className={`btn ${task.status === 'completed' ? 'btn-outline' : 'btn-accent'}`}
                      style={styles.statusBtn}
                      onClick={() => toggleStatus(task.id, task.status)}
                    >
                      {task.status === 'completed' ? 'Completed ✓' : 'Mark Complete'}
                    </button>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: task.status === 'completed' ? '#28A745' : '#6C757D'
                    }}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div className="container">
          <p style={styles.footerText}>
            ScholarSync - Simple Study Planner • Built by Obilo Michael
          </p>
        </div>
      </footer>
    </div>
  );
};

// Inline styles for better organization
const styles = {
  navbar: {
    backgroundColor: '#2B2D42',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'white'
  },
  main: {
    padding: '2rem 0',
    minHeight: 'calc(100vh - 140px)'
  },
  progressSection: {
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#2B2D42'
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },
  progressStats: {
    textAlign: 'center'
  },
  progressNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#2B2D42'
  },
  progressLabel: {
    color: '#6C757D',
    fontWeight: '500'
  },
  progressBarContainer: {
    flex: 1
  },
  progressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#E9ECEF',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '0.5rem'
  },
  progressFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'all 0.3s ease'
  },
  progressText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#2B2D42'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#2B2D42'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  tasksSection: {
    marginBottom: '2rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 2rem'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#2B2D42'
  },
  emptyText: {
    color: '#6C757D',
    marginBottom: '2rem'
  },
  tasksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  taskCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem'
  },
  taskSubject: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2B2D42',
    margin: 0
  },
  taskActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease'
  },
  taskTopic: {
    color: '#6C757D',
    marginBottom: '1rem',
    flex: 1
  },
  taskMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  taskDateTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#6C757D'
  },
  taskCountdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#6C757D'
  },
  metaIcon: {
    fontSize: '1rem'
  },
  taskFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto'
  },
  statusBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem'
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'white',
    textTransform: 'capitalize'
  },
  footer: {
    backgroundColor: '#2B2D42',
    color: 'white',
    padding: '1.5rem 0',
    textAlign: 'center'
  },
  footerText: {
    margin: 0,
    color: 'rgba(255,255,255,0.8)'
  }
};

// Media queries for responsive design
const mediaQueries = `
  @media (max-width: 768px) {
    .container {
      padding: 0 0.5rem;
    }
    
    .progress-container {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
    
    .tasks-grid {
      grid-template-columns: 1fr;
    }
    
    .task-footer {
      flex-direction: column;
      gap: 0.5rem;
      align-items: stretch;
    }
    
    .status-btn {
      width: 100%;
    }
    
    .form-actions {
      flex-direction: column;
    }
    
    .form-actions button {
      width: 100%;
    }
  }
`;

// Add media queries to the document
const styleSheet = document.createElement('style');
styleSheet.innerText = mediaQueries;
document.head.appendChild(styleSheet);

export default App;
