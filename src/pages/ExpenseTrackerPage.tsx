import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import ToggleTabs from '@/components/ui/toggle-tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp, Plus, Calendar, Home, Car, Heart, Zap, User, Utensils, PiggyBank, Clock } from 'lucide-react';
import { TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';
import { apiClient, Expense } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/contexts/CategoryContext';

// Debug logging to check data
console.log('ExpenseTrackerPage - expenseData:', []);
console.log('ExpenseTrackerPage - incomeData:', []);

// Empty data structures for when no data is available
const emptyExpenseData = [];
const emptyIncomeData = [];
const emptyTrendData = [
  { month: 'Jan', income: 0, expenses: 0, investments: 0, tasks: 0 },
  { month: 'Feb', income: 0, expenses: 0, investments: 0, tasks: 0 },
  { month: 'Mar', income: 0, expenses: 0, investments: 0, tasks: 0 },
  { month: 'Apr', income: 0, expenses: 0, investments: 0, tasks: 0 },
  { month: 'May', income: 0, expenses: 0, investments: 0, tasks: 0 },
  { month: 'Jun', income: 0, expenses: 0, investments: 0, tasks: 0 }
];

// Empty expense breakdown for charts
const emptyExpenseBreakdown = [
  { name: 'Food', value: 0, color: '#10b981' },
  { name: 'Transport', value: 0, color: '#3b82f6' },
  { name: 'Shopping', value: 0, color: '#8b5cf6' },
  { name: 'Utilities', value: 0, color: '#f59e0b' },
  { name: 'Entertainment', value: 0, color: '#ef4444' },
  { name: 'Health', value: 0, color: '#06b6d4' }
];

// Income categories
const INCOME_CATEGORIES = {
  'Salary': { name: 'Salary', color: '#10b981' },
  'Freelance': { name: 'Freelance', color: '#3b82f6' },
  'Investment': { name: 'Investment', color: '#8b5cf6' },
  'Business': { name: 'Business', color: '#f59e0b' },
  'Other': { name: 'Other', color: '#ef4444' }
};

const ExpenseTrackerPage = () => {
  const { isAuthenticated } = useAuth();
  const { getByType } = useCategories();
  const expenseCategories = getByType('expense');
  const [entryType, setEntryType] = useState<'expense' | 'income'>('expense');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false
  });
  const [filters, setFilters] = useState({
    category: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  // Load expenses based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      loadExpenses();
    } else {
      // Load mock data for demo mode
      loadMockExpenses();
    }
  }, [isAuthenticated]);

  const loadMockExpenses = () => {
    console.log('Loading empty expenses for demo mode...');
    // Set empty expenses for demo
    setExpenses([]);
    console.log('Empty expenses loaded: 0 expenses');
  };

  const loadExpenses = async () => {
    setLoading(true);
    try {
      console.log('Loading expenses from API...');
      const apiExpenses = await apiClient.getExpenses();
      console.log('Loaded expenses:', apiExpenses);
      setExpenses(apiExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      // On error, set empty array instead of keeping existing data
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };
  const [recurringExpenses, setRecurringExpenses] = useState([
    {
      id: '1',
      name: 'Food',
      category: 'Food',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '2',
      name: 'CC',
      category: 'Shopping',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '3',
      name: 'Commute',
      category: 'Transport',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '4',
      name: 'Instamart',
      category: 'Utilities',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    }
  ]);

  // Editing state for existing expenses
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Ref for scrolling to recent transactions
  const recentTransactionsRef = useRef<HTMLDivElement>(null);

  // Get the appropriate categories based on entry type
  const getCategories = () => {
    return entryType === 'expense' ? 
      expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: { name: cat.name, color: cat.color } }), {}) : 
      INCOME_CATEGORIES;
  };

  // Reset form data when switching entry types
  const handleEntryTypeChange = (value: string) => {
    setEntryType(value as 'expense' | 'income');
    // Reset form data when switching types
    setFormData({
      name: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false
    });
  };

  const monthlyData = {
    mainCategories: [
      { 
        name: 'Income', 
        planned: 140000,
        actual: 145200,
        threeMonthAvg: 142000, 
        oneYearAvg: 138000,
        type: 'income',
        icon: DollarSign
      },
      { 
        name: 'Investments', 
        planned: 25000, 
        actual: 18000, 
        threeMonthAvg: 22000, 
        oneYearAvg: 20000,
        type: 'income',
        icon: PiggyBank
      },
      { 
        name: 'Expenses', 
        planned: 68000,
        actual: 64500,
        threeMonthAvg: 65700, 
        oneYearAvg: 67100,
        type: 'expense',
        icon: TrendingDown
      }
    ],
    expenseCategories: [
      { 
        name: 'Food', 
        planned: 15000, 
        actual: 12800, 
        threeMonthAvg: 13500, 
        oneYearAvg: 14000,
        icon: Utensils
      },
      { 
        name: 'Home', 
        planned: 35000, 
        actual: 35000, 
        threeMonthAvg: 35000, 
        oneYearAvg: 34000,
        icon: Home
      },
      { 
        name: 'Transport', 
        planned: 8000, 
        actual: 6200, 
        threeMonthAvg: 7000, 
        oneYearAvg: 7500,
        icon: Car
      },
      { 
        name: 'Health', 
        planned: 3000, 
        actual: 2500, 
        threeMonthAvg: 2800, 
        oneYearAvg: 3000,
        icon: Heart
      },
      { 
        name: 'Utilities', 
        planned: 4000, 
        actual: 3800, 
        threeMonthAvg: 3900, 
        oneYearAvg: 4000,
        icon: Zap
      },
      { 
        name: 'Shopping', 
        planned: 3000, 
        actual: 4200, 
        threeMonthAvg: 3500, 
        oneYearAvg: 3200,
        icon: User
      }
    ]
  };

  // Get main categories data for progress bars
  const incomeData = monthlyData.mainCategories.find(cat => cat.name === 'Income');
  const investmentsData = monthlyData.mainCategories.find(cat => cat.name === 'Investments');
  const expensesData = monthlyData.mainCategories.find(cat => cat.name === 'Expenses');



  const handleRecurringExpenseSubmit = async (
    id: string,
    amount: string,
    name: string,
    category: string,
    date: string
  ) => {
    if (!amount || parseFloat(amount) <= 0 || !name.trim()) return;

    const expensePayload = {
      name,
      amount: parseFloat(amount),
      category,
      date,
      isRecurring: true,
      notes: undefined as string | undefined
    };

    try {
      if (isAuthenticated) {
        await apiClient.createExpense(expensePayload as any);
        await loadExpenses();
      } else {
        // In demo mode, update local state so the list reflects the addition
        const newExpense: Expense = {
          id: `mock-${Date.now()}`,
          userId: 'mock',
          name,
          amount: parseFloat(amount),
          category,
          date,
          isRecurring: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Expense;
        setExpenses(prev => [newExpense, ...prev]);
      }
    } catch (error) {
      console.error('Error creating recurring expense from quick card:', error);
    } finally {
      // Reset only the amount to keep card as a prefilled quick form
      setRecurringExpenses(prev => 
        prev.map(expense => 
          expense.id === id 
            ? { ...expense, amount: '' }
            : expense
        )
      );
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    });
  };

  // Handle category click - scroll to recent transactions and filter
  const handleCategoryClick = (categoryName: string) => {
    // Set the filter
    setFilters(prev => ({ ...prev, category: categoryName }));
    
    // Scroll to recent transactions section
    setTimeout(() => {
      recentTransactionsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // Filter data based on current filters - use real expenses when authenticated, fallback to mock
  const currentData = entryType === 'expense' 
    ? (isAuthenticated && expenses.length > 0 ? expenses : emptyExpenseData)
    : (emptyIncomeData); // For now, income still uses mock data
  
  console.log('ExpenseTrackerPage - currentData:', currentData, 'entryType:', entryType, 'isAuthenticated:', isAuthenticated);
  console.log('ExpenseTrackerPage - expenses from API:', expenses);
  
  // Ensure currentData is always an array
  const dataArray = Array.isArray(currentData) ? currentData : (currentData ? Object.values(currentData) : []);
  console.log('ExpenseTrackerPage - dataArray:', dataArray);
  
  const filteredData = dataArray.filter(entry => {
    if (!entry) return false;
    if (filters.category !== 'all' && entry.category !== filters.category) return false;
    if (filters.dateFrom && new Date(entry.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(entry.date) > new Date(filters.dateTo)) return false;
    if (filters.amountMin && entry.amount < parseFloat(filters.amountMin)) return false;
    if (filters.amountMax && entry.amount > parseFloat(filters.amountMax)) return false;
    return true;
  });

  const hasActiveFilters = filters.category !== 'all' || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax;

  // Handle form submission for adding new expenses
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.category) {
      console.log('Please fill in all required fields');
      return;
    }

    if (!isAuthenticated) {
      // Demo mode: add to local state so it appears in list
      const newExpense: Expense = {
        id: `mock-${Date.now()}`,
        userId: 'mock',
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        isRecurring: formData.isRecurring,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Expense;
      setExpenses(prev => [newExpense, ...prev]);

      // If marked recurring, add a quick-add card for convenience
      if (formData.isRecurring) {
        setRecurringExpenses(prev => [
          ...prev,
          {
            id: `rec-${Date.now()}`,
            name: formData.name,
            category: formData.category,
            amount: '',
            date: formData.date
          }
        ]);
      }

      setFormData({
        name: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false
      });
      return;
    }

    try {
      console.log('Saving expense:', formData);
      
      await apiClient.createExpense({
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        isRecurring: formData.isRecurring,
        notes: undefined
      });

      // If marked recurring, add a quick-add card in the UI as a template
      if (formData.isRecurring) {
        setRecurringExpenses(prev => [
          ...prev,
          {
            id: `rec-${Date.now()}`,
            name: formData.name,
            category: formData.category,
            amount: '',
            date: formData.date
          }
        ]);
      }

      // Reset form on success
      setFormData({
        name: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false
      });

      // Reload expenses
      await loadExpenses();
      
      console.log('Expense saved successfully');
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  // Open edit modal from list
  const handleExpenseClick = (entry: Expense) => {
    setEditingExpense(entry);
    setShowExpenseModal(true);
  };

  // Save edits from modal
  const handleEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    try {
      if (isAuthenticated) {
        await apiClient.updateExpense(editingExpense.id, {
          name: editingExpense.name,
          amount: editingExpense.amount,
          category: editingExpense.category,
          date: editingExpense.date,
        });
        await loadExpenses();
      } else {
        // Demo mode: update local state only
        setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? {
          ...exp,
          name: editingExpense.name,
          amount: editingExpense.amount,
          category: editingExpense.category,
          date: editingExpense.date,
          updatedAt: new Date().toISOString(),
        } : exp));
      }
      setShowExpenseModal(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  // Chart data
  const chartData = emptyTrendData;
  const expenseBreakdown = emptyExpenseBreakdown;

  return (
    <div className="min-h-screen bg-white bg-gradient-to-b from-[#f5f6fa] to-[#e9eafc] p-6 lg:p-10">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={TYPOGRAPHY.pageTitle}>Expense Tracker</h2>
            <p className={TYPOGRAPHY.bodyText}>Track your income and expenses</p>
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
                  You're currently viewing empty data. No expenses are available in demo mode.
                </p>
                <p className="text-sm text-blue-700">
                  <strong>To create and manage real expenses:</strong> Sign in to your account and create new expenses. Real expenses will have unique IDs and can be fully edited.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Entry Section */}
          <Card className={LAYOUT.standardCard}>
            <h3 className={TYPOGRAPHY.sectionHeader}>+ Add {entryType === 'expense' ? 'Expense' : 'Income'}</h3>
            
            <ToggleTabs
              value={entryType}
              onValueChange={(value) => handleEntryTypeChange(value as 'expense' | 'income')}
              items={[
                { value: 'expense', label: 'Expense Entry' },
                { value: 'income', label: 'Income Entry' }
              ]}
            />

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={entryType === 'expense' ? 'e.g., Groceries' : 'e.g., Salary'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {entryType === 'expense' ? 
                      expenseCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#94a3b8' }} />
                            {cat.name}
                          </div>
                        </SelectItem>
                      )) :
                      Object.entries(INCOME_CATEGORIES).map(([key, category]) => (
                        <SelectItem key={key} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              {entryType === 'expense' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
                  />
                  <Label htmlFor="recurring">Recurring</Label>
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-full px-5 py-2 font-semibold shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-all duration-200"
              >
                Add {entryType === 'expense' ? 'Expense' : 'Income'}
              </Button>
            </form>

            {/* Recurring Expenses Section - Only show for expenses */}
            {entryType === 'expense' && recurringExpenses.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Quick Add Recurring Expenses</h4>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-60">
                  {recurringExpenses.map((expense) => (
                    <div key={expense.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                      {/* Name */}
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium w-16">Name</Label>
                        <Input
                          value={expense.name}
                          onChange={(e) => setRecurringExpenses(prev => 
                            prev.map(exp => exp.id === expense.id ? { ...exp, name: e.target.value } : exp)
                          )}
                          className="h-8 text-sm"
                          placeholder="Expense name"
                        />
                      </div>
                      {/* Category */}
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium w-16">Category</Label>
                        <Select
                          value={expense.category}
                          onValueChange={(value) => setRecurringExpenses(prev => 
                            prev.map(exp => exp.id === expense.id ? { ...exp, category: value } : exp)
                          )}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#94a3b8' }} />
                                  {cat.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium w-16">Date</Label>
                        <Input
                          type="date"
                          value={expense.date}
                          onChange={(e) => setRecurringExpenses(prev => 
                            prev.map(exp => exp.id === expense.id ? { ...exp, date: e.target.value } : exp)
                          )}
                          className="h-8 text-sm"
                        />
                      </div>
                      {/* Amount + Add */}
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium w-16">Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={expense.amount}
                          onChange={(e) => setRecurringExpenses(prev => 
                            prev.map(exp => exp.id === expense.id ? { ...exp, amount: e.target.value } : exp)
                          )}
                          className="h-8 text-sm"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleRecurringExpenseSubmit(expense.id, expense.amount, expense.name, expense.category, expense.date)}
                          disabled={!expense.amount || parseFloat(expense.amount) <= 0 || !expense.name.trim()}
                          className="rounded-full px-3 py-1 text-xs font-semibold shadow-md bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 transition-all duration-200"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Monthly Summary - Restructured Layout */}
          <Card className={`${LAYOUT.standardCard} lg:col-span-2`}>
            <h3 className={TYPOGRAPHY.sectionHeader}>Monthly Summary</h3>
            
            {/* Progress Bars at the Top */}
            <div className="mb-6 space-y-4">
              {/* Income Progress Bar */}
              {incomeData && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{incomeData.name}</span>
                    <span className={`font-semibold ${incomeData.actual > incomeData.planned ? 'text-green-600' : 'text-red-600'}`}>
                      {incomeData.actual > incomeData.planned ? '✓' : '✗'} ₹{Math.abs(incomeData.actual - incomeData.planned).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${incomeData.actual > incomeData.planned ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min((incomeData.actual / incomeData.planned) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Investments Progress Bar */}
              {investmentsData && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{investmentsData.name}</span>
                    <span className={`font-semibold ${investmentsData.actual > investmentsData.planned ? 'text-green-600' : 'text-red-600'}`}>
                      {investmentsData.actual > investmentsData.planned ? '✓' : '✗'} ₹{Math.abs(investmentsData.actual - investmentsData.planned).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${investmentsData.actual > investmentsData.planned ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min((investmentsData.actual / investmentsData.planned) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Total Expenses Progress Bar */}
              {expensesData && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{expensesData.name}</span>
                    <span className={`font-semibold ${expensesData.actual < expensesData.planned ? 'text-green-600' : 'text-red-600'}`}>
                      {expensesData.actual < expensesData.planned ? '✓' : '✗'} ₹{Math.abs(expensesData.actual - expensesData.planned).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${expensesData.actual < expensesData.planned ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min((expensesData.actual / expensesData.planned) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Main Categories Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-sm">Category</th>
                    <th className="text-center py-3 px-2 font-medium text-sm">Planned</th>
                    <th className="text-center py-3 px-2 font-medium text-sm">Actual</th>
                    <th className="text-center py-3 px-2 font-medium text-sm">3M Avg</th>
                    <th className="text-center py-3 px-2 font-medium text-sm">1Y Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlyData.mainCategories.map((category) => {
                    const isIncome = category.type === 'income';
                    const IconComponent = category.icon;
                    
                    return (
                      <tr key={category.name} className="hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isIncome ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <IconComponent className={`w-4 h-4 ${
                                isIncome ? 'text-green-600' : 'text-red-600'
                              }`} />
                            </div>
                            <span className="font-medium text-sm">{category.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 text-sm">₹{category.planned.toLocaleString()}</td>
                        <td className="text-center py-3 px-2 text-sm">₹{category.actual.toLocaleString()}</td>
                        <td className="text-center py-3 px-2 text-sm text-gray-600">₹{category.threeMonthAvg.toLocaleString()}</td>
                        <td className="text-center py-3 px-2 text-sm text-gray-600">₹{category.oneYearAvg.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Expense Sub-categories Table - Aligned with main table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-gray-100">
                  {monthlyData.expenseCategories.map((category, index) => {
                    const IconComponent = category.icon;
                    
                    return (
                      <tr key={category.name} className="hover:bg-gray-50 relative">
                        {/* Connecting line */}
                        <td className="absolute left-0 top-0 bottom-0 w-8 border-l-2 border-gray-200"></td>
                        
                        <td className="py-3 px-2 pl-10">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100">
                              <IconComponent className="w-4 h-4 text-red-600" />
                            </div>
                            <span 
                              className="font-medium text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => handleCategoryClick(category.name)}
                            >
                              {category.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 text-sm">₹{category.planned.toLocaleString()}</td>
                        <td className="text-center py-3 px-2 text-sm">₹{category.actual.toLocaleString()}</td>
                        <td className="text-center py-3 px-2 text-sm text-gray-600">₹{category.threeMonthAvg.toLocaleString()}</td>
                        <td className="text-center py-3 px-2 text-sm text-gray-600">₹{category.oneYearAvg.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Entries Section */}
        <div ref={recentTransactionsRef}>
          <Card className={LAYOUT.standardCard}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={TYPOGRAPHY.sectionHeader}>Recent {entryType === 'expense' ? 'Expenses' : 'Income'}</h3>
              <ToggleTabs
                value={entryType}
                onValueChange={(value) => handleEntryTypeChange(value)}
                items={[
                  { value: 'expense', label: 'Expenses' },
                  { value: 'income', label: 'Income' }
                ]}
              />
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {Object.entries(getCategories()).map(([key, category]) => (
                        <SelectItem key={key} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">From Date</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="h-8"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">To Date</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="h-8"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Min Amount</Label>
                  <Input
                    type="number"
                    value={filters.amountMin}
                    onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                    placeholder="0"
                    className="h-8"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Max Amount</Label>
                  <Input
                    type="number"
                    value={filters.amountMax}
                    onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                    placeholder="∞"
                    className="h-8"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {filteredData.length} of {dataArray.length} entries
                  </Badge>
                  {hasActiveFilters && (
                    <Badge variant="outline" className="text-xs">
                      Filtered
                    </Badge>
                  )}
                </div>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredData.length > 0 ? (
                filteredData.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleExpenseClick(entry)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        entryType === 'expense' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {entryType === 'expense' ? (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        ) : (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{entry.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          {entry.isRecurring && (
                            <Badge variant="secondary" className="text-xs">Recurring</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      entryType === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {entryType === 'expense' ? '-' : '+'}₹{entry.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {hasActiveFilters ? 'No entries match your filters' : 'No entries found'}
                </div>
              )}
            </div>
          </Card>
        </div>
        {/* Expense Edit Modal */}
        {showExpenseModal && editingExpense && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Expense</h3>
              <form onSubmit={handleEditExpense} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingExpense.name}
                    onChange={(e) => setEditingExpense(prev => prev ? { ...prev, name: e.target.value } : prev)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingExpense.category}
                    onValueChange={(value) => setEditingExpense(prev => prev ? { ...prev, category: value } : prev)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                                                <SelectContent>
                              {expenseCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#94a3b8' }} />
                                    {cat.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense(prev => prev ? { ...prev, amount: parseFloat(e.target.value || '0') } : prev)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense(prev => prev ? { ...prev, date: e.target.value } : prev)}
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">Save</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowExpenseModal(false); setEditingExpense(null); }}>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTrackerPage;