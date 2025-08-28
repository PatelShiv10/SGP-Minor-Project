import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clientService, AddClientRequest, getCaseTypeLabel } from '@/services/clientService';

interface AddClientDialogProps {
  trigger?: React.ReactNode;
  onClientAdded?: () => void;
}

const AddClientDialog: React.FC<AddClientDialogProps> = ({
  trigger,
  onClientAdded
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddClientRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    caseType: 'other',
    caseTitle: '',
    caseDescription: '',
    notes: '',
    preferredContact: 'email',
    hourlyRate: undefined,
    priority: 'medium'
  });

  const { toast } = useToast();

  const caseTypes = [
    'family_law', 'corporate_law', 'criminal_law', 'civil_litigation',
    'real_estate', 'immigration', 'personal_injury', 'employment',
    'intellectual_property', 'tax_law', 'estate_planning', 'other'
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'video_call', label: 'Video Call' },
    { value: 'in_person', label: 'In Person' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await clientService.addClient({
        ...formData,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined
      });
      
      toast({
        title: "Success",
        description: "Client added successfully!"
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        caseType: 'other',
        caseTitle: '',
        caseDescription: '',
        notes: '',
        preferredContact: 'email',
        hourlyRate: undefined,
        priority: 'medium'
      });
      
      setOpen(false);
      onClientAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add client. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-teal hover:bg-teal-light text-white">
      <Plus className="h-4 w-4 mr-2" />
      Add New Client
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-navy">
            Add New Client
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Smith"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.smith@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>

          {/* Case Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy">Case Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="caseType">Case Type</Label>
                <Select 
                  value={formData.caseType} 
                  onValueChange={(value) => setFormData({ ...formData, caseType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    {caseTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {getCaseTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseTitle">Case Title</Label>
              <Input
                id="caseTitle"
                value={formData.caseTitle}
                onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                placeholder="Brief description of the case"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseDescription">Case Description</Label>
              <Textarea
                id="caseDescription"
                value={formData.caseDescription}
                onChange={(e) => setFormData({ ...formData, caseDescription: e.target.value })}
                placeholder="Detailed description of the legal matter..."
                className="min-h-[80px]"
                maxLength={1000}
              />
            </div>
          </div>

          {/* Communication & Billing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy">Communication & Billing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredContact">Preferred Contact</Label>
                <Select 
                  value={formData.preferredContact} 
                  onValueChange={(value) => setFormData({ ...formData, preferredContact: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate || ''}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="250.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Initial Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any initial notes about the client or case..."
                className="min-h-[80px]"
                maxLength={2000}
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-teal hover:bg-teal-light text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Client...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Add Client
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;