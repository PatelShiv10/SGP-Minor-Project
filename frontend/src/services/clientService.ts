const API_BASE_URL = 'http://localhost:5000/api';

export interface Client {
  _id: string;
  lawyerId: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage?: string;
    createdAt: string;
  };
  addedBy: 'manual' | 'appointment' | 'booking' | 'referral';
  status: 'active' | 'pending' | 'completed' | 'inactive';
  caseType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  caseTitle?: string;
  caseDescription?: string;
  notes?: string;
  tags?: string[];
  preferredContact: 'email' | 'phone' | 'video_call' | 'in_person';
  communicationNotes?: string;
  hourlyRate?: number;
  totalBilled: number;
  totalPaid: number;
  caseStartDate?: string;
  caseEndDate?: string;
  lastContactDate: string;
  nextFollowUpDate?: string;
  isArchived: boolean;
  requiresFollowUp: boolean;
  hasUnreadMessages: boolean;
  referredBy?: string;
  referralNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  outstandingBalance?: number;
  caseDuration?: string;
  caseTypeFormatted?: string;
  // Stats
  stats?: {
    totalAppointments: number;
    lastAppointment?: {
      date: string;
      start: string;
      status: string;
      appointmentType: string;
    };
    nextAppointment?: {
      date: string;
      start: string;
      status: string;
      appointmentType: string;
    };
  };
}

export interface ClientStats {
  active: number;
  pending: number;
  completed: number;
  inactive: number;
  total: number;
}

export interface AddClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  caseType?: string;
  caseTitle?: string;
  caseDescription?: string;
  notes?: string;
  preferredContact?: string;
  hourlyRate?: number;
  priority?: string;
}

export interface UpdateClientRequest {
  caseType?: string;
  status?: string;
  priority?: string;
  caseTitle?: string;
  caseDescription?: string;
  notes?: string;
  preferredContact?: string;
  hourlyRate?: number;
  totalBilled?: number;
  totalPaid?: number;
  nextFollowUpDate?: string;
  requiresFollowUp?: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ClientListResponse {
  clients: Client[];
  pagination: PaginationInfo;
  stats: ClientStats;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const clientService = {
  // Get all clients for lawyer with filters and pagination
  async getLawyerClients(params: {
    page?: number;
    limit?: number;
    status?: string;
    caseType?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isArchived?: boolean;
  } = {}): Promise<ClientListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/clients/lawyer?${queryParams}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Add new client manually
  async addClient(clientData: AddClientRequest): Promise<Client> {
    const response = await fetch(
      `${API_BASE_URL}/clients/lawyer/add`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData)
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Get client statistics
  async getClientStats(): Promise<{
    stats: ClientStats;
    recentClients: Client[];
    followUpClients: Client[];
  }> {
    const response = await fetch(
      `${API_BASE_URL}/clients/lawyer/stats`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Get client details
  async getClientDetails(clientId: string): Promise<{
    client: Client;
    appointments: any[];
    appointmentStats: any[];
  }> {
    const response = await fetch(
      `${API_BASE_URL}/clients/${clientId}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Update client information
  async updateClient(clientId: string, updateData: UpdateClientRequest): Promise<Client> {
    const response = await fetch(
      `${API_BASE_URL}/clients/${clientId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Mark client as completed
  async markClientComplete(clientId: string, notes?: string): Promise<Client> {
    const response = await fetch(
      `${API_BASE_URL}/clients/${clientId}/complete`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes })
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Delete client relationship
  async deleteClient(clientId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/clients/${clientId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders()
      }
    );

    await handleResponse(response);
  },

  // Archive client
  async archiveClient(clientId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/clients/${clientId}/archive`,
      {
        method: 'PUT',
        headers: getAuthHeaders()
      }
    );

    await handleResponse(response);
  },

  // Add note to client
  async addClientNote(clientId: string, note: string): Promise<Client> {
    const response = await fetch(
      `${API_BASE_URL}/clients/${clientId}/notes`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ note })
      }
    );

    const data = await handleResponse(response);
    return data.data;
  }
};

// Utility functions
export const getCaseTypeLabel = (caseType: string): string => {
  const types = {
    family_law: 'Family Law',
    corporate_law: 'Corporate Law',
    criminal_law: 'Criminal Law',
    civil_litigation: 'Civil Litigation',
    real_estate: 'Real Estate',
    immigration: 'Immigration',
    personal_injury: 'Personal Injury',
    employment: 'Employment Law',
    intellectual_property: 'Intellectual Property',
    tax_law: 'Tax Law',
    estate_planning: 'Estate Planning',
    other: 'Other'
  };
  return types[caseType as keyof typeof types] || caseType;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-blue-100 text-blue-800';
    case 'low':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatClientName = (client: Client): string => {
  return `${client.clientId.firstName} ${client.clientId.lastName}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};