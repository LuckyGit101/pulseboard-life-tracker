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
  date: string;
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
  description: string;
  targetDate: string;
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  category: string;
  currentPoints: number;
  totalPoints: number;
  points: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  date: string;
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

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Don't send cookies for cross-origin requests
      });

      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Handle CORS preflight errors
      if (response.status === 0) {
        throw new Error('CORS Error: Request blocked by CORS policy. Check backend CORS configuration.');
      }

      const data = await response.json();
      console.log('API Response Data:', data);

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
  async signup(userData: { email: string; name: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data!;
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
  async getTasks(params?: { date?: string; view?: 'daily' | 'weekly' | 'monthly' }): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.view) queryParams.append('view', params.view);
    
    const endpoint = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ items: Task[]; total: number; page: number; limit: number; hasMore: boolean }>(endpoint);
    
    // Extract the items array from the paginated response
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
    const response = await this.request<Goal[]>('/goals');
    return response.data!;
  }

  async createGoal(goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const response = await this.request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
    return response.data!;
  }

  async updateGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
    const response = await this.request<Goal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
    return response.data!;
  }

  async deleteGoal(id: string): Promise<void> {
    await this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  // Expense Methods
  async getExpenses(params?: { startDate?: string; endDate?: string }): Promise<Expense[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const endpoint = `/expenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<{ items: Expense[]; total: number; page: number; limit: number; hasMore: boolean }>(endpoint);
    
    // Extract the items array from the paginated response
    return response.data?.items || [];
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
  async getPointsSummary(params?: { startDate?: string; endDate?: string }): Promise<PointsSummary[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const endpoint = `/points${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<PointsSummary[]>(endpoint);
    return response.data!;
  }

  async getDailyCumulativePoints(params?: { startDate?: string; endDate?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const endpoint = `/points/daily-cumulative${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request(endpoint);
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
}

// Export singleton instance
export const apiClient = new ApiClient();
