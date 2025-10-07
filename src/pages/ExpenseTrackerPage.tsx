import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import ToggleTabs from '@/components/ui/toggle-tabs';
import { DollarSign, TrendingDown, TrendingUp, Calendar, Home, Car, Heart, Zap, User, Utensils, PiggyBank, Clock, Trash2 } from 'lucide-react';
import { TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';
import { apiClient, Expense } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/contexts/CategoryContext';


// Empty data structures for when no data is available
const emptyExpenseData = [];
const emptyIncomeData = [];

// Income categories
const INCOME_CATEGORIES = {
  'Salary': { name: 'Salary', color: '#10b981' },
  'Freelance': { name: 'Freelance', color: '#3b82f6' },
  'Investment': { name: 'Investment', color: '#8b5cf6' },
  'Business': { name: 'Business', color: '#f59e0b' },
  'Other': { name: 'Other', color: '#ef4444' }
};

const ExpenseTrackerPage = () => {
  const PLANNED_STORAGE_KEY = 'planned_expenses_by_month_v1';
  const { isAuthenticated } = useAuth();
  const { getByType } = useCategories();
  const expenseCategories = getByType('expense');
  const [entryType, setEntryType] = useState<'expense' | 'income'>('expense');
  const [viewType, setViewType] = useState<'expense' | 'income'>('expense');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [plannedValues, setPlannedValues] = useState<Record<string, Record<string, number>>>({});
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

  // Balance widgets
  const [balanceDate, setBalanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [balanceRange, setBalanceRange] = useState<'month' | 'year'>('month');
  const [startingDate, setStartingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startingBalance, setStartingBalance] = useState<string>('');
  const [startingEntry, setStartingEntry] = useState<Expense | null>(null);

  // Load expenses based on authentication status
  useEffect(() => {
    if (isAuthenticated) {
      loadExpenses();
      loadAllInvestments();
    } else {
      // Load mock data for demo mode
      loadMockExpenses();
    }
  }, [isAuthenticated]);

  // Load planned values from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLANNED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setPlannedValues(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Persist planned values whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(PLANNED_STORAGE_KEY, JSON.stringify(plannedValues));
    } catch {
      // ignore storage errors
    }
  }, [plannedValues]);

  const loadMockExpenses = () => {
    setExpenses([]);
  };

  const loadExpenses = async () => {
    setLoading(true);
    try {
      // Fetch all pages to enable full-page filtering and accurate monthly summaries
      const apiExpenses = await apiClient.getAllExpenses();
      setExpenses(apiExpenses);

      // Determine starting balance entry (identified by notes marker)
      const start = apiExpenses.find(e => (e as any).notes === '__starting_balance__');
      setStartingEntry(start || null);
      if (start) {
        setStartingBalance(String(Math.abs(start.amount || 0)));
        setStartingDate(start.date);
      } else {
        // Default starting date = earliest expense date if available
        if (apiExpenses.length > 0) {
          const earliest = apiExpenses.reduce((min, e) => (e.date < min ? e.date : min), apiExpenses[0].date);
          setStartingDate(earliest);
        }
      }
    } catch (error) {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllInvestments = async () => {
    try {
      const list = await apiClient.getInvestments();
      setInvestments(list || []);
    } catch {
      setInvestments([]);
    }
  };


  // Calculate monthly summary from actual expense data
  const calculateMonthlySummary = (targetMonth?: Date) => {
    if (!expenses || expenses.length === 0) {
      return {
        mainCategories: [
          { 
            name: 'Income', 
            planned: 0,
            actual: 0,
            threeMonthAvg: 0, 
            oneYearAvg: 0,
            type: 'income',
            icon: DollarSign
          },
          { 
            name: 'Investments', 
            planned: 0, 
            actual: 0, 
            threeMonthAvg: 0, 
            oneYearAvg: 0,
            type: 'income',
            icon: PiggyBank
          },
          { 
            name: 'Expenses', 
            planned: 0,
            actual: 0,
            threeMonthAvg: 0, 
            oneYearAvg: 0,
            type: 'expense',
            icon: TrendingDown
          }
        ],
        expenseCategories: [
          { 
            name: 'Food', 
            planned: 0, 
            actual: 0, 
            threeMonthAvg: 0, 
            oneYearAvg: 0,
            icon: Utensils
          },
          { 
            name: 'Housing', 
            planned: 0, 
            actual: 0, 
            threeMonthAvg: 0, 
            oneYearAvg: 0,
            icon: Home
          },
          { 
            name: 'Transport', 
            planned: 0, 
            actual: 0, 
            threeMonthAvg: 0, 
            oneYearAvg: 0,
            icon: Car
          },
          { 
            name: 'Health', 
            planned: 0, 
            actual: 0, 
            threeMonthAvg: 0, 
            oneYearAvg: 0,
            icon: Heart
          },
          { 
            name: 'Utilities', 
            planned: 0, 
            actual: 0, 
            threeMonthAvg: 0, 
            oneYearAvg: 0,
            icon: Zap
          },
          { 
            name: 'Personal', 
            planned: 0, 
            actual: 0, 
            threeMonthAvg: 0, 
            oneYearAvg: 0,
            icon: User
          },
          { 
            name: 'Debt', 
            planned: 0, 
            actual: 0, 
            threeMonthAvg: 0, 
            oneYearAvg: 0,
            icon: DollarSign
          }
        ]
      };
    }

    const targetDate = targetMonth || selectedMonth;
    const currentMonth = targetDate.getMonth();
    const currentYear = targetDate.getFullYear();
    
    // Get month key for planned values
    const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
    // Helper function to get expenses for a specific month
    const getExpensesForMonth = (year: number, month: number) => {
      return expenses.filter(expense => {
        // Normalize to YYYY-MM-DD and compare components to avoid TZ issues
        const [y, m, d] = expense.date.split('T')[0].split('-');
        const eYear = parseInt(y, 10);
        const eMonth = parseInt(m, 10) - 1; // zero-based
        return eYear === year && eMonth === month;
      });
    };

    // Helper function to calculate totals for a month
    const calculateMonthTotals = (monthExpenses: any[]) => {
      // Income should be sum of positive amounts (or entries marked income)
      const income = monthExpenses
        .filter(entry => entry.type === 'income')
        .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

      // Expenses should be absolute sum of negative amounts (or entries marked expense)
      const expenseTotal = monthExpenses
        .filter(entry => entry.type === 'expense')
        .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

      return { income, expenseTotal };
    };

    // Helper function to calculate category totals for a month
    const calculateCategoryTotals = (monthExpenses: any[]) => {
      const categoryTotals: Record<string, number> = {};
      monthExpenses
        .filter(expense => expense.type === 'expense')
        .forEach(expense => {
          const category = expense.category;
          const amount = Math.abs(expense.amount);
          categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        });
      return categoryTotals;
    };

    // Current month data
    const currentMonthExpenses = getExpensesForMonth(currentYear, currentMonth);
    const currentTotals = calculateMonthTotals(currentMonthExpenses);
    const currentCategoryTotals = calculateCategoryTotals(currentMonthExpenses);

    // Calculate 3-month averages
    const threeMonthTotals = { income: 0, expenseTotal: 0 };
    const threeMonthCategoryTotals: Record<string, number> = {};
    let threeMonthCount = 0;

    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthExpenses = getExpensesForMonth(monthDate.getFullYear(), monthDate.getMonth());
      
      if (monthExpenses.length > 0) {
        const monthTotals = calculateMonthTotals(monthExpenses);
        const monthCategoryTotals = calculateCategoryTotals(monthExpenses);
        
        threeMonthTotals.income += monthTotals.income;
        threeMonthTotals.expenseTotal += monthTotals.expenseTotal;
        
        Object.keys(monthCategoryTotals).forEach(category => {
          threeMonthCategoryTotals[category] = (threeMonthCategoryTotals[category] || 0) + monthCategoryTotals[category];
        });
        
        threeMonthCount++;
      }
    }

    // Calculate 1-year averages
    const oneYearTotals = { income: 0, expenseTotal: 0 };
    const oneYearCategoryTotals: Record<string, number> = {};
    let oneYearCount = 0;

    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthExpenses = getExpensesForMonth(monthDate.getFullYear(), monthDate.getMonth());
      
      if (monthExpenses.length > 0) {
        const monthTotals = calculateMonthTotals(monthExpenses);
        const monthCategoryTotals = calculateCategoryTotals(monthExpenses);
        
        oneYearTotals.income += monthTotals.income;
        oneYearTotals.expenseTotal += monthTotals.expenseTotal;
        
        Object.keys(monthCategoryTotals).forEach(category => {
          oneYearCategoryTotals[category] = (oneYearCategoryTotals[category] || 0) + monthCategoryTotals[category];
        });
        
        oneYearCount++;
      }
    }

    // Calculate averages (only divide by months that have data)
    const threeMonthAvgIncome = threeMonthCount > 0 ? threeMonthTotals.income / threeMonthCount : 0;
    const threeMonthAvgExpenses = threeMonthCount > 0 ? threeMonthTotals.expenseTotal / threeMonthCount : 0;
    const oneYearAvgIncome = oneYearCount > 0 ? oneYearTotals.income / oneYearCount : 0;
    const oneYearAvgExpenses = oneYearCount > 0 ? oneYearTotals.expenseTotal / oneYearCount : 0;

    return {
      mainCategories: [
        { 
          name: 'Income', 
          planned: plannedValues[monthKey]?.Income || 0,
          actual: currentTotals.income,
          threeMonthAvg: Math.round(threeMonthAvgIncome), 
          oneYearAvg: Math.round(oneYearAvgIncome),
          type: 'income',
          icon: DollarSign
        },
        { 
          name: 'Investments', 
          planned: plannedValues[monthKey]?.Investments || 0, 
          actual: 0, // No investment data available
          threeMonthAvg: 0, 
          oneYearAvg: 0,
          type: 'income',
          icon: PiggyBank
        },
        { 
          name: 'Expenses', 
          planned: plannedValues[monthKey]?.Expenses || 0,
          actual: currentTotals.expenseTotal,
          threeMonthAvg: Math.round(threeMonthAvgExpenses), 
          oneYearAvg: Math.round(oneYearAvgExpenses),
          type: 'expense',
          icon: TrendingDown
        }
      ],
      expenseCategories: [
        { 
          name: 'Food', 
          planned: plannedValues[monthKey]?.Food || 0, 
          actual: currentCategoryTotals['Food'] || 0, 
          threeMonthAvg: Math.round((threeMonthCategoryTotals['Food'] || 0) / Math.max(threeMonthCount, 1)), 
          oneYearAvg: Math.round((oneYearCategoryTotals['Food'] || 0) / Math.max(oneYearCount, 1)),
          icon: Utensils
        },
        { 
          name: 'Housing', 
          planned: plannedValues[monthKey]?.Housing || 0, 
          actual: currentCategoryTotals['Housing'] || 0, 
          threeMonthAvg: Math.round((threeMonthCategoryTotals['Housing'] || 0) / Math.max(threeMonthCount, 1)), 
          oneYearAvg: Math.round((oneYearCategoryTotals['Housing'] || 0) / Math.max(oneYearCount, 1)),
          icon: Home
        },
        { 
          name: 'Transport', 
          planned: plannedValues[monthKey]?.Transport || 0, 
          actual: currentCategoryTotals['Transport'] || 0, 
          threeMonthAvg: Math.round((threeMonthCategoryTotals['Transport'] || 0) / Math.max(threeMonthCount, 1)), 
          oneYearAvg: Math.round((oneYearCategoryTotals['Transport'] || 0) / Math.max(oneYearCount, 1)),
          icon: Car
        },
        { 
          name: 'Health', 
          planned: plannedValues[monthKey]?.Health || 0, 
          actual: currentCategoryTotals['Health'] || 0, 
          threeMonthAvg: Math.round((threeMonthCategoryTotals['Health'] || 0) / Math.max(threeMonthCount, 1)), 
          oneYearAvg: Math.round((oneYearCategoryTotals['Health'] || 0) / Math.max(oneYearCount, 1)),
          icon: Heart
        },
        { 
          name: 'Utilities', 
          planned: plannedValues[monthKey]?.Utilities || 0, 
          actual: currentCategoryTotals['Utilities'] || 0, 
          threeMonthAvg: Math.round((threeMonthCategoryTotals['Utilities'] || 0) / Math.max(threeMonthCount, 1)), 
          oneYearAvg: Math.round((oneYearCategoryTotals['Utilities'] || 0) / Math.max(oneYearCount, 1)),
          icon: Zap
        },
        { 
          name: 'Personal', 
          planned: plannedValues[monthKey]?.Personal || 0, 
          actual: currentCategoryTotals['Personal'] || 0, 
          threeMonthAvg: Math.round((threeMonthCategoryTotals['Personal'] || 0) / Math.max(threeMonthCount, 1)), 
          oneYearAvg: Math.round((oneYearCategoryTotals['Personal'] || 0) / Math.max(oneYearCount, 1)),
          icon: User
        },
        { 
          name: 'Debt', 
          planned: plannedValues[monthKey]?.Debt || 0, 
          actual: currentCategoryTotals['Debt'] || 0, 
          threeMonthAvg: Math.round((threeMonthCategoryTotals['Debt'] || 0) / Math.max(threeMonthCount, 1)), 
          oneYearAvg: Math.round((oneYearCategoryTotals['Debt'] || 0) / Math.max(oneYearCount, 1)),
          icon: DollarSign
        }
      ]
    };
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
      category: 'Personal',
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

  // Handle view type change (for filtering the list)
  const handleViewTypeChange = (value: string) => {
    setViewType(value as 'expense' | 'income');
  };

  // Handle month navigation
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  // Handle planned value updates
  const handlePlannedValueChange = (category: string, value: string) => {
    const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    const num = parseFloat(value);
    const numValue = isNaN(num) ? 0 : num;
    
    setPlannedValues(prev => ({
      ...prev,
      [monthKey]: {
        ...prev[monthKey],
        [category]: numValue
      }
    }));
  };

  // Handle delete expense/income
  const handleDeleteExpense = async (id: string) => {
    if (!isAuthenticated) {
      // Demo mode: remove from local state
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      return;
    }

    try {
      await apiClient.deleteExpense(id);
      // Reload expenses after deletion
      await loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Use calculateMonthlySummary as primary source since it works with the correct data structure
  const monthlyData = isAuthenticated ? calculateMonthlySummary(selectedMonth) : {
    mainCategories: [
      { 
        name: 'Income', 
        planned: 0,
        actual: 0,
        threeMonthAvg: 0, 
        oneYearAvg: 0,
        type: 'income',
        icon: DollarSign
      },
      { 
        name: 'Investments', 
        planned: 0, 
        actual: 0, 
        threeMonthAvg: 0, 
        oneYearAvg: 0,
        type: 'income',
        icon: PiggyBank
      },
      { 
        name: 'Expenses', 
        planned: 0,
        actual: 0,
        threeMonthAvg: 0, 
        oneYearAvg: 0,
        type: 'expense',
        icon: TrendingDown
      }
    ],
    expenseCategories: [
      { 
        name: 'Food', 
        planned: 0, 
        actual: 0, 
        threeMonthAvg: 0, 
        oneYearAvg: 0,
        icon: Utensils
      },
      { 
        name: 'Home', 
        planned: 0, 
        actual: 0, 
        threeMonthAvg: 0, 
        oneYearAvg: 0,
        icon: Home
      },
      { 
        name: 'Transport', 
        planned: 0, 
        actual: 0, 
        threeMonthAvg: 0, 
        oneYearAvg: 0,
        icon: Car
      },
      { 
        name: 'Health', 
        planned: 0, 
        actual: 0, 
        threeMonthAvg: 0, 
        oneYearAvg: 0,
        icon: Heart
      },
      { 
        name: 'Utilities', 
        planned: 0, 
        actual: 0, 
        threeMonthAvg: 0, 
        oneYearAvg: 0,
        icon: Zap
      },
      { 
        name: 'Shopping', 
        planned: 0, 
        actual: 0, 
        threeMonthAvg: 0, 
        oneYearAvg: 0,
        icon: User
      }
    ]
  };

  // Get main categories data for progress bars
  const incomeData = monthlyData?.mainCategories?.find(cat => cat.name === 'Income');
  const investmentsData = monthlyData?.mainCategories?.find(cat => cat.name === 'Investments');
  const expensesData = monthlyData?.mainCategories?.find(cat => cat.name === 'Expenses');



  const handleRecurringExpenseSubmit = async (
    id: string,
    amount: string,
    name: string,
    category: string,
    date: string
  ) => {
    if (!amount || parseFloat(amount) < 0.01 || !name.trim()) return;

    const expensePayload = {
      name,
      amount: -Math.abs(parseFloat(amount)), // Make expense negative
      category,
      date,
      type: 'expense' as const,
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
          amount: -Math.abs(parseFloat(amount)), // Make expense negative
          category,
          date,
          type: 'expense',
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

  const handleSaveStartingBalance = async () => {
    if (!isAuthenticated) return; // Only persist when logged in
    const amountNum = Math.max(0, parseFloat(startingBalance || '0'));
    if (!amountNum) return;
    try {
      if (startingEntry) {
        // Update existing starting balance entry
        const updated = await apiClient.updateExpense(startingEntry.id, { amount: amountNum, date: startingDate });
        setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
        setStartingEntry(updated);
      } else {
        // Create as a one-time income with identifying note
        const created = await apiClient.createExpense({
          name: 'Starting Balance',
          amount: amountNum,
          category: 'Starting Balance',
          date: startingDate,
          type: 'income' as any,
          isRecurring: false,
          notes: '__starting_balance__'
        } as any);
        setExpenses(prev => [created, ...prev]);
        setStartingEntry(created);
      }
    } catch {
      // no-op UI errors; leave state as-is
    }
  };

  // Filter data based on current filters and view type
  const currentData = isAuthenticated && expenses.length > 0 
    ? expenses.filter(expense => expense.type === viewType)
    : (viewType === 'expense' ? emptyExpenseData : emptyIncomeData);
  
  
  // Ensure currentData is always an array
  const dataArray = Array.isArray(currentData) ? currentData : (currentData ? Object.values(currentData) : []);
  
  const filteredData = dataArray.filter(entry => {
    if (!entry) return false;
    // Filter by view type (expense/income) based on the toggle
    if (entry.type !== viewType) return false;
    if (filters.category !== 'all' && entry.category !== filters.category) return false;
    if (filters.dateFrom && new Date(entry.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(entry.date) > new Date(filters.dateTo)) return false;
    if (filters.amountMin && entry.amount < parseFloat(filters.amountMin)) return false;
    if (filters.amountMax && entry.amount > parseFloat(filters.amountMax)) return false;
    return true;
  });

  const hasActiveFilters = filters.category !== 'all' || filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax;

  // Sort by date desc, then by amount magnitude desc, and limit to first 30 for display
  const displayedData = [...filteredData]
    .sort((a, b) => {
      const dA = new Date(a.date).getTime();
      const dB = new Date(b.date).getTime();
      if (dB !== dA) return dB - dA; // newer first
      const mA = Math.abs(Number(a.amount) || 0);
      const mB = Math.abs(Number(b.amount) || 0);
      return mB - mA; // higher magnitude first
    })
    .slice(0, 30);

  // Balance series (line chart)
  const getBalanceSeries = () => {
    const flows: Array<{ date: string; delta: number }> = [];
    const addFlow = (date: string, delta: number) => {
      if (!date) return;
      flows.push({ date, delta });
    };
    const cutoff = new Date(balanceDate);
    const startAmt = Math.max(0, parseFloat(startingBalance || '0'));
    if (startingEntry || startAmt) {
      addFlow(startingDate, startAmt);
    }
    // Expenses and incomes
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (isNaN(d.getTime()) || d > cutoff) return;
      const amt = Math.abs(e.amount || 0);
      if (e.type === 'income') addFlow(e.date, amt);
      else addFlow(e.date, -amt);
    });
    // Investments as positive contributions
    investments.forEach(inv => {
      const d = new Date(inv.date);
      if (isNaN(d.getTime()) || d > cutoff) return;
      addFlow(inv.date, Math.abs((inv as any).amount || 0));
    });
    if (flows.length === 0) return [] as any[];
    // Sort by date asc and build cumulative
    flows.sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    const series: any[] = [];
    let lastDate = '';
    flows.forEach(f => {
      running += f.delta;
      lastDate = f.date;
      series.push({ date: f.date, Balance: Math.round(running * 100) / 100 });
    });
    // Ensure last point is on selected balanceDate if different
    if (lastDate && lastDate !== balanceDate) {
      series.push({ date: balanceDate, Balance: Math.round(running * 100) / 100 });
    }
    return series;
  };
  // Prefer backend series (for consistency), fallback to local if needed
  const [balanceSeries, setBalanceSeries] = useState<any[]>([]);
  useEffect(() => {
    if (!isAuthenticated) {
      setBalanceSeries(getBalanceSeries());
      return;
    }
    (async () => {
      try {
        const serverSeries = await apiClient.getBalanceSeries({ asOf: balanceDate, range: balanceRange });
        if (serverSeries && serverSeries.length) {
          setBalanceSeries(serverSeries.map(p => ({ date: p.date, Balance: p.balance })));
        } else {
          setBalanceSeries(getBalanceSeries());
        }
      } catch {
        setBalanceSeries(getBalanceSeries());
      }
    })();
  }, [isAuthenticated, balanceDate, balanceRange, expenses, investments, startingBalance, startingDate]);
  const currentBalance = balanceSeries.length ? balanceSeries[balanceSeries.length - 1].Balance : 0;

  // Handle form submission for adding new expenses/income
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.category) {
      return;
    }

    if (parseFloat(formData.amount) < 0.01) {
      return;
    }

    // Handle income vs expense amount processing
    const amount = entryType === 'income' 
      ? Math.abs(parseFloat(formData.amount)) // Keep income positive
      : -Math.abs(parseFloat(formData.amount)); // Make expense negative
    const type = entryType as 'expense' | 'income';

    if (!isAuthenticated) {
      // Demo mode: add to local state so it appears in list
      const newExpense: Expense = {
        id: `mock-${Date.now()}`,
        userId: 'mock',
        name: formData.name,
        amount: amount,
        category: formData.category,
        date: formData.date,
        type: type,
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
      
      await apiClient.createExpense({
        name: formData.name,
        amount: amount, // Use the processed amount
        category: formData.category,
        date: formData.date,
        type: type,
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
      
    } catch (error) {
      console.error('Error saving entry:', error);
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
            {/* Balance header */}
            <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-border">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Current Balance</div>
                  <div className="text-2xl font-bold">₹{Number(currentBalance || 0).toLocaleString()}</div>
                </div>
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <Label htmlFor="balance-date">Balance as of</Label>
                    <Input id="balance-date" type="date" value={balanceDate} onChange={e => setBalanceDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="block">Range</Label>
                    <div className="flex items-center gap-2">
                      <Button variant={balanceRange==='month' ? 'default' : 'outline'} size="sm" onClick={() => setBalanceRange('month')}>Monthly</Button>
                      <Button variant={balanceRange==='year' ? 'default' : 'outline'} size="sm" onClick={() => setBalanceRange('year')}>Yearly</Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="starting-balance">Starting amount</Label>
                    <div className="flex items-center gap-2">
                      <Input id="starting-balance" type="number" placeholder="0" value={startingBalance} onChange={e => setStartingBalance(e.target.value)} />
                      <Button type="button" onClick={handleSaveStartingBalance}>Save</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance line chart */}
              <div className="mt-4">
                {balanceSeries.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No balance data yet</div>
                ) : (
                  <ChartContainer config={{ Balance: { label: 'Balance', color: 'hsl(var(--primary))' } }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={balanceSeries} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString()} fontSize={12} />
                        <YAxis tickFormatter={(v) => `₹${Number(v).toLocaleString()}`} fontSize={12} width={80} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="Balance" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </div>
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  min="0.01"
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
                          min="0.01"
                          step="0.01"
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
                          disabled={!expense.amount || parseFloat(expense.amount) < 0.01 || !expense.name.trim()}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className={TYPOGRAPHY.sectionHeader}>Monthly Summary</h3>
              
              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMonthChange('prev')}
                  className="h-8 w-8 p-0"
                >
                  ←
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMonthChange('next')}
                  className="h-8 w-8 p-0"
                >
                  →
                </Button>
              </div>
            </div>
            
            {/* Progress Bars at the Top */}
            <div className="mb-6 space-y-4">
              {/* Income Progress Bar */}
              {incomeData && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{incomeData.name}</span>
                    <span className={`font-semibold ${incomeData.actual >= incomeData.planned ? 'text-green-600' : 'text-red-600'}`}>
                      {incomeData.actual >= incomeData.planned ? '✓' : '✗'} ₹{incomeData.actual.toLocaleString()}/{incomeData.planned.toLocaleString()}
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
                    <span className={`font-semibold ${investmentsData.actual >= investmentsData.planned ? 'text-green-600' : 'text-red-600'}`}>
                      {investmentsData.actual >= investmentsData.planned ? '✓' : '✗'} ₹{investmentsData.actual.toLocaleString()}/{investmentsData.planned.toLocaleString()}
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
                    <span className={`font-semibold ${expensesData.actual <= expensesData.planned ? 'text-green-600' : 'text-red-600'}`}>
                      {expensesData.actual <= expensesData.planned ? '✓' : '✗'} ₹{expensesData.actual.toLocaleString()}/{expensesData.planned.toLocaleString()}
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
                  {monthlyData?.mainCategories?.map((category) => {
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
                        <td className="text-center py-3 px-2 text-sm">
                          <Input
                            type="number"
                            value={category.planned ?? 0}
                            onChange={(e) => handlePlannedValueChange(category.name, e.target.value)}
                            className="w-20 h-8 text-center text-xs"
                            placeholder="0"
                            min="0"
                            step="1"
                          />
                        </td>
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
                  {monthlyData?.expenseCategories?.map((category, index) => {
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
                        <td className="text-center py-3 px-2 text-sm">
                          <Input
                            type="number"
                            value={category.planned ?? 0}
                            onChange={(e) => handlePlannedValueChange(category.name, e.target.value)}
                            className="w-20 h-8 text-center text-xs"
                            placeholder="0"
                            min="0"
                            step="1"
                          />
                        </td>
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
              <h3 className={TYPOGRAPHY.sectionHeader}>Recent {viewType === 'expense' ? 'Expenses' : 'Income'}</h3>
              <ToggleTabs
                value={viewType}
                onValueChange={(value) => handleViewTypeChange(value)}
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
                    Showing {displayedData.length} of {filteredData.length}
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
              {displayedData.length > 0 ? (
                displayedData.map((entry) => (
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
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${
                        entry.type === 'expense' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {entry.type === 'expense' ? '' : '+'}₹{Math.abs(entry.amount).toLocaleString()}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExpense(entry.id);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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