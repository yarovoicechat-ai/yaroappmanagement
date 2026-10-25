'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Award } from 'lucide-react';

export default function BadgesStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Badge"
      categoryTitle="Badges & Medals Studio"
      categoryDescription="Official status badges, achievements, wealth/charm medals, and animated SVGA badges."
      themeColor="#8B5CF6"
      icon={Award}
      defaultPrice={5000}
      extraFieldLabel="Badge Honor Title"
      extraFieldKey="honorTitle"
      extraFieldPlaceholder="e.g. Sovereign Champion, Gold Knight, Top Gifter"
      enableTargetLocation={true}
    />
  );
}
