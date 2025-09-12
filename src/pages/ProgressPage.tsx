import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatBar from '@/components/ui/stat-bar';
import ToggleTabs from '@/components/ui/toggle-tabs';
import { User, Trophy, Plus, Edit, Trash2, CheckCircle, Circle, RefreshCw, X } from 'lucide-react';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays, startOfWeek, startOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';
import { useCategories } from '@/contexts/CategoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Goal, CreateGoalRequest } from '@/lib/api';
import GoalForm from '@/components/goals/GoalForm';

// Empty stats data for when no data is available
const emptyStats = [
  { name: 'Health', current: 0, max: 100, color: 'health' as const },
  { name: 'Strength', current: 0, max: 100, color: 'strength' as const },
  { name: 'Mind', current: 0, max: 100, color: 'mind' as const },
  { name: 'Work', current: 0, max: 100, color: 'work' as const },
  { name: 'Spirit', current: 0, max: 100, color: 'spirit' as const }
];


// Empty goals data
const emptyGoals = [];

// Get recently completed goals for achievements
const recentlyCompletedGoals = emptyGoals
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

// Categories and colors for charts
const categories = ['Health', 'Strength', 'Mind', 'Work', 'Spirit'];
const colors = ['#22c55e', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444'];

// Helper function to get start date based on range
const getStartDate = (range: string, custom: { from: Date | null; to: Date | null }) => {
  const today = new Date();
  let startDate: Date;
  
  switch (range) {
    case 'week':
      startDate = startOfWeek(today);
      break;
    case 'month':
      startDate = startOfMonth(today);
      break;
    case 'custom':
      if (custom.from) {
        startDate = custom.from;
      } else {
        startDate = subDays(today, 30); // Default to 30 days
      }
      break;
    default:
      startDate = subDays(today, 30); // Default to 30 days
  }
  
  return startDate.toISOString().split('T')[0];
};

// Helper function to get end date based on range
const getEndDate = (range: string, custom: { from: Date | null; to: Date | null }) => {
  const today = new Date();
  
  if (range === 'custom' && custom.to) {
    return custom.to.toISOString().split('T')[0];
  }
  
  return today.toISOString().split('T')[0];
};

// Helper function to filter line data by date range
function filterLineData(data: any[], range: string, custom: { from: Date | null; to: Date | null }) {
  if (!data || data.length === 0) return [];
  
  const today = new Date();
  let startDate: Date;
  
  switch (range) {
    case 'week':
      startDate = startOfWeek(today);
      break;
    case 'month':
      startDate = startOfMonth(today);
      break;
    case 'custom':
      if (custom.from && custom.to) {
        return data.filter(d => {
          const date = parseISO(d.date);
          return isWithinInterval(date, { start: custom.from!, end: custom.to! });
        });
      }
      return data;
    default:
      return data;
  }
  
  return data.filter(d => {
    const date = parseISO(d.date);
    return isWithinInterval(date, { start: startDate, end: today });
  });
}

// Helper function to get pie chart data from line data
function getPieData(filteredLineData: any[]) {
  if (!filteredLineData || filteredLineData.length === 0) {
    return categories.map((cat, i) => ({ 
      name: cat, 
      value: 0, 
      color: colors[i],
      percentage: 0
    }));
  }
  
  // Use the last entry for current distribution
  const last = filteredLineData[filteredLineData.length - 1] || {};
  
  return categories.map((cat, i) => {
    const rawValue = last[cat] || 0;
    // Show 0 for negative values in charts (as requested)
    const displayValue = Math.max(0, rawValue);
    
    return { 
    name: cat, 
      value: displayValue, 
    color: colors[i],
      rawValue: rawValue, // Keep raw value for other calculations
      percentage: 0
    };
  }).map(item => {
    const total = categories.reduce((sum, cat) => {
      const rawValue = last[cat] || 0;
      return sum + Math.max(0, rawValue); // Use display values for percentage calculation
    }, 0);
    
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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New state for real points data
  const [lineData, setLineData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [pieTotals, setPieTotals] = useState<Record<string, number> | null>(null);
  

  // Load goals based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      loadGoals();
      loadPointsData(); // Load real points data
    } else {
      // Load mock data for demo mode
      loadMockGoals();
      loadMockPointsData();
    }
  }, [isAuthenticated]);

  // Load points data when range changes
  useEffect(() => {
    if (isAuthenticated) {
      loadPointsData();
    }
  }, [lineRange, lineCustom, pieRange, pieCustom]);

  const loadMockGoals = () => {
    setGoals(emptyGoals);
  };

  const loadMockPointsData = () => {
    setLineData([]);
    setStatsData(emptyStats);
    setTotalPoints(0);
  };

  const loadGoals = async () => {
    setLoading(true);
    try {
      const apiGoals = await apiClient.getGoals();
      // Ensure apiGoals is always an array
      setGoals(Array.isArray(apiGoals) ? apiGoals : []);
    } catch (error) {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPointsData = async () => {
    if (!isAuthenticated) return;
    
    setLoadingPoints(true);
    try {
      // Lifetime tile
      const lifetimeResp = await apiClient.getPointsSummary({ period: 'lifetime' });
      if (lifetimeResp) {
        setTotalPoints(lifetimeResp.total || 0);
        // Use new achievable points fields if available, fallback to legacy fields
        const achievableCategories = lifetimeResp.achievableCategories || lifetimeResp.totalPossible || {};
        
        // Calculate category percentages using achievable points as maximum
        const lifetimeStats = categories.map((cat, idx) => {
          const categoryKey = cat.toLowerCase();
          const actualPoints = Math.max(0, (lifetimeResp.categories?.[categoryKey] ?? 0));
          const achievablePoints = Math.max(actualPoints, (achievableCategories?.[categoryKey] ?? 0));
          
          return {
            name: cat,
            current: actualPoints,
            max: achievablePoints || 100, // Use achievable points as maximum for percentage calculation
            color: ['health', 'strength', 'mind', 'work', 'spirit'][idx] as any
          };
        });
        setStatsData(lifetimeStats);
      } else {
        setTotalPoints(0);
      }

      // Line chart date range from line controls
      let startDateAny: any = getStartDate(lineRange, lineCustom);
      let endDateAny: any = getEndDate(lineRange, lineCustom);
      const startDate = (startDateAny instanceof Date) ? startDateAny : new Date(startDateAny);
      const endDate = (endDateAny instanceof Date) ? endDateAny : new Date(endDateAny);
      const df = startDate.toISOString().split('T')[0];
      const dt = endDate.toISOString().split('T')[0];

      // Pie chart totals should be independently controlled by the pie controls
      let pieStartAny: any = getStartDate(pieRange, pieCustom);
      let pieEndAny: any = getEndDate(pieRange, pieCustom);
      const pieStart = (pieStartAny instanceof Date) ? pieStartAny : new Date(pieStartAny);
      const pieEnd = (pieEndAny instanceof Date) ? pieEndAny : new Date(pieEndAny);
      const pdf = pieStart.toISOString().split('T')[0];
      const pdt = pieEnd.toISOString().split('T')[0];

      // Pie chart totals for its own range
      const rangeTotalsResp = await apiClient.getPointsSummary({ date_from: pdf, date_to: pdt });
      if (rangeTotalsResp) {
        setPieTotals(rangeTotalsResp.categories || null);
      } else {
        setPieTotals(null);
      }

      // Line chart cumulative series for range using new API
      const cumulativeResp = await apiClient.getDailyCumulative({ date_from: df, date_to: dt });
      if (cumulativeResp && cumulativeResp.series) {
        // Transform the series data for the line chart
        const transformedData = cumulativeResp.series.map(item => ({
          date: item.date,
          Health: item.categories.health || 0,
          Strength: item.categories.strength || 0,
          Mind: item.categories.mind || 0,
          Work: item.categories.work || 0,
          Spirit: item.categories.spirit || 0,
        }));
        setLineData(transformedData);
      } else {
        setLineData([]);
      }

      // Auto-sync goals when points data loads
      if (goals && Array.isArray(goals) && goals.length > 0) {
        try {
          await apiClient.syncGoalProgress();
          // Reload goals after sync
          await loadGoals();
        } catch (syncError) {
          console.error('Auto goal sync failed:', syncError);
        }
      }
       
    } catch (error) {
      console.error('Error loading points data:', error);
      // On error, set empty data
      setLineData([]);
      // Do not reset lifetime tile if it was already set successfully
    } finally {
      setLoadingPoints(false);
    }
  };

  const filteredLineData = filterLineData(lineData, lineRange, lineCustom);
  let pieData: any[] = [];
  if (pieTotals) {
    const total = categories.reduce((sum, cat) => sum + Math.max(0, (pieTotals![cat.toLowerCase()] || 0)), 0);
    pieData = categories.map((cat, i) => {
      const raw = Math.max(0, (pieTotals![cat.toLowerCase()] || 0));
      return {
        name: cat,
        value: raw,
        color: colors[i],
        rawValue: raw,
        percentage: total > 0 ? Math.round((raw / total) * 100) : 0,
      };
    });
  } else {
    const filteredPieData = filterLineData(lineData, pieRange, pieCustom);
    pieData = getPieData(filteredPieData);
  }

  const handleCreateGoal = async (goalData: any) => {
    try {
      if (isAuthenticated) {
        const newGoal = await apiClient.createGoal(goalData);
        setGoals(prev => [...prev, newGoal]);
        // Immediately reload goals to ensure proper formatting
        await loadGoals();
      } else {
        // Demo mode - create mock goal
        const newGoal = {
          id: Date.now().toString(),
          name: goalData.name,
          description: goalData.description,
          startDate: goalData.startDate || undefined,
          targetDate: goalData.targetDate,
          category: goalData.category,
          progress: 0,
          status: 'active' as const,
          currentValue: 0,
          targetValue: Object.values(goalData.points).reduce((sum: number, points: any) => sum + points, 0),
          points: goalData.points,
          userId: 'demo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setGoals(prev => [...prev, newGoal]);
      }
      
      setIsCreatingGoal(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      if (isAuthenticated) {
        await apiClient.deleteGoal(goalId);
      }
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      if (isAuthenticated) {
        const updatedGoal = await apiClient.updateGoal(goalId, updates);
        setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const handleSyncGoals = async () => {
    try {
      if (isAuthenticated) {
        await apiClient.syncGoalProgress();
        // Reload goals after sync
        await loadGoals();
      }
    } catch (error) {
      // Handle sync error silently
    }
  };

  const handleCancelGoal = () => {
    setIsCreatingGoal(false);
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

  const getGoalBackground = (goal: Goal) => {
    if (goal.status === 'completed') return 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-400 shadow-amber-100';
    const progress = goal.progress || 0;
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
                  You're currently viewing empty data. No goals or progress data are available in demo mode.
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
              {statsData.map((stat, idx) => (
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
                      <span className="font-semibold text-violet-500 text-sm">{Math.round((stat.current / stat.max) * 100)}%</span>
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
              <span className="text-3xl font-extrabold text-violet-600 bg-violet-100 px-6 py-2 rounded-full shadow">
                {loadingPoints ? '...' : totalPoints}
              </span>
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
                    value={lineCustom.to ? format(lineCustom.to, 'yyyy-MM-dd') : ''}
                  onChange={e => setLineCustom(c => ({...c, to: new Date(e.target.value)}))} 
                />
              </div>
        </div>
            )}

            <div className="h-80 w-full">
              {loadingPoints ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading points data...</p>
                  </div>
                </div>
              ) : filteredLineData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No data available for selected range</p>
                  </div>
                </div>
              ) : (
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
              )}
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
                    value={pieCustom.to ? format(pieCustom.to, 'yyyy-MM-dd') : ''}
                  onChange={e => setPieCustom(c => ({...c, to: new Date(e.target.value)}))} 
                />
              </div>
            </div>
            )}
            
            <div className="h-80 w-full">
              {loadingPoints ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading points data...</p>
                  </div>
                </div>
              ) : pieData.length === 0 || pieData.every(item => item.value === 0) ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No data available for selected range</p>
                  </div>
                </div>
              ) : (
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
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} pts`, name]}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            return (
                              <div className="bg-white p-3 border border-border rounded-lg shadow-lg">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {data.value} points ({data.payload.percentage}%)
                                </p>
                                {data.payload.rawValue < 0 && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Raw value: {data.payload.rawValue} (overdue penalty)
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Goals Section */}
        <Card className={LAYOUT.standardCard}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={TYPOGRAPHY.sectionHeader}>Goals</h3>
            <div className="flex gap-2">
              {isAuthenticated && goals && Array.isArray(goals) && goals.length > 0 && (
                <Button
                  onClick={handleSyncGoals}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Goals
                </Button>
              )}
              <Button
                onClick={() => setIsCreatingGoal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </div>
          </div>
          
          {!goals || !Array.isArray(goals) || goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h4>
              <p className="text-gray-500 mb-4">Create your first goal to start tracking progress</p>
              <Button
                onClick={() => setIsCreatingGoal(true)}
                variant="outline"
                className="bg-white"
              >
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals && Array.isArray(goals) && goals.map((goal) => {
                // Use backend-calculated progress or calculate from goal data
                const goalCategory = (goal.category || 'health').toLowerCase();
                const currentPoints = goal.currentValue || 0;
                const targetPoints = goal.points?.[goalCategory] || 0;
                const progress = goal.progress || (targetPoints > 0 ? (currentPoints / targetPoints) * 100 : 0);
                const isCompleted = goal.status === 'completed';
                const isIncomplete = progress < 100 && !isCompleted;
                
                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${getGoalBackground(goal)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base font-semibold text-gray-900">{goal.name}</h4>
                          {isCompleted && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-700">Progress</span>
                            <span className="text-xs font-semibold text-gray-900">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                  : progress >= 50
                                  ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                                  : 'bg-gradient-to-r from-blue-400 to-blue-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Categories and Points */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {goal.points && Object.entries(goal.points).map(([category, points]) => (
                            <div
                              key={category}
                              className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-full border border-gray-200"
                            >
                              <span className="text-xs font-medium text-gray-700 capitalize">{category}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded-full">
                                {currentPoints}/{points} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Handle edit */}}
                          className="text-gray-600 hover:text-gray-800 h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Date Range */}
                    <div className={`text-xs mt-1 ${isIncomplete ? 'text-gray-400' : 'text-gray-500'}`}>
                      {goal.startDate ? `Start: ${new Date(goal.startDate).toLocaleDateString()}` : 'Start: Not set'} - Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Goal Creation Modal */}
          {isCreatingGoal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-xl w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Create New Goal</h3>
                  <Button variant="ghost" size="sm" onClick={handleCancelGoal}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <GoalForm
                  onSave={handleCreateGoal}
                  onCancel={handleCancelGoal}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;