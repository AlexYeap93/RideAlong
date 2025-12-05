// Issues API

import { apiRequest } from './api';
  export const issuesAPI = {
  createIssue: async (data: {
    bookingId?: string;
    issueType: string;
    subject: string;
    description: string;
    reportedUserId?: string;
    priority?: string;
  }) => {
    return apiRequest<{ status: string; message: string; data: any }>('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getIssues: async (filters?: { status?: string; priority?: string }) => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.priority) queryParams.append('priority', filters.priority);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/issues?${queryString}` : '/issues';

    return apiRequest<{ status: string; data: any[] }>(endpoint);
  },

  getIssueById: async (id: string) => {
    return apiRequest<{ status: string; data: any }>(`/issues/${id}`);
  },

  updateIssue: async (id: string, data: { status?: string; priority?: string; adminNotes?: string }) => {
    return apiRequest<{ status: string; data: any }>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};