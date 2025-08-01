import { useState } from 'react';
import { Clock, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { STANDARD_CATEGORIES, TYPOGRAPHY } from '@/lib/designSystem';

interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  categories: string[];
  duration: number;
  completed: boolean;
  repeatFrequency?: 'none' | 'daily' | 'weekly' | 'monthly';
  repeatCount?: number;
  points?: { [category: string]: number };
  // New fields for calorie tracking
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  isProgressTask?: boolean;
}

interface TaskListProps {
  tasks: Task[];
  view: 'daily' | 'weekly' | 'goals';
  selectedDate: Date;
  onTaskToggle: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onAddTask: () => void;
}

// Updated category colors to match the 5 standard categories
const categoryColors: { [key: string]: string } = {
  health: 'bg-green-500',
  strength: 'bg-yellow-500',
  mind: 'bg-purple-500',
  work: 'bg-blue-500',
  spirit: 'bg-red-500'
};

const TaskList = ({ 
  tasks, 
  view, 
  selectedDate, 
  onTaskToggle, 
  onTaskEdit, 
  onTaskDelete, 
  onAddTask 
}: TaskListProps) => {
  const [taskProgress, setTaskProgress] = useState<{ [key: string]: number }>({});

  const handleProgressChange = (taskId: string, value: number[]) => {
    setTaskProgress(prev => ({
      ...prev,
      [taskId]: value[0]
    }));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className={TYPOGRAPHY.sectionHeader}>Daily Tasks</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length} tasks
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onAddTask}
            size="sm"
            className="rounded-full px-4 py-2 text-sm font-semibold shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-lg font-medium mb-2">No tasks found for this time period.</div>
            <Button
              onClick={onAddTask}
              variant="outline"
              size="sm"
              className="rounded-full px-4 py-2 font-semibold shadow-md hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first task
            </Button>
          </div>
        ) : (
          tasks.map((task) => {
            const isProgressTask = task.isProgressTask && task.targetValue;
            const currentProgress = taskProgress[task.id] || task.currentValue || 0;
            const progressPercentage = isProgressTask ? Math.min((currentProgress / task.targetValue!) * 100, 100) : 0;
            const isCompleted = task.completed || (isProgressTask && progressPercentage >= 100);
            
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 min-w-0",
                  isCompleted 
                    ? "bg-gray-50 border-gray-200 opacity-75" 
                    : "bg-white border-border hover:border-primary/50 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isProgressTask ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative w-6 h-6">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-transparent"
                            style={{
                              background: `conic-gradient(from 0deg, ${progressPercentage >= 100 ? '#22c55e' : '#3b82f6'} ${progressPercentage * 3.6}deg, #e5e7eb ${progressPercentage * 3.6}deg)`
                            }}
                          />
                        </div>
                        {progressPercentage >= 100 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{Math.round(progressPercentage)}%</span>
                    </div>
                  ) : (
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => onTaskToggle(task.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-medium text-foreground mb-1",
                          isCompleted && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p className={cn(
                            "text-sm text-muted-foreground mb-2",
                            isCompleted && "line-through"
                          )}>
                            {task.description}
                          </p>
                        )}

                        {isProgressTask && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-2">
                              <span>{Math.round(currentProgress)}{task.unit} / {task.targetValue}{task.unit}</span>
                              <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="px-2">
                              <Slider
                                value={[currentProgress]}
                                onValueChange={(value) => handleProgressChange(task.id, value)}
                                max={task.targetValue}
                                min={0}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          {task.categories.map((category) => (
                            <div
                              key={category}
                              className={cn(
                                "w-3 h-3 rounded-full",
                                categoryColors[category.toLowerCase()] || 'bg-muted'
                              )}
                              title={category}
                            />
                          ))}
                          
                          {task.points && Object.entries(task.points).map(([category, points]) => {
                            const actualPoints = isProgressTask ? Math.round((points * progressPercentage) / 100) : points;
                            return (
                              <Badge key={category} variant="secondary" className="text-xs">
                                {actualPoints}pts
                              </Badge>
                            );
                          })}

                          {task.repeatFrequency && task.repeatFrequency !== 'none' && (
                            <Badge variant="outline" className="text-xs">
                              Repeats {task.repeatFrequency}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTaskEdit(task)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTaskDelete(task.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default TaskList;