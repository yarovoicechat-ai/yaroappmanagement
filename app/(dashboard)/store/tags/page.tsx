'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Tag } from 'lucide-react';

export default function TagsStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Tag"
      categoryTitle="Tags & Staff Badges Studio"
      categoryDescription="Official role tags, staff badges, VIP banners, and exclusive room chat tags."
      themeColor="#F59E0B"
      icon={Tag}
      defaultPrice={3000}
      extraFieldLabel="Tag Category / Organization"
      extraFieldKey="tagGroup"
      extraFieldPlaceholder="e.g. Official Staff, VIP Elite, Room Admin, BD Agency"
      enableTargetLocation={true}
    />
  );
}
