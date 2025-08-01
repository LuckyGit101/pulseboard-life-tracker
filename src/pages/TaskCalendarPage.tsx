import { useState } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import ToggleTabs from '@/components/ui/toggle-tabs';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STANDARD_CATEGORIES, TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';

// Mock data - Updated to use only 5 standard categories
const mockTasks = [
  // July 11, 2025 - Main day with many tasks
  {
    id: '1',
    title: 'Morning Workout',
    description: 'Full body home workout',
    date: '2025-07-11',
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
    date: '2025-07-11',
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
    date: '2025-07-11',
    categories: ['Mind'],
    duration: 60,
    completed: false,
    points: { Mind: 2 }
  },
  {
    id: '4',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-07-11',
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
    date: '2025-07-11',
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
    date: '2025-07-11',
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
    date: '2025-07-11',
    categories: ['Mind'],
    duration: 45,
    completed: false,
    points: { Mind: 3 }
  },
  {
    id: '8',
    title: 'Team Meeting',
    description: 'Daily standup with development team',
    date: '2025-07-11',
    categories: ['Work'],
    duration: 30,
    completed: true,
    points: { Work: 1 }
  },
  {
    id: '9',
    title: 'Meditation',
    description: 'Evening mindfulness practice',
    date: '2025-07-11',
    categories: ['Spirit'],
    duration: 20,
    completed: false,
    points: { Spirit: 1 }
  },
  {
    id: '10',
    title: 'Code Review',
    description: 'Review pull requests from team members',
    date: '2025-07-11',
    categories: ['Work', 'Mind'],
    duration: 60,
    completed: false,
    points: { Work: 2, Mind: 1 }
  },

  // July 12, 2025 - Another day with tasks
  {
    id: '11',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-07-12',
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
    date: '2025-07-12',
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
    date: '2025-07-12',
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
    date: '2025-07-12',
    categories: ['Work'],
    duration: 120,
    completed: false,
    points: { Work: 4 }
  },
  {
    id: '15',
    title: 'Yoga Session',
    description: 'Evening yoga for flexibility',
    date: '2025-07-12',
    categories: ['Health', 'Spirit'],
    duration: 60,
    completed: false,
    points: { Health: 2, Spirit: 2 }
  },

  // July 13, 2025
  {
    id: '16',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-07-13',
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
    date: '2025-07-13',
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
    date: '2025-07-13',
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
    date: '2025-07-13',
    categories: ['Work', 'Mind'],
    duration: 180,
    completed: false,
    points: { Work: 3, Mind: 2 }
  },
  {
    id: '20',
    title: 'Book Reading',
    description: 'Read Atomic Habits',
    date: '2025-07-13',
    categories: ['Mind', 'Spirit'],
    duration: 45,
    completed: false,
    points: { Mind: 2, Spirit: 1 }
  },

  // July 14, 2025
  {
    id: '21',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-07-14',
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
    date: '2025-07-14',
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
    date: '2025-07-14',
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
    date: '2025-07-14',
    categories: ['Health'],
    duration: 60,
    completed: false,
    points: { Health: 3 }
  },
  {
    id: '25',
    title: 'Learn React Native',
    description: 'Study mobile app development',
    date: '2025-07-14',
    categories: ['Mind'],
    duration: 120,
    completed: false,
    points: { Mind: 4 }
  },

  // July 15, 2025
  {
    id: '26',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-07-15',
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
    date: '2025-07-15',
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
    date: '2025-07-15',
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
    date: '2025-07-15',
    categories: ['Work'],
    duration: 90,
    completed: false,
    points: { Work: 3 }
  },
  {
    id: '30',
    title: 'Friend Meetup',
    description: 'Dinner with college friends',
    date: '2025-07-15',
    categories: ['Spirit'],
    duration: 180,
    completed: false,
    points: { Spirit: 3 }
  },

  // July 16, 2025
  {
    id: '31',
    title: 'Gym',
    description: 'Daily gym session with weights and cardio',
    date: '2025-07-16',
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
    date: '2025-07-16',
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
    date: '2025-07-16',
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
    date: '2025-07-16',
    categories: ['Health'],
    duration: 30,
    completed: false,
    points: { Health: 2 }
  },
  {
    id: '35',
    title: 'Grocery Shopping',
    description: 'Weekly grocery run',
    date: '2025-07-16',
    categories: ['Work'],
    duration: 60,
    completed: false,
    points: { Work: 1 }
  }
];

const TaskCalendarPage = () => {
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly'>('monthly');
  const [taskView, setTaskView] = useState<'daily' | 'weekly' | 'goals'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 6, 11)); // July 11, 2025
  const [tasks] = useState(mockTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<typeof mockTasks[0] | undefined>();

  const handleTaskToggle = (taskId: string) => {
    console.log('Toggle task:', taskId);
  };

  const handleTaskEdit = (task: typeof mockTasks[0]) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleTaskDelete = (taskId: string) => {
    console.log('Delete task:', taskId);
  };

  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleSaveTask = (taskData: any) => {
    console.log('Save task:', taskData);
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleCancelTask = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const getFilteredTasks = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    switch (taskView) {
      case 'daily':
        // Show tasks for selected date only
        return tasks.filter(task => task.date === dateStr);
      
      case 'weekly':
        // Show tasks for the entire week of selected date
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return tasks.filter(task => {
          if (!task.date) return false;
          const taskDate = new Date(task.date);
          return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
        });
      
      case 'goals':
        // Show tasks with no date (goals)
        return tasks.filter(task => !task.date);
      
      default:
        return tasks.filter(task => task.date === dateStr);
    }
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
                onValueChange={(value) => setTaskView(value as 'daily' | 'weekly' | 'goals')}
                items={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'goals', label: 'Goals' }
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