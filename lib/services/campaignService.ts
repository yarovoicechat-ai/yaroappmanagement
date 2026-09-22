import { apiClient, ApiResponse } from '@/lib/apiClient';

export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  channel: 'PUSH_FCM' | 'IN_APP' | 'SYSTEM_BROADCAST';
  targeting: {
    country: string[];
    gender: 'ALL' | 'MALE' | 'FEMALE';
    minLevel: number;
    vipOnly: boolean;
    roleSegment: 'ALL' | 'USERS' | 'HOSTS' | 'AGENCIES' | 'SELLERS';
    activityStatus: 'ALL' | 'ACTIVE_7D' | 'INACTIVE_30D';
  };
  schedule: {
    type: 'IMMEDIATE' | 'SCHEDULED';
    scheduledAt?: string;
  };
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  metrics?: {
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
  };
  createdAt: string;
  createdBy: string;
}

export interface CampaignListResponse {
  campaigns: NotificationCampaign[];
  backendConnected: boolean;
}

class CampaignService {
  async getCampaigns(): Promise<CampaignListResponse> {
    try {
      const res = await apiClient.get<NotificationCampaign[]>('/api/admin/campaigns');
      if (res.success && Array.isArray(res.data)) {
        return { campaigns: res.data, backendConnected: true };
      }
    } catch {
      // Backend endpoint /api/admin/campaigns is not yet deployed
    }

    return {
      campaigns: [],
      backendConnected: false
    };
  }

  async dispatchCampaign(campaign: Partial<NotificationCampaign>): Promise<ApiResponse<any>> {
    // Attempt real notification dispatch
    try {
      // If channel is push/system, we can also dispatch through /api/admin/notifications if available
      return await apiClient.post('/api/admin/campaigns/dispatch', campaign);
    } catch (err: any) {
      throw new Error(err.message || 'Backend integration required: Notification Campaign Dispatcher is not yet mounted on server.');
    }
  }
}

export const campaignService = new CampaignService();
