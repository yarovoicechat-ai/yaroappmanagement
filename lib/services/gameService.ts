import { apiClient, ApiResponse } from '@/lib/apiClient';

export interface GameStatus {
  gameId: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  icon: string;
  gameUrl: string;
  isActive: boolean;
  isHidden: boolean;
  showInVoiceRoom: boolean;
  showInLiveRoom: boolean;
  showFloatingBanner: boolean;
  engineVersion: string;
  updatedAt?: string;
}

export interface GameConfigResponse {
  greedyKing: {
    gameId: string;
    title: string;
    isActive: boolean;
    isHidden: boolean;
    showInVoiceRoom: boolean;
    showInLiveRoom: boolean;
    showFloatingBanner: boolean;
  };
}

class GameManagementService {
  async getAdminGames(): Promise<GameStatus[]> {
    try {
      const res = await apiClient.get<GameStatus[]>('/api/games/admin/all');
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }

    // Default Greedy King status if offline/initializing
    return [
      {
        gameId: 'greedy-king',
        title: 'Greedy King',
        subtitle: 'King Fruit Wheel & Royal 50x Multiplier',
        description: 'Cocos Creator HTML5 Greedy King with instant royal coin rewards & multiplayer live wheel!',
        category: 'Wheel',
        icon: 'crown',
        gameUrl: 'https://games.yaroapp.in/greedy-king/',
        isActive: true,
        isHidden: false,
        showInVoiceRoom: true,
        showInLiveRoom: true,
        showFloatingBanner: true,
        engineVersion: 'Cocos Creator 3.8.x',
      },
    ];
  }

  async updateGameStatus(
    gameId: string,
    data: {
      isActive?: boolean;
      isHidden?: boolean;
      showInVoiceRoom?: boolean;
      showInLiveRoom?: boolean;
      showFloatingBanner?: boolean;
    }
  ): Promise<ApiResponse<GameStatus>> {
    return await apiClient.patch<GameStatus>(`/api/games/${gameId}/status`, data);
  }

  async getGameConfig(): Promise<GameConfigResponse> {
    try {
      const res = await apiClient.get<GameConfigResponse>('/api/games/config');
      if (res.success && res.data) {
        return res.data;
      }
    } catch {}

    return {
      greedyKing: {
        gameId: 'greedy-king',
        title: 'Greedy King',
        isActive: true,
        isHidden: false,
        showInVoiceRoom: true,
        showInLiveRoom: true,
        showFloatingBanner: true,
      },
    };
  }
}

export const gameManagementService = new GameManagementService();
