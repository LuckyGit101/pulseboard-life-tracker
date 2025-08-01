import { useState, useRef } from 'react';
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
import { mockExpenses, mockIncome, trendData } from '@/data/mockData';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';

// Debug logging to check data
console.log('ExpenseTrackerPage - expenseData:', mockExpenses);
console.log('ExpenseTrackerPage - incomeData:', mockIncome);

// Fallback data in case imports fail
const fallbackExpenseData = [
  { id: 'fallback1', name: 'Sample Expense', amount: 1000, category: 'Food', date: '2025-07-28', isRecurring: false }
];

const fallbackIncomeData = [
  { id: 'fallback2', name: 'Sample Income', amount: 5000, category: 'Salary', date: '2025-07-28', isRecurring: false }
];

const mockExpenseBreakdown = [
  { name: 'Housing', value: 1200, color: 'hsl(var(--chart-1))' },
  { name: 'Food', value: 135, color: 'hsl(var(--chart-2))' },
  { name: 'Health', value: 50, color: 'hsl(var(--chart-3))' },
  { name: 'Transportation', value: 0, color: 'hsl(var(--chart-4))' },
  { name: 'Entertainment', value: 0, color: 'hsl(var(--chart-5))' }
];

// Use standardized expense categories
const categories = Object.keys(EXPENSE_CATEGORIES);

const ExpenseTrackerPage = () => {
  const [entryType, setEntryType] = useState<'expense' | 'income'>('expense');
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

  // Ref for scrolling to recent transactions
  const recentTransactionsRef = useRef<HTMLDivElement>(null);

  // Get the appropriate categories based on entry type
  const getCategories = () => {
    return entryType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit entry:', formData, entryType);
    
    // If this is a recurring expense, add it to the recurring expenses list
    if (formData.isRecurring && entryType === 'expense') {
      const newRecurringExpense = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        amount: '',
        date: new Date().toISOString().split('T')[0]
      };
      setRecurringExpenses(prev => [...prev, newRecurringExpense]);
    }
    
    // Reset form
    setFormData({
      name: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false
    });
  };

  const handleRecurringExpenseSubmit = (id: string, amount: string) => {
    if (amount && parseFloat(amount) > 0) {
      console.log('Add recurring expense:', { id, amount });
      // Reset the amount for this recurring expense
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

  // Filter data based on current filters
  const currentData = entryType === 'expense' ? (mockExpenses || fallbackExpenseData) : (mockIncome || fallbackIncomeData);
  console.log('ExpenseTrackerPage - currentData:', currentData, 'entryType:', entryType);
  console.log('ExpenseTrackerPage - currentData type:', typeof currentData, 'isArray:', Array.isArray(currentData));
  console.log('ExpenseTrackerPage - mockExpenses:', mockExpenses, 'mockIncome:', mockIncome);
  
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
                    {Object.entries(getCategories()).map(([key, category]) => (
                      <SelectItem key={key} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
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
                    <div key={expense.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">{expense.name}</span>
                          <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={expense.amount}
                          onChange={(e) => setRecurringExpenses(prev => 
                            prev.map(exp => 
                              exp.id === expense.id 
                                ? { ...exp, amount: e.target.value }
                                : exp
                            )
                          )}
                          className="w-24 bg-background border-border text-foreground text-sm"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleRecurringExpenseSubmit(expense.id, expense.amount)}
                          disabled={!expense.amount || parseFloat(expense.amount) <= 0}
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
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
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
      </div>
    </div>
  );
};

export default ExpenseTrackerPage;