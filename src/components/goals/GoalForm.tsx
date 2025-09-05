import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { TYPOGRAPHY } from '@/lib/designSystem';
import { useCategories } from '@/contexts/CategoryContext';

interface Goal {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  targetDate: string;
  category: string;
  points: { [category: string]: number };
  status: 'active' | 'completed' | 'abandoned';
  progress?: number;
  currentValue?: number;
  targetValue?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalFormProps {
  goal?: Goal;
  onSave: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status' | 'progress' | 'currentValue' | 'targetValue'>) => void;
  onCancel: () => void;
}

const GoalForm = ({ goal, onSave, onCancel }: GoalFormProps) => {
  const { getByType } = useCategories();
  const taskCategories = getByType('task');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    targetDate: '',
    categories: taskCategories.reduce((acc, cat) => {
      acc[cat.name] = { selected: false, points: '' };
      return acc;
    }, {} as Record<string, { selected: boolean; points: string }>)
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        description: goal.description || '',
        startDate: goal.startDate || '',
        targetDate: goal.targetDate,
        categories: taskCategories.reduce((acc, cat) => {
          acc[cat.name] = { 
            selected: goal.points && goal.points[cat.name.toLowerCase()] > 0,
            points: goal.points && goal.points[cat.name.toLowerCase()] ? goal.points[cat.name.toLowerCase()].toString() : ''
          };
          return acc;
        }, {} as Record<string, { selected: boolean; points: string }>)
      });
    }
  }, [goal, taskCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.targetDate) {
      return;
    }

    const selectedCategories = Object.entries(formData.categories)
      .filter(([_, { selected }]) => selected)
      .reduce((acc, [category, { points }]) => {
        const numeric = Math.max(0, Math.min(10, Math.floor(Number(points) || 0)));
        acc[category.toLowerCase()] = numeric;
        return acc;
      }, {} as Record<string, number>);

    // Ensure at least one category is selected
    if (Object.keys(selectedCategories).length === 0) {
      alert('Please select at least one category for your goal.');
      return;
    }

    const goalData = {
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate || undefined,
      targetDate: formData.targetDate,
      category: Object.keys(selectedCategories)[0] || 'health',
      points: selectedCategories
    };

    onSave(goalData);
  };

  const handleCategoryChange = (category: string, selected: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: { ...prev.categories[category], selected }
      }
    }));
  };

  const handlePointsChange = (category: string, points: string) => {
    let sanitized = points;
    if (sanitized !== '') {
      const numeric = Math.max(0, Math.min(10, Math.floor(Number(sanitized) || 0)));
      sanitized = String(numeric);
    }
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: { ...prev.categories[category], points: sanitized }
      }
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Goal Title *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Summer Fitness Challenge"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your goal..."
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date (Optional)</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="targetDate">End Date (Required)</Label>
          <Input
            id="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-3">Categories & Point Targets</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(formData.categories).map(([category, { selected, points }]) => (
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
              <label htmlFor={`category-${category}`} className="flex-1 text-sm font-medium text-gray-700 cursor-pointer">
                {category}
              </label>
              {selected && (
                <input
                  type="number"
                  placeholder="Points"
                  value={points}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(e) => handlePointsChange(category, e.target.value)}
                  className="w-24 p-2 bg-white border border-gray-300 text-gray-700 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!formData.name || !formData.targetDate}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-all duration-200"
        >
          {goal ? 'Update Goal' : 'Create Goal'}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="hover:scale-105 transition-all duration-200"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default GoalForm;
