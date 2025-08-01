import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { STANDARD_CATEGORIES, TYPOGRAPHY } from '@/lib/designSystem';

interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;
  categories: string[];
  duration: number;
  repeatFrequency?: 'none' | 'daily' | 'weekly' | 'monthly';
  repeatCount?: number;
  points?: { [category: string]: number };
  completed: boolean;
}

interface TaskFormProps {
  task?: Task;
  defaultDate?: string;
  onSave: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
}

// Use only the 5 standard categories
const categories = ['Health', 'Strength', 'Mind', 'Work', 'Spirit'];

const TaskForm = ({ task, defaultDate, onSave, onCancel }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    categories: [] as string[],
    duration: 30,
    repeatFrequency: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    repeatCount: 1,
    points: {} as { [category: string]: number },
    completed: false
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        date: task.date,
        categories: task.categories,
        duration: task.duration,
        repeatFrequency: task.repeatFrequency || 'none',
        repeatCount: task.repeatCount || 1,
        points: task.points || {},
        completed: task.completed
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      categories: formData.categories,
      duration: formData.duration,
      repeatFrequency: formData.repeatFrequency,
      repeatCount: formData.repeatCount,
      points: formData.points,
      completed: formData.completed
    });
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handlePointsChange = (category: string, points: number) => {
    setFormData(prev => ({
      ...prev,
      points: {
        ...prev.points,
        [category]: points
      }
    }));
  };

  return (
    <Card className="p-6 shadow-medium">
      <div className="flex items-center justify-between mb-6">
        <h3 className={TYPOGRAPHY.sectionHeader}>
          ➕ {task ? 'Edit Task' : 'Create New Task'}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Morning Workout"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Task description..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
              min="1"
              placeholder="30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Categories</Label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <div
                key={category}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.categories.includes(category)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleCategoryToggle(category)}
              >
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm font-medium">{category}</span>
              </div>
            ))}
          </div>
        </div>

        {formData.categories.length > 0 && (
          <div className="space-y-3">
            <Label>Points per Category</Label>
            <div className="grid grid-cols-2 gap-3">
              {formData.categories.map((category) => (
                <div key={category} className="space-y-2">
                  <Label htmlFor={`points-${category}`}>{category} Points</Label>
                  <Input
                    id={`points-${category}`}
                    type="number"
                    value={formData.points[category] || ''}
                    onChange={(e) => handlePointsChange(category, parseInt(e.target.value) || 0)}
                    min="0"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label>Repeat Frequency</Label>
          <div className="grid grid-cols-2 gap-3">
            {['none', 'daily', 'weekly', 'monthly'].map((frequency) => (
              <div
                key={frequency}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.repeatFrequency === frequency
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, repeatFrequency: frequency as any }))}
              >
                <input
                  type="radio"
                  checked={formData.repeatFrequency === frequency}
                  onChange={() => setFormData(prev => ({ ...prev, repeatFrequency: frequency as any }))}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm font-medium capitalize">{frequency}</span>
              </div>
            ))}
          </div>
        </div>

        {formData.repeatFrequency !== 'none' && (
          <div className="space-y-2">
            <Label htmlFor="repeatCount">Repeat Count</Label>
            <Input
              id="repeatCount"
              type="number"
              value={formData.repeatCount}
              onChange={(e) => setFormData(prev => ({ ...prev, repeatCount: parseInt(e.target.value) || 1 }))}
              min="1"
              placeholder="1"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {task ? 'Update Task' : 'Create Task'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TaskForm;