
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Scale, User, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegalAISettings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    autoSave: true,
    responseLength: 'medium',
    customInstructions: ''
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    // In real implementation, save to backend
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <Link to="/chatbot">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Legal AI Settings</h1>
                <p className="text-muted-foreground">Customize your AI legal assistant experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Behavior
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">General Preferences</CardTitle>
                <CardDescription>
                  Configure your basic Legal AI settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-foreground font-medium">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                   <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                    className="data-[state=checked]:bg-teal"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-foreground font-medium">Auto-save Conversations</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your chat history
                    </p>
                  </div>
                   <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                    className="data-[state=checked]:bg-teal"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">AI Behavior Settings</CardTitle>
                <CardDescription>
                  Customize how Legal AI responds and behaves
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="responseLength" className="text-foreground font-medium">Response Length</Label>
                  <Select value={settings.responseLength} onValueChange={(value) => handleSettingChange('responseLength', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select response length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short & Concise</SelectItem>
                      <SelectItem value="medium">Medium Detail</SelectItem>
                      <SelectItem value="long">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customInstructions" className="text-foreground font-medium">Custom Instructions</Label>
                  <Textarea
                    id="customInstructions"
                    placeholder="Add any specific instructions for how Legal AI should respond to you..."
                    value={settings.customInstructions}
                    onChange={(e) => handleSettingChange('customInstructions', e.target.value)}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    These instructions will be considered in all conversations
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6 mt-6">
          <Button onClick={handleSave} className="bg-teal hover:bg-teal-light text-white px-8 py-2">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LegalAISettings;
