import React, { useState, useEffect } from 'react';
import { tasksApi, projectsApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle2, Clock, PlayCircle, MoreHorizontal, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const TaskCard = ({ task, onStatusChange }) => {
  const statusColors = {
    'todo': 'bg-slate-100 text-slate-600',
    'in-progress': 'bg-blue-100 text-blue-600',
    'done': 'bg-emerald-100 text-emerald-600'
  };

  const statusIcons = {
    'todo': Clock,
    'in-progress': PlayCircle,
    'done': CheckCircle2
  };

  const Icon = statusIcons[task.status] || Clock;

  return (
    <motion.div 
      layout
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${statusColors[task.status]}`}>
          {task.status}
        </span>
        <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <h4 className="font-bold text-slate-900 mb-2">{task.title}</h4>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center text-xs text-slate-400 font-medium">
          <Calendar size={14} className="mr-1" />
          {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'}
        </div>
        
        <select 
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="text-xs bg-slate-50 border-none rounded-lg py-1 px-2 text-slate-600 font-bold outline-none cursor-pointer hover:bg-slate-100"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </motion.div>
  );
};

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        tasksApi.getAll(),
        projectsApi.getAll()
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      if (projectsRes.data.length > 0) setProjectId(projectsRes.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tasksApi.create({
        title,
        description,
        project_id: parseInt(projectId),
        assigned_to: assignedTo ? parseInt(assignedTo) : null,
        due_date: dueDate || null
      });
      setTitle('');
      setDescription('');
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksApi.updateStatus(taskId, newStatus);
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500">Track and manage your team assignments</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center font-bold transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} className="mr-2" />
            Add Task
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {['todo', 'in-progress', 'done'].map(status => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${status === 'todo' ? 'bg-slate-400' : status === 'in-progress' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                {status.replace('-', ' ')}
                <span className="ml-3 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-xs">
                  {tasks.filter(t => t.status === status).length}
                </span>
              </h3>
            </div>
            
            <div className="space-y-4 min-h-[500px]">
              {tasks.filter(t => t.status === status).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStatusChange={handleStatusChange} 
                />
              ))}
              {tasks.filter(t => t.status === status).length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 opacity-50">
                  <Clock size={32} className="mb-2" />
                  <p className="text-xs font-medium uppercase">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Assign New Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="UI Design for Dashboard"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  placeholder="Provide task details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To (User ID)</label>
                <input
                  type="number"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="User ID (e.g. 1)"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
