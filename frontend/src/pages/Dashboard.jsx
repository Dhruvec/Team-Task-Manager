import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api/api';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ListTodo,
  TrendingUp,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center"
  >
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 mr-4`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-10 bg-slate-200 rounded w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>)}
    </div>
  </div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Overview of your team's progress</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Tasks" 
          value={stats?.total_tasks || 0} 
          icon={ListTodo} 
          color="bg-blue-500" 
          delay={0.1}
        />
        <StatCard 
          title="Completed" 
          value={stats?.completed_tasks || 0} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
          delay={0.2}
        />
        <StatCard 
          title="Pending" 
          value={stats?.pending_tasks || 0} 
          icon={Clock} 
          color="bg-amber-500" 
          delay={0.3}
        />
        <StatCard 
          title="Overdue" 
          value={stats?.overdue_tasks || 0} 
          icon={AlertCircle} 
          color="bg-rose-500" 
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Team Activity</h2>
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-medium">New task assigned to Sarah</p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-lg text-white">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold mb-2">Project Velocity</h2>
              <p className="text-indigo-100 text-sm">You're completing tasks 15% faster than last week!</p>
            </div>
            <TrendingUp size={32} className="text-indigo-200 opacity-50" />
          </div>
          <div className="flex items-end justify-between h-32 gap-2">
            {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
              <div 
                key={i} 
                className="bg-white bg-opacity-20 hover:bg-opacity-40 transition-all rounded-t-lg flex-1"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
