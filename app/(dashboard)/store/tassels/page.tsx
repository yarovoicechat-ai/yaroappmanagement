'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Bookmark } from 'lucide-react';

export default function TasselsStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Tassel"
      categoryTitle="Tassels & Ribbons"
      categoryDescription="Decorative hanging tassels, pendants, and ribbon accessories for profiles and seats."
      themeColor="#EC4899"
      icon={Bookmark}
      defaultPrice={4500}
      extraFieldLabel="Tassel Position / Attachment"
      extraFieldKey="tasselType"
      extraFieldPlaceholder="e.g. Left Corner, Mic Ring, Golden Ribbon"
    />
  );
}
