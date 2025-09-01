import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatBar from '@/components/ui/stat-bar';
import ToggleTabs from '@/components/ui/toggle-tabs';
import { User, Trophy, Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays, startOfWeek, startOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { STANDARD_CATEGORIES, TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';
import { useCategories } from '@/contexts/CategoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

// Mock data - Updated to use only 5 standard categories
const stats = [
  { name: 'Health', current: 82, max: 100, color: 'health' as const },
  { name: 'Strength', current: 71, max: 100, color: 'strength' as const },
  { name: 'Mind', current: 89, max: 100, color: 'mind' as const },
  { name: 'Work', current: 94, max: 100, color: 'work' as const },
  { name: 'Spirit', current: 68, max: 100, color: 'spirit' as const }
];

// Mock user data
const mockUser = {
  name: 'Rahul Sharma',
  email: 'rahul.sharma@gmail.com',
  avatar: '',
  joinDate: '2024-01-15',
  age: 24,
  gender: 'Male',
  timezone: 'Asia/Kolkata',
  totalTasks: 387,
  completedTasks: 312,
  level: 18,
  monthlyIncome: 140000,
  location: 'Bangalore'
};

// Enhanced goals data with points and completion status
const mockGoals = [
  {
    id: '1',
    title: 'July Health Boost',
    description: 'Complete 30 health-related tasks',
    completed: true,
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    categories: { Health: 30 },
    totalPoints: 30,
    currentPoints: 30
  },
  {
    id: '2',
    title: 'Summer Fitness',
    description: 'Build strength and endurance',
    completed: false,
    startDate: '2025-07-01',
    endDate: '2025-08-31',
    categories: { Health: 25, Strength: 35 },
    totalPoints: 60,
    currentPoints: 45
  },
  {
    id: '3',
    title: 'Mindfulness Journey',
    description: 'Develop mental clarity and focus',
    completed: false,
    startDate: '2025-07-15',
    endDate: '2025-09-15',
    categories: { Mind: 40 },
    totalPoints: 40,
    currentPoints: 28
  },
  {
    id: '4',
    title: 'Personal Growth',
    description: 'Advance career and spiritual development',
    completed: true,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    categories: { Work: 30, Spirit: 25 },
    totalPoints: 55,
    currentPoints: 55
  },
  {
    id: '5',
    title: 'Code Master Challenge',
    description: 'Master React and TypeScript',
    completed: false,
    startDate: '2025-07-01',
    endDate: '2025-10-31',
    categories: { Mind: 50, Work: 40 },
    totalPoints: 90,
    currentPoints: 65
  },
  {
    id: '6',
    title: 'Spiritual Awakening',
    description: 'Deepen spiritual practices',
    completed: true,
    startDate: '2025-06-15',
    endDate: '2025-07-15',
    categories: { Spirit: 35 },
    totalPoints: 35,
    currentPoints: 35
  },
  {
    id: '7',
    title: 'Physical Transformation',
    description: 'Complete body transformation program',
    completed: false,
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    categories: { Health: 40, Strength: 45 },
    totalPoints: 85,
    currentPoints: 52
  },
  {
    id: '8',
    title: 'Career Breakthrough',
    description: 'Land a senior developer position',
    completed: false,
    startDate: '2025-07-01',
    endDate: '2025-11-30',
    categories: { Work: 60, Mind: 30 },
    totalPoints: 90,
    currentPoints: 38
  }
];

// Get recently completed goals for achievements
const recentlyCompletedGoals = mockGoals
  .filter(goal => goal.completed)
  .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
  .slice(0, 3);

const achievements = [
  {
    id: '1',
    title: 'Goal Master',
    description: 'Complete 3 goals successfully',
    completed: true,
    pointTargets: { Health: 30, Strength: 30, Work: 30 },
    endDate: '2025-07-31'
  },
  {
    id: '2',
    title: 'Consistency King',
    description: 'Complete daily tasks for 30 days',
    completed: false,
    pointTargets: { Health: 60 },
    endDate: '2025-08-15'
  },
  {
    id: '3',
    title: 'Mind Master',
    description: 'Achieve 100 points in Mind category',
    completed: false,
    pointTargets: { Mind: 100 },
    endDate: '2025-07-30'
  }
];

// Dummy data for last 3 months - Updated to use only 5 categories
const categories = ['Health', 'Strength', 'Mind', 'Work', 'Spirit'];
const colors = ['#22c55e', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444'];

function generateDummyLineData() {
  const data = [];
  // Start with more realistic baseline values
  let current = [48, 28, 22, 18, 15];
  
  for (let i = 90; i >= 0; i--) {
    const date = subDays(new Date(), i);
    // Simulate more realistic progress with trends
    current = current.map((v, idx) => {
      // Add some trend and randomness
      const trend = Math.sin(i / 10 + idx) * 0.5; // Cyclical trend
      const random = (Math.random() - 0.5) * 2; // Random variation
      const change = trend + random;
      return Math.max(0, Math.min(100, v + change)); // Keep within 0-100 range
    });
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      Health: Math.round(current[0]),
      Strength: Math.round(current[1]),
      Mind: Math.round(current[2]),
      Work: Math.round(current[3]),
      Spirit: Math.round(current[4]),
    });
  }
  return data;
}

const lineData = generateDummyLineData();

function filterLineData(range, custom) {
  const today = new Date();
  let startDate;
  
  switch (range) {
    case 'week':
      startDate = startOfWeek(today);
      break;
    case 'month':
      startDate = startOfMonth(today);
      break;
    case 'custom':
      if (custom.from && custom.to) {
        return lineData.filter(d => {
          const date = parseISO(d.date);
          return isWithinInterval(date, { start: custom.from, end: custom.to });
        });
      }
      return lineData;
    default:
      return lineData;
  }
  
  return lineData.filter(d => {
    const date = parseISO(d.date);
    return isWithinInterval(date, { start: startDate, end: today });
  });
}

function getPieData(filteredLineData) {
  // Use the last entry for current distribution
  const last = filteredLineData[filteredLineData.length - 1] || {};
  return categories.map((cat, i) => ({ 
    name: cat, 
    value: last[cat] || 0, 
    color: colors[i],
    percentage: 0 // Will be calculated
  })).map(item => {
    const total = categories.reduce((sum, cat) => sum + (last[cat] || 0), 0);
    return {
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
    };
  });
}

const ProgressPage = () => {
  const { isAuthenticated } = useAuth();
  const { getByType } = useCategories();
  const taskCategories = getByType('task');
  const [achievementFilter, setAchievementFilter] = useState<'ongoing' | 'completed' | 'missed'>('ongoing');
  const [lineRange, setLineRange] = useState('week');
  const [pieRange, setPieRange] = useState('week');
  const [lineCustom, setLineCustom] = useState({ from: null, to: null });
  const [pieCustom, setPieCustom] = useState({ from: null, to: null });
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [goals, setGoals] = useState<typeof mockGoals>([]);
  const [loading, setLoading] = useState(false);
  const [goalForm, setGoalForm] = useState(() => {
    const initialCategories = taskCategories.reduce((acc, cat) => {
      acc[cat.name] = { selected: false, points: '' };
      return acc;
    }, {} as Record<string, { selected: boolean; points: string }>);
    
    return {
      title: '',
      startDate: '',
      endDate: '',
      categories: initialCategories
    };
  });

  // Load goals based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      loadGoals();
    } else {
      // Load mock data for demo mode
      loadMockGoals();
    }
  }, [isAuthenticated]);

  const loadMockGoals = () => {
    console.log('Loading mock goals for demo mode...');
    setGoals(mockGoals);
    console.log('Mock goals loaded:', mockGoals.length, 'goals');
  };

  const loadGoals = async () => {
    setLoading(true);
    try {
      console.log('Loading goals from API...');
      const apiGoals = await apiClient.getGoals();
      console.log('Loaded goals:', apiGoals);
      setGoals(apiGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      // On error, set empty array
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLineData = filterLineData(lineRange, lineCustom);
  const filteredPieData = filterLineData(pieRange, pieCustom);
  const pieData = getPieData(filteredPieData);

  const handleCreateGoal = () => {
    const selectedCategories = Object.entries(goalForm.categories)
      .filter(([_, { selected }]) => selected)
      .reduce((acc, [category, { points }]) => {
        acc[category] = parseInt(points) || 0;
        return acc;
      }, {});

    const totalPoints = Object.values(selectedCategories).reduce((sum, points) => sum + points, 0);

    const newGoal = {
      id: Date.now().toString(),
      title: goalForm.title,
      description: `Goal: ${goalForm.title}`,
      completed: false,
      startDate: goalForm.startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: goalForm.endDate,
      categories: selectedCategories,
      totalPoints,
      currentPoints: 0
    };

    setGoals(prev => [...prev, newGoal]);
    setIsCreatingGoal(false);
    const resetCategories = taskCategories.reduce((acc, cat) => {
      acc[cat.name] = { selected: false, points: '' };
      return acc;
    }, {} as Record<string, { selected: boolean; points: string }>);
    
    setGoalForm({
      title: '',
      startDate: '',
      endDate: '',
      categories: resetCategories
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const handleCancelGoal = () => {
    setIsCreatingGoal(false);
    const resetCategories = taskCategories.reduce((acc, cat) => {
      acc[cat.name] = { selected: false, points: '' };
      return acc;
    }, {} as Record<string, { selected: boolean; points: string }>);
    
    setGoalForm({
      title: '',
      startDate: '',
      endDate: '',
      categories: resetCategories
    });
  };

  const handleCategoryChange = (category: string, selected: boolean) => {
    setGoalForm(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: { ...prev.categories[category], selected }
      }
    }));
  };

  const handlePointsChange = (category: string, points: string) => {
    setGoalForm(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: { ...prev.categories[category], points }
      }
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Health': return 'bg-green-100 text-green-700';
      case 'Strength': return 'bg-yellow-100 text-yellow-700';
      case 'Mind': return 'bg-purple-100 text-purple-700';
      case 'Work': return 'bg-blue-100 text-blue-700';
      case 'Spirit': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getGoalBackground = (goal: any) => {
    if (goal.completed) return 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-400 shadow-amber-100';
    const progress = (goal.currentPoints / goal.totalPoints) * 100;
    if (progress >= 50) return 'bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-300 shadow-emerald-100';
    return 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 shadow-gray-100';
  };

  return (
    <div className="min-h-screen bg-white bg-gradient-to-b from-[#f5f6fa] to-[#e9eafc] p-6 lg:p-10">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={TYPOGRAPHY.pageTitle}>Progress & Goals</h2>
            <p className={TYPOGRAPHY.bodyText}>Track your progress and manage goals</p>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Demo Mode</h4>
                <p className="text-sm text-blue-700 mb-2">
                  You're currently viewing mock data. Goals and progress data shown are demo data and cannot be edited or deleted.
                </p>
                <p className="text-sm text-blue-700">
                  <strong>To create and manage real goals:</strong> Sign in to your account and create new goals. Real goals will have unique IDs and can be fully edited.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-10 gap-6">
          <Card className="col-span-7 p-8 bg-white shadow-2xl rounded-3xl border border-border mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#3b82f6" d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z"/></svg>
              Lifetime Stats Overview
            </h3>
            <div className="space-y-4 mb-6">
              {stats.map((stat, idx) => (
                <div key={stat.name} className="flex items-center gap-4">
                  <span className={`w-3 h-3 rounded-full mt-1 ${
                    stat.color === 'health' ? 'bg-green-500' :
                    stat.color === 'strength' ? 'bg-yellow-400' :
                    stat.color === 'mind' ? 'bg-purple-500' :
                    stat.color === 'work' ? 'bg-blue-500' :
                    stat.color === 'spirit' ? 'bg-red-500' :
                    'bg-gray-400'} flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-base">{stat.name}</span>
                      <span className="font-semibold text-violet-500 text-sm">{stat.current}/{stat.max} <span className="ml-1 text-xs">pts</span></span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full mt-1">
                      <div className={`h-3 rounded-full ${
                        stat.color === 'health' ? 'bg-green-500' :
                        stat.color === 'strength' ? 'bg-yellow-400' :
                        stat.color === 'mind' ? 'bg-purple-500' :
                        stat.color === 'work' ? 'bg-blue-500' :
                        stat.color === 'spirit' ? 'bg-red-500' :
                        'bg-gray-400'} transition-all`} style={{ width: `${(stat.current/stat.max)*100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="font-bold text-lg">🏆 Total Points</span>
              <span className="text-3xl font-extrabold text-violet-600 bg-violet-100 px-6 py-2 rounded-full shadow">145</span>
          </div>
        </Card>

          <Card className="col-span-3 p-6 shadow-lg rounded-2xl bg-white flex flex-col gap-4">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="text-yellow-500"><Trophy className="inline h-5 w-5" /></span>
              Recently Completed Goals
            </h2>
            <div className="flex flex-col gap-3">
              {recentlyCompletedGoals.map((goal, idx) => (
                <div key={goal.id} className={`rounded-xl p-4 flex items-center gap-4 shadow-sm ${
                  idx === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400' : 
                  idx === 1 ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400' : 
                  'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    idx === 0 ? 'bg-yellow-100' : idx === 1 ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <CheckCircle className={`h-5 w-5 ${
                      idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-blue-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base">{goal.title}</div>
                    <div className="text-sm text-gray-600 mb-1">{goal.description}</div>
                    <div className="flex gap-2">
                      {Object.keys(goal.categories).map(cat => (
                        <span key={cat} className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(cat)}`}>{cat}</span>
            ))}
          </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`font-bold text-lg ${
                      idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-blue-600' : 'text-green-600'
                    }`}>{goal.totalPoints} pts</span>
                    <span className="text-xs text-gray-500 mt-1">{goal.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className={LAYOUT.standardCard}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={TYPOGRAPHY.sectionHeader}>Trends</h3>
              <div className="flex gap-2">
                <Button
                  variant={lineRange === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLineRange('week')}
                  className="rounded-lg px-4 py-2 font-medium text-sm"
                >
                  This Week
                </Button>
                <Button
                  variant={lineRange === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLineRange('month')}
                  className="rounded-lg px-4 py-2 font-medium text-sm"
                >
                  This Month
                </Button>
                <Button
                  variant={lineRange === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLineRange('custom')}
                  className="rounded-lg px-4 py-2 font-medium text-sm"
                >
                  Custom Range
                </Button>
              </div>
              </div>
            
            {/* Date Range Inputs - Only Visible for Custom Range */}
            {lineRange === 'custom' && (
              <div className="flex gap-3 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">Start Date</label>
                  <input 
                    type="date" 
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-white" 
                    value={lineCustom.from ? format(lineCustom.from, 'yyyy-MM-dd') : ''}
                    onChange={e => setLineCustom(c => ({...c, from: new Date(e.target.value)}))} 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">End Date</label>
                  <input 
                    type="date" 
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-white" 
                    value={lineCustom.to ? format(lineCustom.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                    onChange={e => setLineCustom(c => ({...c, to: new Date(e.target.value)}))} 
                  />
                </div>
              </div>
            )}

            <div className="h-80 w-full">
              <ChartContainer 
                config={{
                  Health: { color: colors[0], label: "Health" },
                  Strength: { color: colors[1], label: "Strength" },
                  Mind: { color: colors[2], label: "Mind" },
                  Work: { color: colors[3], label: "Work" },
                  Spirit: { color: colors[4], label: "Spirit" }
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredLineData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={d => format(parseISO(d), 'MMM d')} 
                      fontSize={12}
                      tickMargin={8}
                    />
                    <YAxis fontSize={12} tickMargin={8} />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value), 'MMM dd, yyyy')}
                      formatter={(value, name) => [`${value} pts`, name]}
                    />
                    <Line type="monotone" dataKey="Health" stroke={colors[0]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="Strength" stroke={colors[1]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="Mind" stroke={colors[2]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="Work" stroke={colors[3]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="Spirit" stroke={colors[4]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </Card>
          
          <Card className={LAYOUT.standardCard}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={TYPOGRAPHY.sectionHeader}>Categories</h3>
              <div className="flex gap-2">
                <Button
                  variant={pieRange === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPieRange('week')}
                  className="rounded-lg px-4 py-2 font-medium text-sm"
                >
                  This Week
                </Button>
                <Button
                  variant={pieRange === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPieRange('month')}
                  className="rounded-lg px-4 py-2 font-medium text-sm"
                >
                  This Month
                </Button>
                <Button
                  variant={pieRange === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPieRange('custom')}
                  className="rounded-lg px-4 py-2 font-medium text-sm"
                >
                  Custom Range
                </Button>
              </div>
            </div>
            
            {/* Date Range Inputs - Only Visible for Custom Range */}
            {pieRange === 'custom' && (
              <div className="flex gap-3 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">Start Date</label>
                  <input 
                    type="date" 
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-white" 
                    value={pieCustom.from ? format(pieCustom.from, 'yyyy-MM-dd') : ''}
                    onChange={e => setPieCustom(c => ({...c, from: new Date(e.target.value)}))} 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-muted-foreground">End Date</label>
                  <input 
                    type="date" 
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-white" 
                    value={pieCustom.to ? format(pieCustom.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                    onChange={e => setPieCustom(c => ({...c, to: new Date(e.target.value)}))} 
                  />
                </div>
              </div>
            )}
            
            <div className="h-80 w-full">
              <ChartContainer 
                config={{
                  Health: { color: colors[0], label: "Health" },
                  Strength: { color: colors[1], label: "Strength" },
                  Mind: { color: colors[2], label: "Mind" },
                  Work: { color: colors[3], label: "Work" },
                  Spirit: { color: colors[4], label: "Spirit" }
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={120}
                      innerRadius={40}
                      paddingAngle={2}
                      label={({name, percentage}) => `${name}: ${percentage}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} pts`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </Card>
        </div>

        {/* Goals Section */}
        <Card className={LAYOUT.standardCard}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-destructive" />
              <h3 className={TYPOGRAPHY.sectionHeader}>Your Goals</h3>
            </div>
            {!isCreatingGoal && (
              <Button
                onClick={() => setIsCreatingGoal(true)}
                className="rounded-full px-5 py-2 font-semibold shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-all duration-200"
              >
              <Plus className="h-4 w-4 mr-2" />
                Create Goal
            </Button>
            )}
          </div>
          
          {isCreatingGoal ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Details */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="space-y-2">
                    <label className={TYPOGRAPHY.cardTitle}>Goal Title</label>
                    <input
                      type="text"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Summer Fitness Challenge"
                      className="w-full p-3 border border-border rounded-lg bg-white text-foreground"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className={TYPOGRAPHY.cardTitle}>Start Date (Optional)</label>
                    <input
                      type="date"
                      value={goalForm.startDate}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full p-3 border border-border rounded-lg bg-white text-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className={TYPOGRAPHY.cardTitle}>End Date (Required)</label>
                    <input
                      type="date"
                      value={goalForm.endDate}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full p-3 border border-border rounded-lg bg-white text-foreground"
                      required
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="lg:col-span-2 space-y-4">
                  <label className={TYPOGRAPHY.cardTitle}>Categories & Point Targets</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(goalForm.categories).map(([category, { selected, points }]) => (
                      <div key={category} className={`flex items-center gap-3 p-4 border rounded-lg transition-all duration-200 ${
                        selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={selected}
                          onChange={(e) => handleCategoryChange(category, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`category-${category}`} className="flex-1 text-sm font-medium text-foreground cursor-pointer">
                          {category}
                        </label>
                        {selected && (
                          <input
                            type="number"
                            placeholder="Points"
                            value={points}
                            onChange={(e) => handlePointsChange(category, e.target.value)}
                            className="w-24 p-2 bg-white border border-border text-foreground text-sm rounded"
                            required
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 flex gap-3">
                <Button
                  onClick={handleCreateGoal}
                  className="rounded-full px-5 py-2 font-semibold shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-all duration-200"
                >
                  Create Goal
                </Button>
                <Button
                  onClick={handleCancelGoal}
                  variant="outline"
                  className="rounded-full px-5 py-2 font-semibold shadow-md hover:scale-105 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {goals.map((goal) => {
                  const progress = (goal.currentPoints / goal.totalPoints) * 100;
                  const isIncomplete = !goal.completed && progress < 50;
                  
                  return (
                    <div 
                      key={goal.id} 
                      className={`rounded-2xl p-4 flex flex-col gap-2 shadow-lg border-2 ${getGoalBackground(goal)} relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95`}
                      onClick={() => {
                        // Add click effect - you can add modal or navigation here
                        console.log('Goal clicked:', goal.title);
                      }}
                    >
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGoal(goal.id);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors z-10"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                      
                      {/* Completion Status */}
                      <div className="flex items-center gap-2 mb-2">
                        {goal.completed ? (
                          <CheckCircle className="h-5 w-5 text-amber-600" />
                        ) : (
                          <Circle className={`h-5 w-5 ${isIncomplete ? 'text-gray-500' : 'text-emerald-300'}`} />
                        )}
                        <div className={`font-semibold text-base ${isIncomplete ? 'text-gray-600' : 'text-gray-700'}`}>
                          {goal.title}
                        </div>
                      </div>
                      
                      {/* Categories */}
                      <div className="flex gap-2 flex-wrap">
                        {Object.keys(goal.categories).map(category => (
                          <span key={category} className={`text-xs px-2 py-0.5 rounded ${isIncomplete ? 'bg-gray-300 text-gray-600' : getCategoryColor(category)}`}>
                            {category}
                          </span>
                        ))}
                      </div>
                      
                      {/* Points Progress */}
                      <div className="mt-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className={`font-medium ${isIncomplete ? 'text-gray-500' : ''}`}>
                            {goal.completed ? 'Completed' : `${goal.currentPoints}/${goal.totalPoints} pts`}
                          </span>
                          <span className={`font-bold ${goal.completed ? 'text-amber-600' : isIncomplete ? 'text-gray-500' : 'text-emerald-400'}`}>
                            {goal.totalPoints} pts
                          </span>
                        </div>
                        {!goal.completed && (
                          <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className={`h-2 rounded-full transition-all ${isIncomplete ? 'bg-gray-400' : 'bg-emerald-300'}`}
                              style={{ width: `${(goal.currentPoints / goal.totalPoints) * 100}%` }} 
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Date Range */}
                      <div className={`text-xs mt-1 ${isIncomplete ? 'text-gray-400' : 'text-gray-500'}`}>
                        {goal.startDate} - {goal.endDate}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;