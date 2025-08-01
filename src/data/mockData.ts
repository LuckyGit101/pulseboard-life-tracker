// Comprehensive 3-month dummy data for Rahul Sharma (24, Bangalore, ₹140k/month)

export const userData = {
  id: "rahul-sharma-001",
  name: "Rahul Sharma", 
  email: "rahul.sharma@gmail.com",
  age: 24,
  gender: "Male",
  location: "Bangalore",
  timezone: "Asia/Kolkata",
  avatar: "RS",
  memberSince: "January 2024",
  monthlyIncome: 140000,
  level: 18,
  totalTasks: 387,
  completedTasks: 312,
  completionRate: 81
};

// Task data for 3 months (May 2025 - July 2025)
export const mockTasks = [
  // July 2025
  { id: 't1', name: 'Morning Workout', description: 'Gym session with cardio and weights', duration: 90, date: '2025-07-28', categories: ['Health', 'Strength'], points: { health: 3, strength: 3 }, status: 'completed' },
  { id: 't2', name: 'Client Presentation', description: 'Present quarterly results to client', duration: 60, date: '2025-07-28', categories: ['Work'], points: { work: 2 }, status: 'completed' },
  { id: 't3', name: 'Meditation', description: 'Daily mindfulness practice', duration: 20, date: '2025-07-28', categories: ['Spirit'], points: { spirit: 1 }, status: 'completed' },
  { id: 't4', name: 'Read Tech Articles', description: 'Stay updated with latest technology trends', duration: 30, date: '2025-07-27', categories: ['Intelligence'], points: { intelligence: 1 }, status: 'completed' },
  { id: 't5', name: 'Team Meeting', description: 'Weekly team standup', duration: 45, date: '2025-07-27', categories: ['Work'], points: { work: 2 }, status: 'completed' },
  { id: 't6', name: 'Evening Run', description: 'Cardio session in the park', duration: 30, date: '2025-07-26', categories: ['Health'], points: { health: 1 }, status: 'completed' },
  { id: 't7', name: 'Code Review', description: 'Review team code submissions', duration: 120, date: '2025-07-26', categories: ['Work', 'Intelligence'], points: { work: 2, intelligence: 2 }, status: 'completed' },
  { id: 't8', name: 'Grocery Shopping', description: 'Weekly grocery run', duration: 60, date: '2025-07-25', categories: ['Personal'], points: { status: 1 }, status: 'completed' },
  
  // June 2025 tasks
  { id: 't9', name: 'Yoga Class', description: 'Weekly yoga session', duration: 75, date: '2025-06-30', categories: ['Health', 'Spirit'], points: { health: 2, spirit: 2 }, status: 'completed' },
  { id: 't10', name: 'Project Planning', description: 'Plan next quarter objectives', duration: 90, date: '2025-06-29', categories: ['Work'], points: { work: 3 }, status: 'completed' },
  { id: 't11', name: 'Learn React Native', description: 'Study mobile app development', duration: 120, date: '2025-06-28', categories: ['Intelligence'], points: { intelligence: 4 }, status: 'completed' },
  { id: 't12', name: 'Friend Meetup', description: 'Dinner with college friends', duration: 180, date: '2025-06-27', categories: ['Personal'], points: { status: 3 }, status: 'completed' },
  
  // May 2025 tasks
  { id: 't13', name: 'Swimming', description: 'Swimming practice at club', duration: 60, date: '2025-05-31', categories: ['Health'], points: { health: 2 }, status: 'completed' },
  { id: 't14', name: 'Database Optimization', description: 'Optimize application database queries', duration: 150, date: '2025-05-30', categories: ['Work', 'Intelligence'], points: { work: 3, intelligence: 2 }, status: 'completed' },
  { id: 't15', name: 'Book Reading', description: 'Read Atomic Habits', duration: 60, date: '2025-05-29', categories: ['Intelligence', 'Spirit'], points: { intelligence: 2, spirit: 1 }, status: 'completed' }
];

