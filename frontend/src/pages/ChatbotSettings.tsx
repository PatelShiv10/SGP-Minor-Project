
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Bot, User, Bell, Shield, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatbotSettings = () => {
  const [settings, setSettings] = useState({
    aiPersonality: 'professional',
    responseLength: 'medium',
    enableNotifications: true,
    enableSoundEffects: false,
    autoSave: true,
    customPrompt: '',
    darkMode: false
  });

  // Mock user data - would come from auth context in real app
  const currentUser = {
    name: "Andrew Neilson",
    email: "andrew@example.com"
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link 
            to="/chatbot" 
            className="flex items-center space-x-2 text-gray-600 hover:text-teal transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Chat</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-navy">Chatbot Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* User Account Section */}
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{currentUser.name}</h3>
                <p className="text-sm text-gray-600">{currentUser.email}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant Settings */}
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Assistant Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Personality
              </label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={settings.aiPersonality}
                onChange={(e) => handleSettingChange('aiPersonality', e.target.value)}
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Length
              </label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={settings.responseLength}
                onChange={(e) => handleSettingChange('responseLength', e.target.value)}
              >
                <option value="short">Short & Concise</option>
                <option value="medium">Medium Detail</option>
                <option value="long">Detailed & Comprehensive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Instructions (Optional)
              </label>
              <Textarea
                placeholder="Add any specific instructions for how the AI should respond to you..."
                value={settings.customPrompt}
                onChange={(e) => handleSettingChange('customPrompt', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications & Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-600">Get notified of new responses</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sound Effects</h3>
                <p className="text-sm text-gray-600">Play sounds for new messages</p>
              </div>
              <Switch
                checked={settings.enableSoundEffects}
                onCheckedChange={(checked) => handleSettingChange('enableSoundEffects', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-save Conversations</h3>
                <p className="text-sm text-gray-600">Automatically save chat history</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Data Retention</h3>
                <p className="text-sm text-gray-600">Keep chat history for 30 days</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Export Chat History</h3>
                <p className="text-sm text-gray-600">Download your conversations</p>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="shadow-soft border-0 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span>Danger Zone</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-600">Clear All Conversations</h3>
                <p className="text-sm text-gray-600">Permanently delete all chat history</p>
              </div>
              <Button variant="destructive" size="sm">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" asChild>
            <Link to="/chatbot">Cancel</Link>
          </Button>
          <Button className="bg-teal hover:bg-teal-light text-white">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotSettings;
