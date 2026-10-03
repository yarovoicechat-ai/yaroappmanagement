'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Hash } from 'lucide-react';

export default function UniqueIdsStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Unique ID"
      categoryTitle="Unique User IDs"
      categoryDescription="Special short and lucky numeric IDs for prestigious users."
      themeColor="#F59E0B"
      icon={Hash}
      defaultPrice={50000}
      extraFieldLabel="Numeric ID Digits (e.g. 777777, 88888)"
      extraFieldKey="specialIdNumber"
      extraFieldPlaceholder="Enter 5 to 7 digit unique ID"
    />
  );
}
