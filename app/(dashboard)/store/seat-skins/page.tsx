'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Armchair } from 'lucide-react';

export default function SeatSkinsStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Seat Skin"
      categoryTitle="Room Seat Skins & VIP Chairs"
      categoryDescription="Voice room custom seat skins, golden thrones, and futuristic VIP micro seats."
      themeColor="#F59E0B"
      icon={Armchair}
      defaultPrice={6000}
      extraFieldLabel="Seat Skin Type / Style"
      extraFieldKey="seatSkinType"
      extraFieldPlaceholder="e.g. golden_throne, cyber_pod, lotus_throne, custom"
      enableThemePlacement
    />
  );
}
