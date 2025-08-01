import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';

// Mock data
const mockInvestments = [
  { id: '1', name: 'Nifty 50 Index Fund', amount: 125000, type: 'Stocks', date: '2024-05-01', return: 15.2 },
  { id: '2', name: 'SBI Bluechip Fund', amount: 85000, type: 'Mutual Funds', date: '2024-05-15', return: 18.3 },
  { id: '3', name: 'PPF Account', amount: 45000, type: 'PPF', date: '2024-06-01', return: 8.1 },
  { id: '4', name: 'ELSS Tax Saver', amount: 30000, type: 'ELSS', date: '2024-06-15', return: 22.5 },
  { id: '5', name: 'Gold ETF', amount: 20000, type: 'Gold', date: '2024-07-01', return: 12.7 },
  { id: '6', name: 'Bitcoin', amount: 15000, type: 'Crypto', date: '2024-07-10', return: -8.2 }
];

const investmentTypes = ['Stocks', 'Mutual Funds', 'PPF', 'ELSS', 'Gold', 'Crypto', 'FD', 'Others'];

const getBreakdownData = () => {
  const breakdown: { [key: string]: number } = {};
  mockInvestments.forEach(investment => {
    breakdown[investment.type] = (breakdown[investment.type] || 0) + investment.amount;
  });
  
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];
  
  return Object.entries(breakdown).map(([type, amount], index) => ({
    name: type,
    value: amount,
    color: colors[index % colors.length]
  }));
};

const getPerformanceData = () => {
  return mockInvestments.map(investment => ({
    name: investment.name.length > 10 ? investment.name.substring(0, 10) + '...' : investment.name,
    return: investment.return,
    amount: investment.amount
  }));
};

const InvestmentTrackerPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<typeof mockInvestments[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: '',
    date: new Date().toISOString().split('T')[0]
  });

  const totalInvestment = mockInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReturn = mockInvestments.reduce((sum, inv) => sum + (inv.amount * inv.return / 100), 0);
  const totalValue = totalInvestment + totalReturn;
  const overallReturn = ((totalValue - totalInvestment) / totalInvestment) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit investment:', formData);
    // Reset form
    setFormData({
      name: '',
      amount: '',
      type: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
    setEditingInvestment(null);
  };

  const handleEdit = (investment: typeof mockInvestments[0]) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      amount: investment.amount.toString(),
      type: investment.type,
      date: investment.date
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    console.log('Delete investment:', id);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvestment(null);
    setFormData({
      name: '',
      amount: '',
      type: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="min-h-screen bg-white bg-gradient-to-b from-[#f5f6fa] to-[#e9eafc] p-6 lg:p-10">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={TYPOGRAPHY.pageTitle}>Investment Tracker</h2>
            <p className={TYPOGRAPHY.bodyText}>Track your investment portfolio</p>
          </div>
        </div>

        {/* Total Portfolio Value */}
        <Card className={LAYOUT.standardCard}>
          <h3 className={TYPOGRAPHY.metric}>${totalValue.toLocaleString()}</h3>
          <p className={TYPOGRAPHY.metricLabel}>Total Portfolio Value</p>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className={LAYOUT.metricCard}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className={TYPOGRAPHY.metricLabel}>Total Investment</h3>
            </div>
            <div className="text-2xl font-bold text-foreground">${totalInvestment.toLocaleString()}</div>
          </Card>
          
          <Card className={LAYOUT.metricCard}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-health" />
              <h3 className={TYPOGRAPHY.metricLabel}>Current Value</h3>
            </div>
            <div className="text-2xl font-bold text-health">${totalValue.toLocaleString()}</div>
          </Card>
          
          <Card className={LAYOUT.metricCard}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-strength" />
              <h3 className={TYPOGRAPHY.metricLabel}>Total Return</h3>
            </div>
            <div className="text-2xl font-bold text-strength">${totalReturn.toLocaleString()}</div>
          </Card>
          
          <Card className={LAYOUT.metricCard}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className={TYPOGRAPHY.metricLabel}>Overall Return</h3>
            </div>
            <div className={`text-2xl font-bold ${overallReturn >= 0 ? 'text-health' : 'text-destructive'}`}>
              {overallReturn >= 0 ? '+' : ''}{overallReturn.toFixed(1)}%
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Investment Form */}
          <Card className="p-8 bg-white shadow-2xl rounded-3xl border border-border mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                {showForm ? (editingInvestment ? 'Edit Investment' : 'Add Investment') : 'Quick Add'}
              </h3>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} size="sm" className="rounded-full px-5 py-2 font-semibold shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              )}
            </div>

            {showForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Investment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Apple Stock"
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
                    placeholder="10000"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
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
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingInvestment ? 'Update' : 'Add'} Investment
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>Track your investment portfolio</p>
                <p className="text-sm">Add investments to see breakdown and performance</p>
              </div>
            )}
          </Card>

          {/* Investment Breakdown Chart */}
          <Card className="lg:col-span-2 p-8 bg-white shadow-2xl rounded-3xl border border-border mb-6">
            <h3 className="text-lg font-semibold mb-6 text-foreground">Investment Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getBreakdownData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                  >
                    {getBreakdownData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="p-8 bg-white shadow-2xl rounded-3xl border border-border mb-6">
          <h3 className="text-lg font-semibold mb-6 text-foreground">Investment Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getPerformanceData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'return' ? `${value}%` : `$${value.toLocaleString()}`,
                    name === 'return' ? 'Return' : 'Amount'
                  ]} 
                />
                <Bar 
                  dataKey="return" 
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Investment List */}
        <Card className="p-8 bg-white shadow-2xl rounded-3xl border border-border mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">All Investments</h3>
            <Button onClick={() => setShowForm(true)} size="sm" className="rounded-full px-5 py-2 font-semibold shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
          </div>

          <div className="space-y-3">
            {mockInvestments.map((investment) => (
              <div key={investment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{investment.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{investment.type}</Badge>
                      <span>{new Date(investment.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-foreground">${investment.amount.toLocaleString()}</div>
                    <div className={`text-sm ${investment.return >= 0 ? 'text-health' : 'text-destructive'}`}>
                      {investment.return >= 0 ? '+' : ''}{investment.return}%
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(investment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(investment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvestmentTrackerPage;