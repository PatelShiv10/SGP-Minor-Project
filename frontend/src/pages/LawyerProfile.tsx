import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, MapPin, Award, Calendar, Camera, Plus, Trash2, Check } from 'lucide-react';
import { LawyerSidebar } from '@/components/lawyer/LawyerSidebar';
import { LawyerTopBar } from '@/components/lawyer/LawyerTopBar';
import AvailabilityManager from '@/components/lawyer/AvailabilityManager';
import { useToast } from '@/hooks/use-toast';

interface DaySchedule {
  day: string;
  isActive: boolean;
  timeSlots: { startTime: string; endTime: string; isActive: boolean }[];
}

const LawyerProfile = () => {
  const [currentPage, setCurrentPage] = useState('profile');
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem('lawyerProfileImage');
  });
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    location: '',
    barNumber: '',
    bio: '',
    education: [] as string[],
    certifications: [] as string[]
  });
  const [availability, setAvailability] = useState<DaySchedule[]>([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProfileImage(imageUrl);
        localStorage.setItem('lawyerProfileImage', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const [resProfile, resAvailability] = await Promise.all([
          fetch('http://localhost:5000/api/lawyers/me', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/lawyers/me/availability', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!resProfile.ok) throw new Error('Failed to load profile');
        const data = await resProfile.json();
        const u = data.data;
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          phone: u.phone || '',
          specialization: u.specialization || '',
          experience: u.experience?.toString?.() || '',
          location: u.location || '',
          barNumber: u.barNumber || '',
          bio: u.bio || '',
          education: Array.isArray(u.education) ? u.education : [],
          certifications: Array.isArray(u.certifications) ? u.certifications : []
        });
        if (u.profileImage && !localStorage.getItem('lawyerProfileImage')) {
          localStorage.setItem('lawyerProfileImage', u.profileImage);
          setProfileImage(u.profileImage);
        }

        if (resAvailability.ok) {
          const avData = await resAvailability.json();
          setAvailability(avData.data || []);
        }
      } catch (err) {
        toast({ title: 'Error', description: 'Could not load profile', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const addToList = (field: 'education' | 'certifications') => {
    setForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const updateListItem = (field: 'education' | 'certifications', index: number, value: string) => {
    setForm(prev => ({ ...prev, [field]: prev[field].map((v, i) => i === index ? value : v) }));
  };

  const removeListItem = (field: 'education' | 'certifications', index: number) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...form,
        experience: form.experience ? Number(form.experience) : undefined,
        profileImage: profileImage || undefined
      };
      const res = await fetch('http://localhost:5000/api/lawyers/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error('Failed to save changes');
      }
      const data = await res.json();

      try {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
          const current = JSON.parse(stored);
          const updated = {
            ...current,
            firstName: data.data.firstName,
            lastName: data.data.lastName,
            email: data.data.email
          };
          localStorage.setItem('currentUser', JSON.stringify(updated));
        }
        if (data.data.profileImage) {
          localStorage.setItem('lawyerProfileImage', data.data.profileImage);
          setProfileImage(data.data.profileImage);
        }
      } catch {}

      toast({ title: 'Saved', description: 'Profile updated successfully' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not save changes', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      setSavingAvailability(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/lawyers/me/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ availability })
      });
      if (!res.ok) throw new Error('Failed to save availability');
      toast({ title: 'Saved', description: 'Availability updated successfully' });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not save availability', variant: 'destructive' });
    } finally {
      setSavingAvailability(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <LawyerSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="flex-1 flex flex-col">
        <LawyerTopBar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-6">Profile</h1>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile Information</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="credentials">Education & Certifications</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="shadow-soft border-0 lg:col-span-1">
                    <CardContent className="p-6 text-center">
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <div className="w-24 h-24 bg-teal rounded-full flex items-center justify-center overflow-hidden">
                          {profileImage ? (
                            <img 
                              src={profileImage} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-2xl font-bold">
                              {form.firstName?.[0]?.toUpperCase?.()}{form.lastName?.[0]?.toUpperCase?.()}
                            </span>
                          )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                          <Camera className="h-4 w-4 text-gray-600" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <h2 className="text-xl font-semibold text-navy mb-2">{form.firstName} {form.lastName}</h2>
                      <p className="text-gray-600 mb-4">{form.specialization || 'Specialization not set'}</p>
                      <Badge className="mb-4">Verified Lawyer</Badge>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{form.email}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{form.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{form.location || 'Location not set'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-soft border-0 lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Edit Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <Input value={form.firstName} onChange={handleChange('firstName')} disabled={loading} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <Input value={form.lastName} onChange={handleChange('lastName')} disabled={loading} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input type="email" value={form.email} onChange={handleChange('email')} disabled={loading} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <Input value={form.phone} onChange={handleChange('phone')} disabled={loading} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialization
                        </label>
                        <Input value={form.specialization} onChange={handleChange('specialization')} disabled={loading} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years of Experience
                        </label>
                        <Input value={form.experience} onChange={handleChange('experience')} disabled={loading} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <Input value={form.location} onChange={handleChange('location')} disabled={loading} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bar Number
                        </label>
                        <Input value={form.barNumber} onChange={handleChange('barNumber')} disabled={loading} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <Textarea 
                          value={form.bio}
                          onChange={handleChange('bio')}
                          rows={4}
                          disabled={loading}
                        />
                      </div>

                      <Button onClick={handleSave} disabled={saving} className="w-full bg-teal hover:bg-teal-light text-white">
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="availability">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-navy">Availability Settings</h2>
                    <Button onClick={handleSaveAvailability} disabled={savingAvailability} className="bg-teal hover:bg-teal-light text-white">
                      {savingAvailability ? 'Saving...' : 'Save Schedule'}
                    </Button>
                  </div>
                  <AvailabilityManager value={availability} onChange={setAvailability} />
                </div>
              </TabsContent>

              <TabsContent value="credentials">
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {form.education.map((item, index) => (
                      <div key={`edu-${index}`} className="flex items-center space-x-2">
                        <Input value={item} onChange={(e) => updateListItem('education', index, e.target.value)} />
                        <Button variant="outline" onClick={() => removeListItem('education', index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addToList('education')} className="border-dashed">
                      <Plus className="h-4 w-4 mr-2" /> Add Education
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-soft border-0 mt-6">
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {form.certifications.map((item, index) => (
                      <div key={`cert-${index}`} className="flex items-center space-x-2">
                        <Input value={item} onChange={(e) => updateListItem('certifications', index, e.target.value)} />
                        <Button variant="outline" onClick={() => removeListItem('certifications', index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addToList('certifications')} className="border-dashed">
                      <Plus className="h-4 w-4 mr-2" /> Add Certification
                    </Button>
                  </CardContent>
                </Card>

                <div className="mt-6">
                  <Button onClick={handleSave} disabled={saving} className="w-full bg-teal hover:bg-teal-light text-white">
                    {saving ? 'Saving...' : 'Save Credentials'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LawyerProfile;
