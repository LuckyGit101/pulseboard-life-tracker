import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Settings, Globe, Download, Shield, LogOut, ArrowRight, Bell, Moon } from 'lucide-react';
import { TYPOGRAPHY, LAYOUT } from '@/lib/designSystem';

import { userData } from '@/data/mockData';

// Use imported user data - Cache refresh fix
const mockUser = userData;

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState({
    name: mockUser.name,
    email: mockUser.email,
    age: '24',
    gender: 'Male',
    timezone: ''
  });

  const [preferences, setPreferences] = useState({
    calendarSync: true,
    notifications: true,
    darkMode: false,
    emailUpdates: true
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = () => {
    console.log('Save profile:', userInfo);
    setIsEditing(false);
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const memberSince = mockUser.memberSince;

  const completionRate = Math.round((mockUser.completedTasks / mockUser.totalTasks) * 100);

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
              <AvatarImage src={mockUser.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(mockUser.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2 text-foreground">{mockUser.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{mockUser.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-status text-white">Level {mockUser.level}</Badge>
                <Badge variant="outline">{mockUser.totalTasks} Total Tasks</Badge>
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
            <div className="text-3xl font-bold text-primary mb-2">{mockUser.totalTasks}</div>
            <div className="text-muted-foreground">Total Tasks</div>
          </Card>
          
          <Card className="p-6 text-center bg-white shadow-card border border-border">
            <div className="text-3xl font-bold text-health mb-2">{mockUser.completedTasks}</div>
            <div className="text-muted-foreground">Completed Tasks</div>
          </Card>
          
          <Card className="p-6 text-center bg-white shadow-card border border-border">
            <div className="text-3xl font-bold text-strength mb-2">{mockUser.level}</div>
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
                  value={mockUser.email}
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

        {/* Account Actions */}
        <Card className="p-6 bg-white shadow-card border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Account Actions</h3>
          </div>

          <div className="space-y-4">
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
      </div>
    </div>
  );
};

export default ProfilePage;