// Expense data for 3 months 
export const mockExpenses = [
  // July 2025
  { id: 'e1', name: 'Rent', amount: 35000, category: 'Housing', date: '2025-07-01', isRecurring: true },
  { id: 'e2', name: 'Groceries', amount: 4200, category: 'Food', date: '2025-07-28', isRecurring: false },
  { id: 'e3', name: 'Zomato Order', amount: 850, category: 'Food', date: '2025-07-27', isRecurring: false },
  { id: 'e4', name: 'Uber Rides', amount: 1200, category: 'Transportation', date: '2025-07-26', isRecurring: false },
  { id: 'e5', name: 'Gym Membership', amount: 2500, category: 'Health', date: '2025-07-05', isRecurring: true },
  { id: 'e6', name: 'Movie Tickets', amount: 600, category: 'Entertainment', date: '2025-07-20', isRecurring: false },
  { id: 'e7', name: 'Electricity Bill', amount: 2800, category: 'Utilities', date: '2025-07-15', isRecurring: true },
  { id: 'e8', name: 'Mobile Recharge', amount: 599, category: 'Utilities', date: '2025-07-10', isRecurring: true },
  { id: 'e9', name: 'Shopping - Clothes', amount: 3500, category: 'Shopping', date: '2025-07-22', isRecurring: false },
  { id: 'e10', name: 'Restaurant Dinner', amount: 1800, category: 'Food', date: '2025-07-18', isRecurring: false },
  
  // June 2025
  { id: 'e11', name: 'Rent', amount: 35000, category: 'Housing', date: '2025-06-01', isRecurring: true },
  { id: 'e12', name: 'Groceries', amount: 3800, category: 'Food', date: '2025-06-25', isRecurring: false },
  { id: 'e13', name: 'Petrol', amount: 2800, category: 'Transportation', date: '2025-06-20', isRecurring: false },
  { id: 'e14', name: 'Book Purchase', amount: 1200, category: 'Shopping', date: '2025-06-15', isRecurring: false },
  { id: 'e15', name: 'Internet Bill', amount: 1500, category: 'Utilities', date: '2025-06-12', isRecurring: true },
  { id: 'e16', name: 'Weekend Trip', amount: 8500, category: 'Entertainment', date: '2025-06-28', isRecurring: false },
  { id: 'e17', name: 'Medicines', amount: 450, category: 'Health', date: '2025-06-18', isRecurring: false },
  
  // May 2025
  { id: 'e18', name: 'Rent', amount: 35000, category: 'Housing', date: '2025-05-01', isRecurring: true },
  { id: 'e19', name: 'Groceries', amount: 4500, category: 'Food', date: '2025-05-30', isRecurring: false },
  { id: 'e20', name: 'Laptop Accessories', amount: 5500, category: 'Shopping', date: '2025-05-25', isRecurring: false },
  { id: 'e21', name: 'Birthday Gift', amount: 2500, category: 'Personal', date: '2025-05-20', isRecurring: false },
  { id: 'e22', name: 'Concert Tickets', amount: 3200, category: 'Entertainment', date: '2025-05-15', isRecurring: false }
];

// Income data for 3 months
export const mockIncome = [
  // July 2025
  { id: 'i1', name: 'Salary', amount: 140000, category: 'Salary', date: '2025-07-01', isRecurring: true },
  { id: 'i2', name: 'Freelance Project', amount: 15000, category: 'Freelance', date: '2025-07-15', isRecurring: false },
  { id: 'i3', name: 'Fixed Deposit Interest', amount: 1200, category: 'Interest', date: '2025-07-10', isRecurring: false },
  
  // June 2025
  { id: 'i4', name: 'Salary', amount: 140000, category: 'Salary', date: '2025-06-01', isRecurring: true },
  { id: 'i5', name: 'Freelance Project', amount: 8000, category: 'Freelance', date: '2025-06-20', isRecurring: false },
  { id: 'i6', name: 'Bonus', amount: 25000, category: 'Bonus', date: '2025-06-25', isRecurring: false },
  
  // May 2025
  { id: 'i7', name: 'Salary', amount: 140000, category: 'Salary', date: '2025-05-01', isRecurring: true },
  { id: 'i8', name: 'Freelance Project', amount: 12000, category: 'Freelance', date: '2025-05-18', isRecurring: false }
];

