import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CategoryType = 'task' | 'expense' | 'investment';

export interface Category {
  id: string;
  type: CategoryType;
  name: string;
  color?: string;
  isActive: boolean;
  order?: number;
}

interface CategoryContextValue {
  categories: Category[];
  getByType: (type: CategoryType) => Category[];
  addCategory: (type: CategoryType, name: string, color?: string) => { ok: boolean; error?: string };
  updateCategory: (id: string, data: Partial<Pick<Category, 'name' | 'color' | 'order' | 'isActive'>>) => void;
  deleteCategory: (id: string) => void; // hard delete in demo mode
  limits: { task: number; expense: number; investment: number | null };
}

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

const STORAGE_KEY = 'pb_categories_v1';

const seedDefaults = (): Category[] => {
  const now = Date.now();
  const mk = (type: CategoryType, name: string, i: number): Category => ({
    id: `${type}-${now}-${i}`,
    type,
    name,
    isActive: true,
  });

  // Tasks: 5
  const task = ['Health', 'Strength', 'Mind', 'Work', 'Spirit'].map((n, i) => mk('task', n, i));
  // Expenses: 7 (updated set)
  const expense = ['Housing', 'Utilities', 'Food', 'Health', 'Personal', 'Transport', 'Debt'].map((n, i) => mk('expense', n, i));
  // Investments: some sensible defaults
  const investment = ['Stocks', 'Mutual Funds', 'Gold', 'Crypto'].map((n, i) => mk('investment', n, i));

  return [...task, ...expense, ...investment];
};

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded: Category[] = JSON.parse(raw);
        // Migration: update expense categories from old set (with 'Shopping') to new set
        const currentExpense = loaded.filter(c => c.type === 'expense').map(c => c.name);
        const needsMigration = currentExpense.includes('Shopping') || currentExpense.length < 7 || !currentExpense.includes('Personal') || !currentExpense.includes('Debt');
        if (needsMigration) {
          const preservedNonExpense = loaded.filter(c => c.type !== 'expense');
          const migratedExpense = ['Housing', 'Utilities', 'Food', 'Health', 'Personal', 'Transport', 'Debt'].map((n, i) => ({
            id: `expense-${Date.now()}-${i}`,
            type: 'expense' as const,
            name: n,
            isActive: true,
            order: i,
          }));
          const updated = [...preservedNonExpense, ...migratedExpense];
          setCategories(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } else {
          setCategories(loaded);
        }
      } else {
        const seeded = seedDefaults();
        setCategories(seeded);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      }
    } catch (e) {
      const seeded = seedDefaults();
      setCategories(seeded);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  const limits = useMemo(() => ({ task: 5, expense: 7, investment: null as number | null }), []);

  const getByType = (type: CategoryType) => categories.filter(c => c.type === type && c.isActive);

  const addCategory = (type: CategoryType, name: string, color?: string) => {
    const existing = getByType(type);
    const cap = limits[type];
    if (cap !== null && existing.length >= cap) {
      return { ok: false, error: `Limit reached for ${type} categories` };
    }
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setCategories(prev => [...prev, { id, type, name, color, isActive: true, order: existing.length }]);
    return { ok: true };
  };

  const updateCategory = (id: string, data: Partial<Pick<Category, 'name' | 'color' | 'order' | 'isActive'>>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } as any : c)));
  };

  const deleteCategory = (id: string) => {
    // Hard delete in demo; in backend mode we would soft delete or cascade
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const value: CategoryContextValue = { categories, getByType, addCategory, updateCategory, deleteCategory, limits };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};

export const useCategories = (): CategoryContextValue => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategories must be used within CategoryProvider');
  return ctx;
};






