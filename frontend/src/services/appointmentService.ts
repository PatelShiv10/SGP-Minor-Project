const API_BASE_URL = 'http://localhost:5000/api';

export interface Appointment {
  _id: string;
  lawyerId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  date: string;
  start: string;
  end: string;
  durationMins: number;
  appointmentType: 'consultation' | 'follow_up' | 'document_review' | 'legal_advice' | 'court_preparation' | 'other';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  clientNotes?: string;
  lawyerNotes?: string;
  meetingType: 'in_person' | 'video_call' | 'phone_call';
  meetingLink?: string;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  reminderSent: boolean;
  followUpRequired: boolean;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  durationFormatted?: string;
  timeRange?: string;
  startDateTime?: string;
  endDateTime?: string;
}

export interface AppointmentStats {
  pending?: number;
  confirmed?: number;
  completed?: number;
  cancelled?: number;
  no_show?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  client: {
    name: string;
    email: string;
    phone?: string;
  };
  type: string;
  meetingType: string;
  notes?: string;
  clientNotes?: string;
}

export interface DashboardStats {
  todaysAppointments: number;
  thisMonthAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  recentActivity: Array<{
    id: string;
    message: string;
    time: string;
    type: string;
  }>;
  recentReviews?: Array<{
    rating: number;
    comment: string;
    clientName?: string;
    createdAt: string;
    isApproved?: boolean;
    response?: { message?: string } | string;
  }>;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  pagination: PaginationInfo;
  stats: AppointmentStats;
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

export const appointmentService = {
  // Get all appointments for lawyer with filters and pagination
  async getLawyerAppointments(params: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<AppointmentListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/appointments/lawyer?${queryParams}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Get today's appointments
  async getTodaysAppointments(): Promise<Appointment[]> {
    const response = await fetch(
      `${API_BASE_URL}/appointments/lawyer/today`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Get upcoming appointments
  async getUpcomingAppointments(limit: number = 10): Promise<Appointment[]> {
    const response = await fetch(
      `${API_BASE_URL}/appointments/lawyer/upcoming?limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Get calendar appointments
  async getCalendarAppointments(startDate: string, endDate: string, status?: string): Promise<CalendarEvent[]> {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      ...(status && { status })
    });

    const response = await fetch(
      `${API_BASE_URL}/appointments/lawyer/calendar?${queryParams}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(
      `${API_BASE_URL}/appointments/lawyer/stats`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Get appointment details
  async getAppointmentDetails(appointmentId: string): Promise<Appointment> {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Update appointment status
  async updateAppointmentStatus(
    appointmentId: string, 
    status: string, 
    reason?: string, 
    notes?: string
  ): Promise<Appointment> {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}/status`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status,
          ...(reason && { reason }),
          ...(notes && { notes })
        })
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Update appointment notes
  async updateAppointmentNotes(appointmentId: string, lawyerNotes: string): Promise<Appointment> {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}/notes`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ lawyerNotes })
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Reschedule appointment
  async rescheduleAppointment(
    appointmentId: string, 
    date: string, 
    start: string, 
    durationMins?: number
  ): Promise<Appointment> {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}/reschedule`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          date,
          start,
          ...(durationMins && { durationMins })
        })
      }
    );

    const data = await handleResponse(response);
    return data.data;
  }
};

// Utility functions
export const formatAppointmentTime = (start: string, end: string): string => {
  const asTime = (v: any): string | undefined => {
    if (typeof v === 'string') return v.trim();
    return undefined;
  };
  const formatTime = (time?: string) => {
    if (!time || time.indexOf(':') === -1) {
      return '--';
    }
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    if (Number.isNaN(hour)) return '--';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const mins = (minutes ?? '00').padStart(2, '0');
    return `${displayHour}:${mins} ${ampm}`;
  };

  const startStr = formatTime(asTime(start));
  const endStr = formatTime(asTime(end));
  return `${startStr} - ${endStr}`;
};

export const formatAppointmentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getAppointmentTypeLabel = (type: string): string => {
  const labels = {
    consultation: 'Consultation',
    follow_up: 'Follow-up',
    document_review: 'Document Review',
    legal_advice: 'Legal Advice',
    court_preparation: 'Court Preparation',
    other: 'Other'
  };
  return labels[type as keyof typeof labels] || type;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'no_show':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getMeetingTypeIcon = (type: string): string => {
  switch (type) {
    case 'video_call':
      return 'Video';
    case 'phone_call':
      return 'Phone';
    case 'in_person':
      return 'MapPin';
    default:
      return 'Calendar';
  }
};