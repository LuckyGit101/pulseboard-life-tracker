// Pulseboard Design System - Centralized constants for consistency
import { Heart, Briefcase, User, DollarSign, BookOpen, Home, Car, Zap, Utensils, ShoppingBag, PiggyBank, TrendingUp, Brain, Dumbbell } from 'lucide-react';

// Standard Categories for All Pages - Exactly 5 categories
export const STANDARD_CATEGORIES = {
  HEALTH: { name: 'Health', color: '#22c55e', bgColor: '#dcfce7', icon: Heart },
  STRENGTH: { name: 'Strength', color: '#f59e0b', bgColor: '#fef3c7', icon: Dumbbell },
  MIND: { name: 'Mind', color: '#8b5cf6', bgColor: '#ede9fe', icon: Brain },
  WORK: { name: 'Work', color: '#3b82f6', bgColor: '#dbeafe', icon: Briefcase },
  SPIRIT: { name: 'Spirit', color: '#ef4444', bgColor: '#fee2e2', icon: BookOpen }
};

// Expense Categories (mapped to standard categories)
export const EXPENSE_CATEGORIES = {
  FOOD: { name: 'Food', standardCategory: 'HEALTH', icon: Utensils },
  HOUSING: { name: 'Housing', standardCategory: 'WORK', icon: Home },
  TRANSPORT: { name: 'Transport', standardCategory: 'WORK', icon: Car },
  HEALTH: { name: 'Health', standardCategory: 'HEALTH', icon: Heart },
  UTILITIES: { name: 'Utilities', standardCategory: 'WORK', icon: Zap },
  SHOPPING: { name: 'Shopping', standardCategory: 'MIND', icon: ShoppingBag },
  ENTERTAINMENT: { name: 'Entertainment', standardCategory: 'SPIRIT', icon: User },
  INVESTMENT: { name: 'Investment', standardCategory: 'MIND', icon: PiggyBank }
};

// Income Categories
export const INCOME_CATEGORIES = {
  SALARY: { name: 'Salary', standardCategory: 'WORK', icon: DollarSign },
  FREELANCE: { name: 'Freelance', standardCategory: 'WORK', icon: Briefcase },
  BONUS: { name: 'Bonus', standardCategory: 'WORK', icon: TrendingUp },
  INTEREST: { name: 'Interest', standardCategory: 'MIND', icon: PiggyBank },
  INVESTMENT_RETURN: { name: 'Investment Return', standardCategory: 'MIND', icon: TrendingUp },
  OTHER: { name: 'Other', standardCategory: 'WORK', icon: DollarSign }
};

// Investment Categories (mapped to standard categories)
export const INVESTMENT_CATEGORIES = {
  STOCKS: { name: 'Stocks', standardCategory: 'MIND', icon: TrendingUp },
  MUTUAL_FUNDS: { name: 'Mutual Funds', standardCategory: 'MIND', icon: PiggyBank },
  PPF: { name: 'PPF', standardCategory: 'MIND', icon: DollarSign },
  ELSS: { name: 'ELSS', standardCategory: 'MIND', icon: DollarSign },
  GOLD: { name: 'Gold', standardCategory: 'MIND', icon: DollarSign },
  CRYPTO: { name: 'Crypto', standardCategory: 'MIND', icon: TrendingUp }
};

// Typography Scale with Gradient Effects
export const TYPOGRAPHY = {
  pageTitle: 'text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
  sectionHeader: 'text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent',
  cardTitle: 'text-lg font-medium text-gray-800',
  bodyText: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
  metric: 'text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
  metricLabel: 'text-sm font-medium text-gray-600'
};

// Layout Components with Enhanced Shadows
export const LAYOUT = {
  standardCard: 'p-8 bg-white shadow-2xl rounded-3xl border border-gray-200/50',
  metricCard: 'p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl border border-gray-200/50',
  actionCard: 'p-6 bg-white shadow-lg rounded-2xl border border-gray-200/50',
  section: 'space-y-8',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
};

// Helper Functions
export const getCategoryColor = (categoryName: string) => {
  const category = Object.values(STANDARD_CATEGORIES).find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category?.color || '#6b7280';
};

export const getCategoryIcon = (categoryName: string) => {
  const category = Object.values(STANDARD_CATEGORIES).find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category?.icon || User;
}; 