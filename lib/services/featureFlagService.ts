import { apiClient, ApiResponse } from '@/lib/apiClient';

export interface FeatureFlag {
  id: string;
  flagKey: string;
  name: string;
  description: string;
  enabled: boolean;
  platform: 'ALL' | 'ANDROID' | 'IOS' | 'WEB';
  country: string[];
  language: string[];
  userSegment: 'ALL' | 'NEW_USERS' | 'VIP_ONLY' | 'HOSTS_ONLY' | 'HIGH_VALUE';
  vipSegment?: string;
  rolloutPercentage: number; // 0 - 100
  startDate?: string;
  endDate?: string;
  isKillSwitchActive: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export interface FeatureFlagListResponse {
  flags: FeatureFlag[];
  backendConnected: boolean;
}

class FeatureFlagService {
  async getFeatureFlags(): Promise<FeatureFlagListResponse> {
    try {
      const res = await apiClient.get<FeatureFlag[]>('/api/admin/feature-flags');
      if (res.success && Array.isArray(res.data)) {
        return { flags: res.data, backendConnected: true };
      }
    } catch {
      // Backend route /api/admin/feature-flags is not yet deployed on YaroServer
    }

    // Return empty list with backendConnected = false as required by safety rules
    return {
      flags: [],
      backendConnected: false
    };
  }

  async updateFeatureFlag(flag: Partial<FeatureFlag>): Promise<ApiResponse<FeatureFlag>> {
    try {
      return await apiClient.put<FeatureFlag>(`/api/admin/feature-flags/${flag.flagKey || flag.id}`, flag);
    } catch (err: any) {
      throw new Error(err.message || 'Backend integration required: Feature flag mutation endpoint is not yet mounted on server.');
    }
  }

  async triggerKillSwitch(flagKey: string, reason: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post(`/api/admin/feature-flags/${flagKey}/kill-switch`, { reason });
    } catch (err: any) {
      throw new Error(err.message || `Backend integration required: Emergency kill switch endpoint for ${flagKey} is not yet mounted on server.`);
    }
  }
}

export const featureFlagService = new FeatureFlagService();
