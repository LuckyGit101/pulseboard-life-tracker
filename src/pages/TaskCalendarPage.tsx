import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import ToggleTabs from '@/components/ui/toggle-tabs';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STANDARD_CATEGORIES, TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';
import { apiClient, Task } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Empty tasks array for when no data is available
const emptyTasks = [];

// Transform backend points to frontend format (capitalize keys)
const transformPointsToFrontend = (points: Record<string, number> | undefined): Record<string, number> => {
  if (!points) return {};
  
  const transformed: Record<string, number> = {};
  Object.entries(points).forEach(([key, value]) => {
    // Convert lowercase backend keys to capitalized frontend keys
    const frontendKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    transformed[frontendKey] = value;
  });
  return transformed;
};

// Transform API Task to match UI expectations
const transformApiTask = (task: Task | any): typeof emptyTasks[0] => {
  // Handle both regular tasks and recurring instances
  const isRecurringInstance = task.recurringId || task.id?.startsWith('recurring_');
  
  return {
    id: task.id,
    title: task.name,
    description: task.description || task.data?.description,
    date: task.date,
    categories: task.categories || task.data?.categories || [],
    duration: task.duration || task.data?.duration || 30,
    completed: task.status === 'completed',
    points: transformPointsToFrontend(task.points || task.data?.points),
    repeatFrequency: isRecurringInstance ? 'daily' : undefined, // Default for recurring instances
    repeatCount: undefined
  };
};

// Transform frontend points to backend format (lowercase keys)
const transformPointsToBackend = (points: Record<string, number> | undefined): Record<string, number> => {
  if (!points) return {};
  
  const transformed: Record<string, number> = {};
  Object.entries(points).forEach(([key, value]) => {
    // Convert category names to lowercase for backend
    const backendKey = key.toLowerCase();
    transformed[backendKey] = value;
  });
  return transformed;
};