// Investment data
export const mockInvestments = [
  { id: 'inv1', name: 'ELSS Mutual Fund', amount: 10000, type: 'Mutual Funds', date: '2025-07-01', currentValue: 10500 },
  { id: 'inv2', name: 'Nifty Index Fund', amount: 15000, type: 'Mutual Funds', date: '2025-06-15', currentValue: 15800 },
  { id: 'inv3', name: 'PPF Contribution', amount: 12500, type: 'PPF', date: '2025-07-10', currentValue: 12500 },
  { id: 'inv4', name: 'Gold ETF', amount: 5000, type: 'Gold', date: '2025-06-20', currentValue: 5200 },
  { id: 'inv5', name: 'Tech Stocks', amount: 25000, type: 'Stocks', date: '2025-05-25', currentValue: 28500 },
  { id: 'inv6', name: 'Bitcoin', amount: 8000, type: 'Crypto', date: '2025-06-05', currentValue: 9200 },
  { id: 'inv7', name: 'SIP - Large Cap Fund', amount: 5000, type: 'Mutual Funds', date: '2025-07-20', currentValue: 5100 }
];

// Monthly summaries for charts and progress tracking
export const monthlyStats = {
  july2025: {
    totalIncome: 156200,
    totalExpenses: 72450,
    totalInvestments: 27500,
    taskCompletion: 85,
    categoryPoints: {
      health: 120,
      strength: 80,
      intelligence: 95,
      work: 150,
      spirit: 70,
      status: 40
    }
  },
  june2025: {
    totalIncome: 173000,
    totalExpenses: 68500,
    totalInvestments: 20000,
    taskCompletion: 82,
    categoryPoints: {
      health: 110,
      strength: 75,
      intelligence: 88,
      work: 140,
      spirit: 65,
      status: 38
    }
  },
  may2025: {
    totalIncome: 152000,
    totalExpenses: 71200,
    totalInvestments: 25000,
    taskCompletion: 78,
    categoryPoints: {
      health: 105,
      strength: 70,
      intelligence: 82,
      work: 135,
      spirit: 60,
      status: 35
    }
  }
};

// Chart data for trends
export const trendData = [
  { month: 'May', income: 152000, expenses: 71200, investments: 25000, tasks: 78 },
  { month: 'Jun', income: 173000, expenses: 68500, investments: 20000, tasks: 82 },
  { month: 'Jul', income: 156200, expenses: 72450, investments: 27500, tasks: 85 }
];

// Achievements/Goals data
export const mockAchievements = [
  { 
    id: 'ach1', 
    title: 'Fitness Enthusiast', 
    description: 'Complete 20 workout sessions', 
    category: 'Health',
    target: 20,
    current: 16,
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    status: 'ongoing'
  },
  { 
    id: 'ach2', 
    title: 'Learning Master', 
    description: 'Study for 50 hours this month', 
    category: 'Intelligence',
    target: 50,
    current: 42,
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    status: 'ongoing'
  },
  { 
    id: 'ach3', 
    title: 'Productivity King', 
    description: 'Complete 100 work tasks', 
    category: 'Work',
    target: 100,
    current: 100,
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    status: 'completed'
  },
  { 
    id: 'ach4', 
    title: 'Mindfulness Journey', 
    description: 'Meditate for 15 days consecutively', 
    category: 'Spirit',
    target: 15,
    current: 8,
    startDate: '2025-07-15',
    endDate: '2025-07-31',
    status: 'ongoing'
  }
];