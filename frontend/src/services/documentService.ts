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
  title: string;
  description?: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: 'contract' | 'brief' | 'evidence' | 'correspondence' | 'legal_document' | 'other';
  status: 'new' | 'reviewed' | 'needs_attention' | 'approved' | 'rejected';
  tags: string[];
  isPublic: boolean;
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
  downloadCount: number;
  lastAccessed?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  formattedFileSize?: string;
  fileExtension?: string;
}

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  statusDistribution: { [key: string]: number };
  typeDistribution: { [key: string]: number };
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
  documentType?: string;
  tags?: string[];
  file: File;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  documentType?: string;
  status?: string;
  tags?: string[];
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
  // Get all documents for lawyer
  async getLawyerDocuments(params: {
    page?: number;
    limit?: number;
    status?: string;
    documentType?: string;
    clientId?: string;
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
      `${API_BASE_URL}/documents/lawyer?${queryParams}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Get documents for a specific client
  async getClientDocuments(clientId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
    documentType?: string;
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
      `${API_BASE_URL}/documents/client/${clientId}?${queryParams}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Upload a new document
  async uploadDocument(documentData: UploadDocumentRequest): Promise<Document> {
    const formData = new FormData();
    formData.append('file', documentData.file);
    formData.append('clientId', documentData.clientId);
    formData.append('title', documentData.title);
    
    if (documentData.description) {
      formData.append('description', documentData.description);
    }
    
    if (documentData.documentType) {
      formData.append('documentType', documentData.documentType);
    }
    
    if (documentData.tags) {
      documentData.tags.forEach(tag => formData.append('tags[]', tag));
    }
    


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
  async getDocumentById(documentId: string): Promise<Document> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${documentId}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Update document
  async updateDocument(documentId: string, updateData: UpdateDocumentRequest): Promise<Document> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${documentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updateData)
      }
    );

    const data = await handleResponse(response);
    return data.data;
  },

  // Delete document
  async deleteDocument(documentId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${documentId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders()
      }
    );

    await handleResponse(response);
  },

  // Download document
  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${documentId}/download`,
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

  // Get document statistics
  async getDocumentStats(clientId?: string): Promise<DocumentStats> {
    const queryParams = clientId ? `?clientId=${clientId}` : '';
    
    const response = await fetch(
      `${API_BASE_URL}/documents/stats${queryParams}`,
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
export const getDocumentTypeLabel = (documentType: string): string => {
  const types = {
    contract: 'Contract',
    brief: 'Legal Brief',
    evidence: 'Evidence',
    correspondence: 'Correspondence',
    legal_document: 'Legal Document',
    other: 'Other'
  };
  return types[documentType as keyof typeof types] || documentType;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'reviewed':
      return 'bg-green-100 text-green-800';
    case 'needs_attention':
      return 'bg-red-100 text-red-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getDocumentTypeColor = (documentType: string): string => {
  switch (documentType) {
    case 'contract':
      return 'bg-purple-100 text-purple-800';
    case 'brief':
      return 'bg-blue-100 text-blue-800';
    case 'evidence':
      return 'bg-orange-100 text-orange-800';
    case 'correspondence':
      return 'bg-green-100 text-green-800';
    case 'legal_document':
      return 'bg-indigo-100 text-indigo-800';
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

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
  return '📄';
};