const TaskCalendarPage = () => {
  const { isAuthenticated } = useAuth();
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly'>('monthly');
  const [taskView, setTaskView] = useState<'daily' | 'weekly' | 'tasks'>('tasks');
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 7, 1)); // August 1, 2025 (where the recurring tasks start)
  const [tasks, setTasks] = useState<typeof emptyTasks>([]); // Start empty, load based on auth status
  const [loading, setLoading] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<typeof emptyTasks[0] | undefined>();

  // Load tasks based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    } else {
      // Load mock data for demo mode
      loadMockTasks();
    }
  }, [isAuthenticated, selectedDate, taskView]);

  const loadMockTasks = () => {
    setTasks([]);
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      let apiResponse;
      if (taskView === 'tasks') {
        // For "Other Tasks" view, get all tasks without date filter
        console.log('Loading all tasks (Other Tasks view)');
        apiResponse = await apiClient.getTasks({
          view: 'tasks'
        });
      } else if (taskView === 'weekly') {
        // For weekly view, get all tasks and filter by week range
        console.log('Loading weekly tasks');
        apiResponse = await apiClient.getTasks({
          view: 'weekly'
        });
      } else {
        // For daily view, get ALL tasks first, then filter by date on frontend
        // This ensures we get recurring tasks that might not be returned by date-specific API calls
        console.log('Loading all tasks for daily filtering');
        apiResponse = await apiClient.getTasks({
          view: 'tasks' // Get all tasks, we'll filter by date on frontend
        });
      }
      
       // Check if we have real tasks from API
       console.log('API Response:', apiResponse);
       if (apiResponse && apiResponse.length > 0) {
        // Transform API tasks to match UI structure
        const transformedTasks = apiResponse.map(transformApiTask);
        console.log('Transformed tasks:', transformedTasks);
        console.log('Sample task dates:', transformedTasks.slice(0, 3).map(t => ({ id: t.id, date: t.date, title: t.title })));
        
        // Sort tasks by date (ascending) then by name (ascending) for better testing
        const sortedTasks = transformedTasks.sort((a, b) => {
          // First sort by date (ascending - earliest first)
          if (a.date && b.date) {
            // Convert to Date objects for proper comparison
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const dateCompare = dateA.getTime() - dateB.getTime();
            if (dateCompare !== 0) return dateCompare;
          } else if (a.date && !b.date) return -1;
          else if (!a.date && b.date) return 1;
          
          // If dates are equal or both null, sort by name (ascending)
          return a.title.localeCompare(b.title);
        });
        console.log('Sorted tasks (first 5):', sortedTasks.slice(0, 5).map(t => ({ date: t.date, title: t.title })));
        console.log('Sorted tasks (last 5):', sortedTasks.slice(-5).map(t => ({ date: t.date, title: t.title })));
        
        // Apply view-specific filtering
        let filteredTasks;
        if (taskView === 'tasks') {
          // For "Other Tasks" view, only show tasks without dates
          filteredTasks = sortedTasks.filter(task => !task.date);
        } else if (taskView === 'weekly') {
          // For weekly view, filter tasks within the week (Sunday to Saturday)
          const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday = 0
          const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 }); // Saturday = 6
          
          filteredTasks = sortedTasks.filter(task => {
            if (!task.date) return false; // Exclude tasks without dates in weekly view
            const taskDate = new Date(task.date);
            return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
          });
        } else {
          // For daily view, filter tasks by selected date
          const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
          console.log('Current selected date:', selectedDate);
          console.log('Filtering tasks for date:', selectedDateStr);
          filteredTasks = sortedTasks.filter(task => {
            if (!task.date) return false; // Exclude tasks without dates in daily view
            console.log('Task date:', task.date, 'Selected date:', selectedDateStr, 'Match:', task.date === selectedDateStr);
            return task.date === selectedDateStr;
          });
        }
        
        console.log('Final filtered tasks:', filteredTasks);
        console.log('Task summary - Total:', sortedTasks.length, 'Filtered:', filteredTasks.length, 'View:', taskView);
        setTasks(filteredTasks);
      } else {
        // No real tasks found, set empty array
        setTasks([]);
      }
    } catch (error) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      await apiClient.updateTask(taskId, {
        status: task.completed ? 'pending' : 'completed'
      });
      
      // Refresh tasks
      await loadTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleTaskEdit = (task: typeof emptyTasks[0]) => {
    // Check if this is a mock task (has simple ID like '1', '2', '3')
    if (task.id && task.id.length < 10) {
      alert('Cannot edit mock task. Please create a new task instead.');
      return;
    }
    
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await apiClient.deleteTask(taskId);
      await loadTasks(); // Refresh tasks
    } catch (error) {
      // Handle delete error silently
    }
  };

  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleSaveTask = async (taskData: any, editMode?: 'single' | 'series') => {
    if (!isAuthenticated) {
      setShowTaskForm(false);
      setEditingTask(undefined);
      return;
    }

    try {
      const transformedPoints = transformPointsToBackend(taskData.points);
      
      if (editingTask) {
        // Check if this is a mock task (has simple ID like '1', '2', '3')
        if (editingTask.id && editingTask.id.length < 10) {
          alert('Cannot update mock task. Please create a new task instead.');
          setShowTaskForm(false);
          setEditingTask(undefined);
          return;
        }
        
        // Check if this is a recurring task and editMode is specified
        if (editingTask.repeatFrequency && editingTask.repeatFrequency !== 'none' && editMode === 'series') {
          // Update entire recurring series
          await apiClient.updateRecurringInstances(editingTask.id, {
            updates: {
              name: taskData.title,
              description: taskData.description,
              categories: taskData.categories,
              points: transformedPoints
            },
            filters: {
              date_from: editingTask.date // Only update future instances
            }
          });
        } else {
          // Update single task instance
        await apiClient.updateTask(editingTask.id, {
          name: taskData.title,
          description: taskData.description,
          date: taskData.date,
          categories: taskData.categories,
          points: transformedPoints
        });
        }
      } else {
        // Check if this is a recurring task
        if (taskData.repeatFrequency && taskData.repeatFrequency !== 'none') {
          // Create recurring rule
          const recurringPayload = {
            name: taskData.title,
            type: 'task' as const,
            frequency: taskData.repeatFrequency,
            interval: taskData.repeatCount || 1,
            startDate: taskData.date,
            data: {
              description: taskData.description,
              duration: taskData.duration,
              categories: taskData.categories,
              points: transformedPoints
            }
          };
          await apiClient.createRecurringRule(recurringPayload);
               } else {
         // Create regular one-time task
         const taskPayload = {
           name: taskData.title,
           description: taskData.description,
           date: taskData.date,
           categories: taskData.categories,
           points: transformedPoints,
           status: 'pending' as const
         };
         const result = await apiClient.createTask(taskPayload);
       }
      }
      
    setShowTaskForm(false);
    setEditingTask(undefined);
      await loadTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleCancelTask = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const getFilteredTasks = () => {
    // Tasks are already filtered based on the current view in loadTasks
    console.log('getFilteredTasks called, returning:', tasks.length, 'tasks');
    return tasks;
  };

  return (
    <div className="min-h-screen bg-white bg-gradient-to-b from-[#f5f6fa] to-[#e9eafc] p-6 lg:p-10">
      <div className="container mx-auto max-w-7xl space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={TYPOGRAPHY.pageTitle}>Calendar</h2>
            <p className={TYPOGRAPHY.bodyText}>Manage your tasks, meetings and schedule</p>
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
                  You're currently viewing empty data. No tasks are available in demo mode.
                </p>
                <p className="text-sm text-blue-700">
                  <strong>To create and manage real tasks:</strong> Sign in to your account and create new tasks. Real tasks will have unique IDs and can be fully edited.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Calendar View Toggle */}
            <div className="flex justify-end">
              <ToggleTabs
                value={calendarView}
                onValueChange={(value) => setCalendarView(value as 'monthly' | 'weekly')}
                items={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'weekly', label: 'Weekly' }
                ]}
              />
            </div>

            {/* Calendar Component */}
            <Card className={LAYOUT.standardCard}>
              <TaskCalendar
                view={calendarView}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                tasks={tasks}
              />
            </Card>
          </div>

          {/* Task Management Section */}
          <div className="space-y-4">
            {/* Task View Toggle */}
            <Card className={LAYOUT.actionCard}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={TYPOGRAPHY.cardTitle}>Task Management</h3>
                  <p className={TYPOGRAPHY.bodyText}>View and manage your daily tasks</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedDate(new Date(2025, 7, 1))}
                  className="text-xs"
                >
                  Go to Tasks
                </Button>
              </div>
              
              <ToggleTabs
                value={taskView}
                   onValueChange={(value) => setTaskView(value as 'daily' | 'weekly' | 'tasks')}
                items={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'tasks', label: 'Other Tasks' }
                ]}
              />
            </Card>

            {/* Task Form */}
            {showTaskForm && (
              <Card className={LAYOUT.actionCard}>
                <TaskForm
                  task={editingTask}
                  defaultDate={selectedDate.toISOString().split('T')[0]}
                  onSave={handleSaveTask}
                  onCancel={handleCancelTask}
                />
              </Card>
            )}

            {/* Task List */}
            {!showTaskForm && (
              <Card className={LAYOUT.standardCard}>
                <TaskList
                  tasks={getFilteredTasks()}
                  view={taskView}
                  selectedDate={selectedDate}
                  onTaskToggle={handleTaskToggle}
                  onTaskEdit={handleTaskEdit}
                  onTaskDelete={handleTaskDelete}
                  onAddTask={handleAddTask}
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCalendarPage;