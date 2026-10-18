import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

const SUPPORTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

/** Analyze an uploaded preview image and return a short product name. */
export async function suggestAssetName(file: File, assetType: string): Promise<string | null> {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) return null;
  if (file.size > 5 * 1024 * 1024) {
    toast.error('AI naming image must be 5 MB or smaller. The asset upload can still continue.');
    return null;
  }

  try {
    const body = new FormData();
    body.append('file', file);
    body.append('assetType', assetType);
    const response = await apiClient.uploadFile<{ name?: string }>('/api/upload/analyze-name', body);
    const name = response.data?.name?.trim();
    if (!name) throw new Error(response.message || 'No name was returned');
    toast.success(`AI suggested asset name: ${name}`);
    return name;
  } catch (error: any) {
    const message = String(error?.message || error?.response?.data?.message || 'AI naming is unavailable');
    toast.error(`Asset uploaded, but AI naming failed: ${message}`);
    return null;
  }
}
