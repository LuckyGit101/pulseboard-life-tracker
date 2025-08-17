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

// Mock data - Updated to use only 5 standard categories
const mockTasks = [
  // August 24, 2025 - Main day with many tasks (matching the selected date)
  {
    id: '1',
    title: 'Morning Workout',
    description: 'Full body home workout',
    date: '2025-08-24',
    categories: ['Health', 'Strength'],
    duration: 45,
    completed: false,
    repeatFrequency: 'daily' as const,
    repeatCount: 30,
    points: { Health: 1, Strength: 1 }
  },
  {
    id: '2',
    title: 'Repeating Daily',
    description: 'Daily routine task',
    date: '2025-08-24',
    categories: ['Work'],
    duration: 20,
    completed: true,
    repeatFrequency: 'daily' as const,
    points: { Work: 1 }
  },
  {
    id: '3',
    title: 'Learn React',
    description: 'Study modern React patterns',
    date: '2025-08-24',
    categories: ['Mind'],
    duration: 60,
    completed: false,
    points: { Mind: 2 }
  },
  {
    id: '4',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-08-24',
    categories: ['Health', 'Strength'],
    duration: 90,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2, Strength: 2 }
  },
  {
    id: '5',
    title: 'Get Ready',
    description: 'Morning routine - shower, dress, breakfast',
    date: '2025-08-24',
    categories: ['Health'],
    duration: 30,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 1 }
  },
  {
    id: '6',
    title: 'Eat 200 calories',
    description: 'Track daily calorie intake',
    date: '2025-08-24',
    categories: ['Health'],
    duration: 0,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2 },
    targetValue: 200,
    currentValue: 100,
    unit: 'cal',
    isProgressTask: true
  },
  {
    id: '7',
    title: 'Read Programming Book',
    description: 'Study advanced JavaScript concepts',
    date: '2025-08-24',
    categories: ['Mind'],
    duration: 45,
    completed: false,
    points: { Mind: 3 }
  },
  {
    id: '8',
    title: 'Team Meeting',
    description: 'Daily standup with development team',
    date: '2025-08-24',
    categories: ['Work'],
    duration: 30,
    completed: true,
    points: { Work: 1 }
  },
  {
    id: '9',
    title: 'Meditation',
    description: 'Evening mindfulness practice',
    date: '2025-08-24',
    categories: ['Spirit'],
    duration: 20,
    completed: false,
    points: { Spirit: 1 }
  },
  {
    id: '10',
    title: 'Code Review',
    description: 'Review pull requests from team members',
    date: '2025-08-24',
    categories: ['Work', 'Mind'],
    duration: 60,
    completed: false,
    points: { Work: 2, Mind: 1 }
  },

  // August 25, 2025 - Another day with tasks
  {
    id: '11',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-08-25',
    categories: ['Health', 'Strength'],
    duration: 90,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2, Strength: 2 }
  },
  {
    id: '12',
    title: 'Get Ready',
    description: 'Morning routine - shower, dress, breakfast',
    date: '2025-08-25',
    categories: ['Health'],
    duration: 30,
    completed: true,
    repeatFrequency: 'daily' as const,
    points: { Health: 1 }
  },
  {
    id: '13',
    title: 'Eat 200 calories',
    description: 'Track daily calorie intake',
    date: '2025-08-25',
    categories: ['Health'],
    duration: 0,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2 },
    targetValue: 200,
    currentValue: 150,
    unit: 'cal',
    isProgressTask: true
  },
  {
    id: '14',
    title: 'Client Presentation',
    description: 'Present quarterly results to client',
    date: '2025-08-25',
    categories: ['Work'],
    duration: 120,
    completed: false,
    points: { Work: 4 }
  },
  {
    id: '15',
    title: 'Yoga Session',
    description: 'Evening yoga for flexibility',
    date: '2025-08-25',
    categories: ['Health', 'Spirit'],
    duration: 60,
    completed: false,
    points: { Health: 2, Spirit: 2 }
  },

  // August 26, 2025
  {
    id: '16',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-08-26',
    categories: ['Health', 'Strength'],
    duration: 90,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2, Strength: 2 }
  },
  {
    id: '17',
    title: 'Get Ready',
    description: 'Morning routine - shower, dress, breakfast',
    date: '2025-08-26',
    categories: ['Health'],
    duration: 30,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 1 }
  },
  {
    id: '18',
    title: 'Eat 200 calories',
    description: 'Track daily calorie intake',
    date: '2025-08-26',
    categories: ['Health'],
    duration: 0,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2 },
    targetValue: 200,
    currentValue: 75,
    unit: 'cal',
    isProgressTask: true
  },
  {
    id: '19',
    title: 'Database Optimization',
    description: 'Optimize application database queries',
    date: '2025-08-26',
    categories: ['Work', 'Mind'],
    duration: 180,
    completed: false,
    points: { Work: 3, Mind: 2 }
  },
  {
    id: '20',
    title: 'Book Reading',
    description: 'Read Atomic Habits',
    date: '2025-08-26',
    categories: ['Mind', 'Spirit'],
    duration: 45,
    completed: false,
    points: { Mind: 2, Spirit: 1 }
  },

  // August 27, 2025
  {
    id: '21',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-08-27',
    categories: ['Health', 'Strength'],
    duration: 90,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2, Strength: 2 }
  },
  {
    id: '22',
    title: 'Get Ready',
    description: 'Morning routine - shower, dress, breakfast',
    date: '2025-08-27',
    categories: ['Health'],
    duration: 30,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 1 }
  },
  {
    id: '23',
    title: 'Eat 200 calories',
    description: 'Track daily calorie intake',
    date: '2025-08-27',
    categories: ['Health'],
    duration: 0,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2 },
    targetValue: 200,
    currentValue: 0,
    unit: 'cal',
    isProgressTask: true
  },
  {
    id: '24',
    title: 'Swimming',
    description: 'Swimming practice at club',
    date: '2025-08-27',
    categories: ['Health'],
    duration: 60,
    completed: false,
    points: { Health: 3 }
  },
  {
    id: '25',
    title: 'Learn React Native',
    description: 'Study mobile app development',
    date: '2025-08-27',
    categories: ['Mind'],
    duration: 120,
    completed: false,
    points: { Mind: 4 }
  },

  // August 28, 2025
  {
    id: '26',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-08-28',
    categories: ['Health', 'Strength'],
    duration: 90,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2, Strength: 2 }
  },
  {
    id: '27',
    title: 'Get Ready',
    description: 'Morning routine - shower, dress, breakfast',
    date: '2025-08-28',
    categories: ['Health'],
    duration: 30,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 1 }
  },
  {
    id: '28',
    title: 'Eat 200 calories',
    description: 'Track daily calorie intake',
    date: '2025-08-28',
    categories: ['Health'],
    duration: 0,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2 },
    targetValue: 200,
    currentValue: 50,
    unit: 'cal',
    isProgressTask: true
  },
  {
    id: '29',
    title: 'Project Planning',
    description: 'Plan next quarter objectives',
    date: '2025-08-28',
    categories: ['Work'],
    duration: 90,
    completed: false,
    points: { Work: 3 }
  },
  {
    id: '30',
    title: 'Friend Meetup',
    description: 'Dinner with college friends',
    date: '2025-08-28',
    categories: ['Spirit'],
    duration: 180,
    completed: false,
    points: { Spirit: 3 }
  },

  // August 29, 2025
  {
    id: '31',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-08-29',
    categories: ['Health', 'Strength'],
    duration: 90,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2, Strength: 2 }
  },
  {
    id: '32',
    title: 'Get Ready',
    description: 'Morning routine - shower, dress, breakfast',
    date: '2025-08-29',
    categories: ['Health'],
    duration: 30,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 1 }
  },
  {
    id: '33',
    title: 'Eat 200 calories',
    description: 'Track daily calorie intake',
    date: '2025-08-29',
    categories: ['Health'],
    duration: 0,
    completed: false,
    repeatFrequency: 'daily' as const,
    points: { Health: 2 },
    targetValue: 200,
    currentValue: 25,
    unit: 'cal',
    isProgressTask: true
  },
  {
    id: '34',
    title: 'Evening Run',
    description: 'Cardio session in the park',
    date: '2025-08-29',
    categories: ['Health'],
    duration: 30,
    completed: false,
    points: { Health: 2 }
  },
  {
    id: '35',
    title: 'Grocery Shopping',
    description: 'Weekly grocery run',
    date: '2025-08-29',
    categories: ['Work'],
    duration: 60,
    completed: false,
    points: { Work: 1 }
  },

  // August 17, 2025 - Current selected date
  {
    id: '36',
    title: 'Morning Exercise',
    description: 'Quick morning workout',
    date: '2025-08-17',
    categories: ['Health'],
    duration: 30,
    completed: false,
    points: { Health: 2 }
  },
  {
    id: '37',
    title: 'Work Meeting',
    description: 'Team sync meeting',
    date: '2025-08-17',
    categories: ['Work'],
    duration: 60,
    completed: true,
    points: { Work: 1 }
  },

  // August 18, 2025
  {
    id: '38',
    title: 'Gym Session',
    description: 'Full body workout',
    date: '2025-08-18',
    categories: ['Health', 'Strength'],
    duration: 90,
    completed: false,
    points: { Health: 2, Strength: 2 }
  },
  {
    id: '39',
    title: 'Code Review',
    description: 'Review team PRs',
    date: '2025-08-18',
    categories: ['Work', 'Mind'],
    duration: 45,
    completed: false,
    points: { Work: 2, Mind: 1 }
  },

  // August 19, 2025
  {
    id: '40',
    title: 'Yoga Class',
    description: 'Evening yoga session',
    date: '2025-08-19',
    categories: ['Health', 'Spirit'],
    duration: 60,
    completed: false,
    points: { Health: 2, Spirit: 2 }
  },
  {
    id: '41',
    title: 'Reading Time',
    description: 'Read technical articles',
    date: '2025-08-19',
    categories: ['Mind'],
    duration: 30,
    completed: false,
    points: { Mind: 2 }
  },

     // August 20, 2025
   {
     id: '42',
     title: 'Swimming',
     description: 'Pool workout',
     date: '2025-08-20',
     categories: ['Health'],
     duration: 45,
     completed: false,
     points: { Health: 3 }
   },
   {
     id: '43',
     title: 'Project Planning',
     description: 'Plan next sprint',
     date: '2025-08-20',
     categories: ['Work'],
     duration: 120,
     completed: false,
     points: { Work: 3 }
   },

   // Tasks without dates (for "Tasks" view)
   {
     id: '44',
     title: 'Get New Shoes',
     description: 'Buy new running shoes',
     date: undefined,
     categories: ['Health'],
     duration: 60,
     completed: false,
     points: { Health: 2 }
   },
   {
     id: '45',
     title: 'Read Programming Book',
     description: 'Finish reading Clean Code',
     date: undefined,
     categories: ['Mind'],
     duration: 90,
     completed: false,
     points: { Mind: 3 }
   },
   {
     id: '46',
     title: 'Organize Desk',
     description: 'Clean and organize workspace',
     date: undefined,
     categories: ['Work'],
     duration: 30,
     completed: true,
     points: { Work: 1 }
   },
   {
     id: '47',
     title: 'Call Mom',
     description: 'Weekly call with family',
     date: undefined,
     categories: ['Spirit'],
     duration: 20,
     completed: false,
     points: { Spirit: 2 }
   },
   {
     id: '48',
     title: 'Learn Guitar',
     description: 'Practice guitar for 30 minutes',
     date: undefined,
     categories: ['Mind', 'Spirit'],
     duration: 30,
     completed: false,
     points: { Mind: 2, Spirit: 1 }
   }
 ];

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
const transformApiTask = (task: Task | any): typeof mockTasks[0] => {
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
  const [taskView, setTaskView] = useState<'daily' | 'weekly' | 'tasks'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 7, 24)); // August 24, 2025 (where the recurring task was created)
  const [tasks, setTasks] = useState<typeof mockTasks>(mockTasks); // Start with mock, replace with real
  const [loading, setLoading] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<typeof mockTasks[0] | undefined>();

  // Load real tasks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated, selectedDate, taskView]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      console.log('Loading tasks from API...');
      
      // Load tasks for the selected date only
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log('Loading tasks for date:', selectedDateStr);
      
      let apiResponse;
      if (taskView === 'tasks') {
        // For tasks view, get all tasks without date filter
        console.log('Fetching all tasks for "Tasks" view...');
        apiResponse = await apiClient.getTasks({
          view: 'monthly'
        });
      } else {
        // For daily/weekly, get tasks for specific date
        console.log('Fetching tasks for date:', selectedDateStr, 'view:', taskView);
        apiResponse = await apiClient.getTasks({
          date: selectedDateStr,
          view: taskView
        });
      }
             console.log('API Response:', apiResponse);
       console.log('API Response type:', typeof apiResponse);
       console.log('API Response length:', apiResponse?.length);
       console.log('API Response is array:', Array.isArray(apiResponse));
              console.log('API Response details:', JSON.stringify(apiResponse, null, 2));
       console.log('API Response first task date:', apiResponse[0]?.date);
       console.log('API Response first task userId:', apiResponse[0]?.userId);
       
       // Check if we have real tasks from API
       if (apiResponse && apiResponse.length > 0) {
        // Transform API tasks to match UI structure
        const transformedTasks = apiResponse.map(transformApiTask);
        console.log('Using real tasks:', transformedTasks.length, 'tasks');
        
        // Filter based on view
        if (taskView === 'tasks') {
          // For tasks view, only show tasks without dates
          const tasksWithoutDate = transformedTasks.filter(task => !task.date);
          console.log('Tasks without dates:', tasksWithoutDate.length, 'tasks');
          setTasks(tasksWithoutDate);
        } else {
          // For daily/weekly, show all tasks (already filtered by date in API)
          setTasks(transformedTasks);
        }
      } else {
        // No real tasks, use mock data
        if (taskView === 'tasks') {
          // For tasks view, show all tasks without dates
          console.log('No real tasks found, using mock data for tasks without dates');
          const mockTasksWithoutDate = mockTasks.filter(task => !task.date);
          console.log('Mock tasks without dates:', mockTasksWithoutDate);
          setTasks(mockTasksWithoutDate);
        } else {
          // For daily/weekly, use mock data for the selected date only
          console.log('No real tasks found, using mock data for date:', selectedDateStr);
          const mockTasksForDate = mockTasks.filter(task => task.date === selectedDateStr);
          console.log('Mock tasks for date:', selectedDateStr, ':', mockTasksForDate);
          setTasks(mockTasksForDate);
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      // Fallback to mock data
      if (taskView === 'tasks') {
        // For tasks view, show all tasks without dates
        const mockTasksWithoutDate = mockTasks.filter(task => !task.date);
        console.log('Fallback to mock data for tasks without dates:', mockTasksWithoutDate);
        setTasks(mockTasksWithoutDate);
      } else {
        // For daily/weekly, use mock data for the selected date only
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const mockTasksForDate = mockTasks.filter(task => task.date === selectedDateStr);
        console.log('Fallback to mock data for date:', selectedDateStr, ':', mockTasksForDate);
        setTasks(mockTasksForDate);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string) => {
    if (!isAuthenticated) {
      console.log('Mock toggle task:', taskId);
      return;
    }

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      console.log('Toggling task:', taskId);
      await apiClient.updateTask(taskId, {
        status: task.completed ? 'pending' : 'completed'
      });
      
      // Refresh tasks
      await loadTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleTaskEdit = (task: typeof mockTasks[0]) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!isAuthenticated) {
      console.log('Mock delete task:', taskId);
      return;
    }

    try {
      console.log('Deleting task:', taskId);
      await apiClient.deleteTask(taskId);
      await loadTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleSaveTask = async (taskData: any) => {
    if (!isAuthenticated) {
      console.log('Mock save task:', taskData);
      setShowTaskForm(false);
      setEditingTask(undefined);
      return;
    }

    try {
      const transformedPoints = transformPointsToBackend(taskData.points);
      console.log('Saving task:', taskData);
      console.log('Original points:', taskData.points);
      console.log('Transformed points for backend:', transformedPoints);
      
      if (editingTask) {
        // Update existing task
        await apiClient.updateTask(editingTask.id, {
          name: taskData.title,
          description: taskData.description,
          date: taskData.date,
          categories: taskData.categories,
          points: transformedPoints
        });
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
          console.log('Creating recurring task with payload:', recurringPayload);
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
         console.log('Creating one-time task with payload:', taskPayload);
         console.log('Task date format:', taskData.date, 'Type:', typeof taskData.date);
         const result = await apiClient.createTask(taskPayload);
         console.log('Task creation result:', result);
         console.log('Task creation successful, refreshing tasks...');
         console.log('Created task details:', result.task);
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
    // Since we're already filtering by date in loadTasks, just return the tasks
    // They should already be for the selected date
    console.log('Returning tasks for selected date:', tasks.length, 'tasks');
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
              </div>
              
              <ToggleTabs
                value={taskView}
                   onValueChange={(value) => setTaskView(value as 'daily' | 'weekly' | 'tasks')}
                items={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                     { value: 'tasks', label: 'Tasks' }
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