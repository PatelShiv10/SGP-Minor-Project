const API_BASE_URL = 'http://localhost:5000/api';

export interface Document {
  _id: string;
  lawyerId: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  lawyerClientId: string;
  title: string;
  description?: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: string;
  status: string;
  priority: string;
  tags: string[];
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  isPublic: boolean;
  downloadCount: number;
  lastDownloadedAt?: string;
  lastDownloadedBy?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  formattedFileSize?: string;
  fileExtension?: string;
  isImage?: boolean;
  isPDF?: boolean;
}

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  byStatus: { [key: string]: number };
  byCategory: { [key: string]: number };
}

export interface DocumentListResponse {
  documents: Document[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: DocumentStats;
}

export interface UploadDocumentRequest {
  clientId: string;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  tags?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  tags?: string;
  status?: string;
  reviewNotes?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
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

export const documentService = {
  // Get documents with filters and pagination
  async getDocuments(params: {
    page?: number;
    limit?: number;
    clientId?: string;
    category?: string;
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<DocumentListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/documents?${queryParams}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Upload document
  async uploadDocument(formData: FormData): Promise<Document> {
    const response = await fetch(
      `${API_BASE_URL}/documents/upload`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Get document by ID
  async getDocumentById(id: string): Promise<Document> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${id}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Download document
  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${id}/download`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.blob();
  },

  // Update document
  async updateDocument(id: string, updateData: UpdateDocumentRequest): Promise<Document> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${id}`,
      {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Delete document
  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders()
      }
    );

    await handleResponse(response);
  },

  // Get document statistics
  async getDocumentStats(clientId?: string): Promise<DocumentStats> {
    const queryParams = new URLSearchParams();
    if (clientId) {
      queryParams.append('clientId', clientId);
    }

    const response = await fetch(
      `${API_BASE_URL}/documents/stats?${queryParams}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  }
};

// Utility functions
export const getCategoryLabel = (category: string): string => {
  const categories = {
    contract: 'Contract',
    legal_brief: 'Legal Brief',
    evidence: 'Evidence',
    correspondence: 'Correspondence',
    court_document: 'Court Document',
    financial: 'Financial',
    medical: 'Medical',
    police_report: 'Police Report',
    witness_statement: 'Witness Statement',
    expert_report: 'Expert Report',
    other: 'Other'
  };
  return categories[category as keyof typeof categories] || category;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'pending_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'reviewed':
      return 'bg-blue-100 text-blue-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'archived':
      return 'bg-purple-100 text-purple-800';
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

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
  return '📄';
};