// API Service Layer for Pulseboard Backend
import { config } from './config';

const API_BASE_URL = config.api.baseUrl;

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  gender?: string;
  location?: string;
  timezone?: string;
  avatar: string;
  memberSince: string;
  monthlyIncome: number;
  level: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Task {
  id: string;
  userId: string;
  name: string;
  description: string;
  date?: string; // Made optional to support long-term tasks
  isLongTerm?: boolean; // Long-term task flag
  completedAt?: string | null; // Actual completion timestamp
  categories: string[];
  points: Record<string, number>;
  status: 'completed' | 'pending';
  repeatFrequency?: 'none' | 'daily' | 'weekly' | 'monthly';
  repeatCount?: number;
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate?: string;
  targetDate: string;
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  category: string;
  targetValue?: number;
  currentValue?: number;
  points?: {
    health?: number;
    strength?: number;
    mind?: number;
    work?: number;
    spirit?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  startDate?: string;
  targetDate: string;
  category: string;
  targetValue?: number;
  points?: {
    health?: number;
    strength?: number;
    mind?: number;
    work?: number;
    spirit?: number;
  };
}

export interface Expense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income';
  isRecurring: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: string;
  date: string;
  currentValue: number;
  performanceMetrics: {
    absoluteReturn: number;
    percentageReturn: number;
    isProfitable: boolean;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointsSummary {
  period: string;
  date: string;
  categories: Record<string, number>;
  total: number;
  // Optional fields for lifetime view
  achievableCategories?: Record<string, number>;
  achievableTotal?: number;
  progressPercentage?: number;
  // Legacy fields for backward compatibility
  totalPossible?: Record<string, number>;
  totalPossibleTotal?: number;
}

export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalInvestment: number;
  currentValue: number;
  totalReturn: number;
  overallReturn: number;
  breakdown: Array<{
    category: string;
    value: number;
    percentage: number;
  }>;
}

export interface RecurringRule {
  id: string;
  userId: string;
  name: string;
  type: 'task' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  lastOccurrence?: string;
  data: {
    description?: string;
    duration?: number;
    categories?: string[];
    points?: Record<string, number>;
    amount?: number;
    category?: string;
    notes?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(config.auth.tokenKey);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': window.location.origin,
      ...this.getAuthHeaders(),
      ...options.headers,
    };


    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Don't send cookies for cross-origin requests
      });


      // Handle CORS preflight errors
      if (response.status === 0) {
        throw new Error('CORS Error: Request blocked by CORS policy. Check backend CORS configuration.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('CORS Error: Request blocked. Please check backend CORS configuration for localhost:8080');
      }
      
      throw error;
    }
  }

  // Authentication Methods
  async signup(userData: { email: string; name: string; password: string }): Promise<void> {
    await this.request('/auth', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signin(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data!;
  }

  async forgotPassword(email: string): Promise<void> {
    await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async confirmForgotPassword(data: { email: string; code: string; newPassword: string }): Promise<void> {
    await this.request('/auth/confirm-forgot', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/auth/me');
    return response.data!;
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await this.request('/auth/verify-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    return response.data!;
  }

  // Task Methods
  async getTasks(params?: { date?: string; view?: 'daily' | 'weekly' | 'monthly' | 'tasks' }): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.view) queryParams.append('view', params.view);
    
    const endpoint = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ items: Task[]; total: number; page: number; limit: number; hasMore: boolean }>(endpoint);
    
    // Backend returns { success: true, data: { items: [...] } }
    // Extract the items array from the nested data structure
    return response.data?.items || [];
  }

  async createTask(task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return response.data!;
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    const response = await this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
    return response.data!;
  }

  async deleteTask(id: string): Promise<void> {
    await this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Goal Methods
  async listGoals(): Promise<Goal[]> {
    const response = await this.request<{ items: Goal[]; total: number; page: number; limit: number; hasMore: boolean }>('/goals');
    return response.data?.items || [];
  }

  // Fix method name mismatch
  async getGoals(): Promise<Goal[]> {
    return this.listGoals();
  }

  async createGoal(goal: CreateGoalRequest): Promise<Goal> {
    const response = await this.request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
    return response.data!;
  }

  async updateGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
    const response = await this.request<Goal>(`/goals/${id}`, {
      method: 'PATCH', // Backend uses PATCH, not PUT
      body: JSON.stringify(goal),
    });
    return response.data!;
  }

  async updateGoalProgress(id: string, updates: Partial<Goal>): Promise<Goal> {
    const response = await this.request<Goal>(`/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  async deleteGoal(id: string): Promise<void> {
    await this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async syncGoalProgress(): Promise<void> {
    await this.request('/goals/sync', {
      method: 'POST',
    });
  }

  // Expense Methods
  async getExpenses(params?: { startDate?: string; endDate?: string; type?: 'expense' | 'income'; page?: number; limit?: number }): Promise<Expense[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    
    const endpoint = `/expenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ items: Expense[]; total: number; page: number; limit: number; hasMore: boolean }>(endpoint);
    
    // Extract the items array from the paginated response
    let items = response.data?.items || [];
    
    // Client-side filtering as fallback if backend doesn't support type filtering
    if (params?.type && items.length > 0) {
      items = items.filter(item => item.type === params.type);
    }
    
    return items;
  }

  async getAllExpenses(params?: { startDate?: string; endDate?: string; type?: 'expense' | 'income' }): Promise<Expense[]> {
    const all: Expense[] = [];
    let page = 1;
    const limit = 100; // backend cap is 100
    while (true) {
      const items = await this.getExpenses({ ...params, page, limit });
      all.push(...items);
      if (items.length < limit) break; // no more pages
      page += 1;
      if (page > 100) break; // safety cap
    }
    return all;
  }
  
  // Convenience methods for getting expenses and income separately
  async getExpensesOnly(params?: { startDate?: string; endDate?: string }): Promise<Expense[]> {
    return this.getAllExpenses({ ...params, type: 'expense' });
  }

  async getIncomeOnly(params?: { startDate?: string; endDate?: string }): Promise<Expense[]> {
    return this.getAllExpenses({ ...params, type: 'income' });
  }

  async createExpense(expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const response = await this.request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    return response.data!;
  }

  async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    const response = await this.request<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
    return response.data!;
  }

  async deleteExpense(id: string): Promise<void> {
    await this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  async getExpenseAnalytics(params?: { startDate?: string; endDate?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const endpoint = `/expenses/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request(endpoint);
    return response.data!;
  }

  // Balance Series API
  async getBalanceSeries(params?: { asOf?: string; range?: 'month' | 'year' }): Promise<Array<{ date: string; balance: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.asOf) queryParams.append('as_of', params.asOf);
    if (params?.range) queryParams.append('range', params.range);
    const endpoint = `/expenses/balance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ series: Array<{ date: string; balance: number }> }>(endpoint);
    return response.data?.series || [];
  }

  // Investment Methods
  async getInvestments(): Promise<Investment[]> {
    const response = await this.request<{ items: Investment[]; total: number; page: number; limit: number; hasMore: boolean }>('/investments');
    
    // Extract the items array from the paginated response
    return response.data?.items || [];
  }

  async createInvestment(investment: Omit<Investment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Investment> {
    const response = await this.request<Investment>('/investments', {
      method: 'POST',
      body: JSON.stringify(investment),
    });
    return response.data!;
  }

  async updateInvestment(id: string, investment: Partial<Investment>): Promise<Investment> {
    const response = await this.request<Investment>(`/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(investment),
    });
    return response.data!;
  }

  async deleteInvestment(id: string): Promise<void> {
    await this.request(`/investments/${id}`, {
      method: 'DELETE',
    });
  }

  async getPortfolio(): Promise<PortfolioSummary> {
    const response = await this.request<PortfolioSummary>('/investments/portfolio');
    return response.data!;
  }

  // Points Methods
  async getPointsSummary(params?: { period?: 'daily' | 'weekly' | 'monthly' | 'lifetime'; date_from?: string; date_to?: string }): Promise<PointsSummary> {
    const qp = new URLSearchParams();
    if (params?.period) qp.append('period', params.period);
    if (params?.date_from) qp.append('date_from', params.date_from);
    if (params?.date_to) qp.append('date_to', params.date_to);
    const endpoint = `/points${qp.toString() ? `?${qp.toString()}` : ''}`;
    console.log('[API] getPointsSummary endpoint:', endpoint);
    const response = await this.request<PointsSummary>(endpoint);
    console.log('[API] getPointsSummary response:', response);
    return response.data!;
  }

  async getDailyCumulative(params: { date_from: string; date_to: string }): Promise<{ series: Array<{ date: string; categories: Record<string, number>; total: number }> }> {
    const qp = new URLSearchParams();
    qp.append('date_from', params.date_from);
    qp.append('date_to', params.date_to);
    const endpoint = `/points/daily-cumulative?${qp.toString()}`;
    console.log('[API] getDailyCumulative endpoint:', endpoint);
    const response = await this.request<{ series: Array<{ date: string; categories: Record<string, number>; total: number }> }>(endpoint);
    console.log('[API] getDailyCumulative response:', response);
    return response.data!;
  }

  // Recurring Methods
  async createRecurringRule(rule: {
    name: string;
    type: 'task' | 'expense';
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    startDate: string;
    data: {
      description?: string;
      duration?: number;
      categories?: string[];
      points?: Record<string, number>;
      amount?: number;
      category?: string;
      notes?: string;
    };
  }): Promise<RecurringRule> {
    const response = await this.request<RecurringRule>('/recurring', {
      method: 'PUT',
      body: JSON.stringify(rule),
    });
    return response.data!;
  }

  async getRecurringRules(): Promise<RecurringRule[]> {
    const response = await this.request<{ items: RecurringRule[]; total: number; page: number; limit: number; hasMore: boolean }>('/recurring');
    return response.data?.items || [];
  }

  async getRecurringInstances(recurringId: string, params?: { 
    dateFrom?: string; 
    dateTo?: string; 
    status?: string; 
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params?.dateTo) queryParams.append('date_to', params.dateTo);
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = `/recurring/${recurringId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ items: any[]; total: number; page: number; limit: number; hasMore: boolean }>(endpoint);
    return response.data?.items || [];
  }

  async updateRecurringInstances(recurringId: string, updates: any, filters?: any): Promise<any> {
    const response = await this.request(`/recurring/${recurringId}`, {
      method: 'PUT',
      body: JSON.stringify({ updates, filters }),
    });
    return response.data!;
  }

  async updateRecurringRule(recurringId: string, rule: Partial<RecurringRule>): Promise<RecurringRule> {
    const response = await this.request(`/recurring/${recurringId}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    });
    return response.data!;
  }

  async deleteRecurringRule(recurringId: string): Promise<void> {
    await this.request(`/recurring/${recurringId}`, {
      method: 'DELETE',
    });
  }

  async deleteRecurringInstances(recurringId: string, filters?: any): Promise<void> {
    await this.request(`/recurring/${recurringId}`, {
      method: 'DELETE',
      body: JSON.stringify({ filters }),
    });
  }



  // User Data Deletion
  async deleteUserData(params: {
    mode: 'range' | 'all_keep_profile';
    dateFrom?: string;
    dateTo?: string;
    targets?: Array<'tasks' | 'expenses' | 'investments'>;
    includeLongTerm?: boolean;
    dryRun?: boolean;
  }): Promise<ApiResponse<{ totalDeleted: number; summary: any; matched?: any; sample?: any }>> {
    const queryParams = new URLSearchParams();
    queryParams.append('mode', params.mode);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.targets && params.targets.length > 0) queryParams.append('targets', params.targets.join(','));
    if (typeof params.includeLongTerm === 'boolean') queryParams.append('includeLongTerm', String(params.includeLongTerm));
    if (typeof params.dryRun === 'boolean') queryParams.append('dry_run', String(params.dryRun));

    const endpoint = `/user/data${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ totalDeleted: number; summary: any; matched?: any; sample?: any }>(endpoint, {
      method: 'DELETE',
    });
    return response;
  }

  // Bulk Import Methods
  async importTasksBatch(rows: Array<{ name: string; categories: string; points?: string; status?: string; date?: string; description?: string; duration?: number }>, dryRun: boolean = false): Promise<{
    imported: number;
    duplicates: number;
    failed: number;
    errors: string[];
    summary: { total: number };
  }> {
    const response = await this.request('/tasks/import-batch', {
      method: 'POST',
      body: JSON.stringify({ rows, dryRun })
    });
    return response.data!;
  }

  async bulkImportExpenses(csvData: string): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const response = await this.request('/bulk-import-expenses', {
      method: 'POST',
      body: JSON.stringify({ csvData })
    });
    return response.data!;
  }

  async bulkImportIncome(csvData: string): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const response = await this.request('/bulk-import-income', {
      method: 'POST',
      body: JSON.stringify({ csvData })
    });
    return response.data!;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
