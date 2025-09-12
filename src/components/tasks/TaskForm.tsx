import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { STANDARD_CATEGORIES, TYPOGRAPHY } from '@/lib/designSystem';
import { useCategories } from '@/contexts/CategoryContext';

interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string; // Made optional to support tasks without dates
  isLongTerm?: boolean; // Long-term task flag
  completedAt?: string | null; // Completion timestamp
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
  onSave: (task: Omit<Task, 'id'>, editMode?: 'single' | 'series') => void;
  onCancel: () => void;
}

// Use categories from centralized manager (task type)

const TaskForm = ({ task, defaultDate, onSave, onCancel }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hasDate: true, // New flag to control whether task has a date
    isLongTerm: false, // Long-term task flag
    date: defaultDate || new Date().toISOString().split('T')[0],
    categories: [] as string[],
    duration: 30,
    repeatFrequency: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    repeatCount: 1,
    points: {} as { [category: string]: number },
    completed: false,
    editMode: 'single' as 'single' | 'series' // Edit mode for recurring tasks
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        hasDate: !!task.date, // Set hasDate based on whether task has a date
        isLongTerm: task.isLongTerm || false, // Set isLongTerm flag
        date: task.date || defaultDate || new Date().toISOString().split('T')[0],
        categories: task.categories,
        duration: task.duration,
        repeatFrequency: task.repeatFrequency || 'none',
        repeatCount: task.repeatCount || 1,
        points: task.points || {},
        completed: task.completed,
        editMode: 'single' // Default to single occurrence editing
      });
    }
  }, [task, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    // Ensure at least one category is selected (backend requirement)
    const finalCategories = formData.categories.length > 0 ? formData.categories : ['Work'];

    // Determine if this should be a long-term task
    const isLongTerm = !formData.hasDate || formData.isLongTerm;

    onSave({
      title: formData.title,
      description: formData.description,
      date: formData.hasDate ? formData.date : undefined, // Only include date if hasDate is true
      isLongTerm: isLongTerm, // Include long-term flag
      categories: finalCategories,
      duration: formData.duration,
      repeatFrequency: formData.repeatFrequency,
      repeatCount: formData.repeatCount,
      points: formData.points,
      completed: formData.completed
    }, formData.editMode);
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      const isSelected = prev.categories.includes(category);
      if (isSelected) {
        return { ...prev, categories: prev.categories.filter(c => c !== category) };
      }
      if (prev.categories.length >= 5) {
        alert('You can select up to 5 categories for tasks.');
        return prev;
      }
      return { ...prev, categories: [...prev.categories, category] };
    });
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

  // Pull task categories from centralized context
  const { getByType } = useCategories();
  const taskCategories = getByType('task').map(c => c.name);

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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasDate"
                checked={formData.hasDate}
                onChange={(e) => setFormData(prev => ({ ...prev, hasDate: e.target.checked }))}
                className="w-4 h-4 text-primary"
              />
              <Label htmlFor="hasDate">Has Date</Label>
            </div>
            
            {formData.hasDate && (
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isLongTerm"
              checked={formData.isLongTerm}
              onChange={(e) => setFormData(prev => ({ ...prev, isLongTerm: e.target.checked }))}
              className="w-4 h-4 text-primary"
            />
            <Label htmlFor="isLongTerm">Long-term Task (No specific date)</Label>
          </div>
          <p className="text-xs text-gray-600">Check this for tasks without a specific deadline (e.g., "Learn Spanish", "Get in shape")</p>
        </div>

        <div className="space-y-3">
          <Label>Categories <span className="text-red-500">*</span></Label>
          <p className="text-xs text-gray-600">Select at least one category (defaults to "Work" if none selected)</p>
          <div className="grid grid-cols-2 gap-3">
            {(taskCategories.length ? taskCategories : ['Health','Strength','Mind','Work','Spirit']).map((category) => (
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

        {/* Edit Mode Selection for Recurring Tasks */}
        {task && task.repeatFrequency !== 'none' && (
          <div className="space-y-3">
            <Label>Edit Mode</Label>
            <p className="text-xs text-gray-600">Choose how to apply changes to this recurring task</p>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.editMode === 'single'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, editMode: 'single' }))}
              >
                <input
                  type="radio"
                  checked={formData.editMode === 'single'}
                  onChange={() => setFormData(prev => ({ ...prev, editMode: 'single' }))}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm font-medium">This occurrence only</span>
              </div>
              <div
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.editMode === 'series'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, editMode: 'series' }))}
              >
                <input
                  type="radio"
                  checked={formData.editMode === 'series'}
                  onChange={() => setFormData(prev => ({ ...prev, editMode: 'series' }))}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm font-medium">All future occurrences</span>
              </div>
            </div>
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