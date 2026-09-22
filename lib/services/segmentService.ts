import { apiClient, ApiResponse } from '@/lib/apiClient';

export interface SegmentTargetingRules {
  countries?: string[];
  languages?: string[];
  gender?: 'ALL' | 'MALE' | 'FEMALE';
  minLevel?: number;
  maxLevel?: number;
  vipOnly?: boolean;
  minCoinsSpent?: number;
  minDiamondsEarned?: number;
  registeredDaysAgoMin?: number;
  registeredDaysAgoMax?: number;
  lastActiveDaysAgoMax?: number;
  roles?: ('USER' | 'HOST' | 'AGENCY' | 'SELLER')[];
}

export interface UserSegment {
  _id: string;
  name: string;
  description?: string;
  rules: SegmentTargetingRules;
  estimatedUserCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentListResponse {
  segments: UserSegment[];
  backendConnected: boolean;
}

class SegmentService {
  async getSegments(): Promise<SegmentListResponse> {
    try {
      const res = await apiClient.get<UserSegment[]>('/api/admin/segments');
      if (res.success && Array.isArray(res.data)) {
        return { segments: res.data, backendConnected: true };
      }
    } catch {
      // Endpoint fallback
    }

    return {
      segments: [],
      backendConnected: false
    };
  }

  async previewCount(rules: SegmentTargetingRules): Promise<number> {
    try {
      const res = await apiClient.post<{ matchingUsersCount: number }>('/api/admin/segments/preview-count', { rules });
      if (res.success && res.data) {
        return res.data.matchingUsersCount;
      }
      return 0;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to preview segment audience');
    }
  }

  async createSegment(segment: Partial<UserSegment>): Promise<ApiResponse<UserSegment>> {
    return apiClient.post('/api/admin/segments', segment);
  }

  async deleteSegment(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/admin/segments/${id}`);
  }
}

export const segmentService = new SegmentService();
