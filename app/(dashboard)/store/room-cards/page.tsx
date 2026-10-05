'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Layers } from 'lucide-react';

export default function RoomCardsStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Room Card"
      categoryTitle="Room Cover Cards"
      categoryDescription="Custom covers, badges, and frame cards for voice room listings in Explore and Home."
      themeColor="#14B8A6"
      icon={Layers}
      defaultPrice={9000}
      extraFieldLabel="Room Card Banner Type"
      extraFieldKey="roomCardType"
      extraFieldPlaceholder="e.g. Glowing Neon Border, VIP Crown Room Card"
    />
  );
}
