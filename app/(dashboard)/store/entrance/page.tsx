'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Car } from 'lucide-react';

export default function EntranceStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Entrance"
      categoryTitle="Entrance Effects & Rides"
      categoryDescription="Grand room entrance animations, cars, mounts, and vehicles (SVGA/GIF)."
      themeColor="#06B6D4"
      icon={Car}
      defaultPrice={15000}
      extraFieldLabel="Entrance Tag / Announcement"
      extraFieldKey="banner"
      extraFieldPlaceholder="e.g. 👑 VIP HAS ENTERED, 🚀 LEGEND ARRIVED"
    />
  );
}
