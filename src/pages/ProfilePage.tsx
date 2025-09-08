import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Settings, Globe, Download, Shield, LogOut, ArrowRight, Bell, Moon, Trash, Upload } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/contexts/CategoryContext';
import CSVUploadModal from '@/components/tasks/CSVUploadModal';


const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { getByType, addCategory, updateCategory, deleteCategory, limits } = useCategories();
  const [colorModal, setColorModal] = useState<{ id: string; color: string } | null>(null);

  const [showDeleteData, setShowDeleteData] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'range' | 'all_keep_profile'>('range');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<string | null>(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [csvMode, setCsvMode] = useState<'tasks' | 'expenses'>('tasks');
  
  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age?.toString() || '24',
    gender: user?.gender || 'Male',
    timezone: user?.timezone || ''
  });

  const [preferences, setPreferences] = useState({
    calendarSync: true,
    notifications: true,
    darkMode: false,
    emailUpdates: true
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCSVUploadSuccess = () => {
    // Close the modal after successful upload
    setShowCSVUpload(false);
    // You could add a toast notification here if needed
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const memberSince = user?.memberSince || 'January 2024';

  const completionRate = user ? Math.round((user.completedTasks / user.totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-white bg-gradient-to-b from-[#f5f6fa] to-[#e9eafc] p-6 lg:p-10">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={TYPOGRAPHY.pageTitle}>Profile</h2>
            <p className={TYPOGRAPHY.bodyText}>Manage your account settings</p>
          </div>
        </div>

        {/* Profile Header */}
        <Card className={LAYOUT.standardCard}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(user?.name || '')}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2 text-foreground">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-status text-white">Level {user?.level}</Badge>
                <Badge variant="outline">{user?.totalTasks} Total Tasks</Badge>
                <Badge variant="outline" className="text-health">{completionRate}% Completion Rate</Badge>
              </div>
            </div>

            <Button 
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
              className="rounded-full px-5 py-2 font-semibold shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-all duration-200"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 text-center bg-white shadow-card border border-border">
            <div className="text-3xl font-bold text-primary mb-2">{user?.totalTasks || 0}</div>
            <div className="text-muted-foreground">Total Tasks</div>
          </Card>
          
          <Card className="p-6 text-center bg-white shadow-card border border-border">
            <div className="text-3xl font-bold text-health mb-2">{user?.completedTasks || 0}</div>
            <div className="text-muted-foreground">Completed Tasks</div>
          </Card>
          
          <Card className="p-6 text-center bg-white shadow-card border border-border">
            <div className="text-3xl font-bold text-strength mb-2">{user?.level || 1}</div>
            <div className="text-muted-foreground">Current Level</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="p-6 bg-white shadow-card border border-border">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={userInfo.age}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={userInfo.gender} 
                    onValueChange={(value) => setUserInfo(prev => ({ ...prev, gender: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={userInfo.timezone} 
                  onValueChange={(value) => setUserInfo(prev => ({ ...prev, timezone: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* App Preferences */}
          <Card className="p-6 bg-white shadow-card border border-border">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">App Preferences</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Calendar Sync</div>
                    <div className="text-sm text-muted-foreground">
                      Sync tasks with your calendar
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.calendarSync}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, calendarSync: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified about tasks and achievements
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, notifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Dark Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Use dark theme for the app
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, darkMode: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Email Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Receive weekly progress emails
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailUpdates}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, emailUpdates: checked }))
                  }
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Category Manager */}
        <Card className={LAYOUT.standardCard}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={TYPOGRAPHY.sectionHeader}>Category Manager</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(['task','expense','investment'] as const).map((type) => (
              <div key={type} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium capitalize">{type} Categories</div>
                  <div className="text-sm text-muted-foreground">
                    {limits[type] === null ? '∞' : `${getByType(type).length}/${limits[type]}`}
                  </div>
                </div>
                <div className="space-y-2">
                  {getByType(type).map(cat => (
                    <div key={cat.id} className="flex items-center gap-2">
                      {/* Color circle with hidden color input */}
                      <button
                        type="button"
                        aria-label="Edit color"
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: cat.color || '#94a3b8' }}
                        onClick={() => setColorModal({ id: cat.id, color: cat.color || '#94a3b8' })}
                      />

                      {/* Name inline edit */}
                      <Input
                        value={cat.name}
                        onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                        className="h-8 flex-1"
                      />

                      {/* Bin icon only */}
                      <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)} aria-label="Delete category">
                        <Trash className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-2">
                    <Input placeholder={`Add ${type} category`} className="h-8" id={`add-${type}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          const val = target.value.trim();
                          if (!val) return;
                          const res = addCategory(type, val);
                          if (res.ok) target.value = '';
                          else alert(res.error);
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => {
                      const input = document.getElementById(`add-${type}`) as HTMLInputElement | null;
                      const val = (input?.value || '').trim();
                      if (!val) return;
                      const res = addCategory(type, val);
                      if (res.ok && input) input.value = '';
                      else if (!res.ok) alert(res.error);
                    }}>Add</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {colorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 shadow-xl w-[420px] max-w-[90vw]">
              <div className="text-lg font-semibold mb-4">Pick a color</div>
              <div className="flex items-center justify-center mb-6">
                <input
                  type="color"
                  value={colorModal.color}
                  onChange={(e) => setColorModal({ ...colorModal, color: e.target.value })}
                  className="w-40 h-40 rounded-full border appearance-none cursor-pointer"
                  style={{ padding: 0, borderWidth: 2 }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setColorModal(null)}>Cancel</Button>
                <Button onClick={() => { updateCategory(colorModal.id, { color: colorModal.color }); setColorModal(null); }}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* Account Actions */}
        <Card className="p-6 bg-white shadow-card border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Account Actions</h3>
          </div>

          <div className="space-y-4">


            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Delete My Data</div>
                <div className="text-sm text-muted-foreground">
                  Delete by date range or delete all data but keep profile
                </div>
              </div>
              <Button variant="destructive" onClick={() => setShowDeleteData(true)}>Delete</Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Export Data</div>
                <div className="text-sm text-muted-foreground">
                  Download all your tasks and progress data
                </div>
              </div>
              <Button variant="outline">Export</Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Bulk Upload Tasks</div>
                <div className="text-sm text-muted-foreground">
                  Upload tasks from a CSV file to import your data
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => { setCsvMode('tasks'); setShowCSVUpload(true); }}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Bulk Upload Expenses</div>
                <div className="text-sm text-muted-foreground">
                  Upload expenses/income from a CSV file to import your data
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => { setCsvMode('expenses'); setShowCSVUpload(true); }}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-foreground">Privacy Settings</div>
                <div className="text-sm text-muted-foreground">
                  Manage your data and privacy preferences
                </div>
              </div>
              <Button variant="outline">Manage</Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <div className="font-medium text-destructive">Sign Out</div>
                <div className="text-sm text-muted-foreground">
                  Sign out of your Pulse Board account
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </Card>



        {/* Delete Data Modal */}
        {showDeleteData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-[90vw] max-w-lg">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Delete My Data</h3>
                  <Button variant="ghost" size="sm" onClick={() => { setShowDeleteData(false); setDeleteResult(null); }}>✕</Button>
                </div>

                <div className="space-y-3">
                  <Label>Mode</Label>
                  <Select value={deleteMode} onValueChange={(v) => setDeleteMode(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="range">Delete by Date Range</SelectItem>
                      <SelectItem value="all_keep_profile">Delete ALL (keep profile)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {deleteMode === 'range' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From</Label>
                      <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>To</Label>
                      <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                  </div>
                )}

                {deleteResult && (
                  <div className="text-sm p-3 rounded bg-slate-50 border border-border">
                    {deleteResult}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setShowDeleteData(false); setDeleteResult(null); }}>Cancel</Button>
                  <Button
                    variant="destructive"
                    disabled={deleting || (deleteMode === 'range' && !dateFrom && !dateTo)}
                    onClick={async () => {
                      try {
                        setDeleting(true);
                        setDeleteResult(null);
                        const res = await apiClient.deleteUserData({ mode: deleteMode, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
                        setDeleteResult(`Deleted ${res.data?.totalDeleted ?? 0} items`);
                      } catch (err: any) {
                        setDeleteResult(err.message || 'Failed to delete data');
                      } finally {
                        setDeleting(false);
                      }
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Confirm Delete'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CSV Upload Modal */}
        <CSVUploadModal
          isOpen={showCSVUpload}
          onClose={() => setShowCSVUpload(false)}
          onSuccess={handleCSVUploadSuccess}
          mode={csvMode}
        />
      </div>
    </div>
  );
};

export default ProfilePage;