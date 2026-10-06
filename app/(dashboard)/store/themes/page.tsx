'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Palette } from 'lucide-react';

export default function ThemesStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Theme"
      categoryTitle="Room Themes & Wallpapers"
      categoryDescription="Room backgrounds, luxury stage wallpapers, and festive room themes."
      themeColor="#8B5CF6"
      icon={Palette}
      defaultPrice={8000}
      extraFieldLabel="Theme Style / Ambient Sound Tag"
      extraFieldKey="themeStyle"
      extraFieldPlaceholder="e.g. Cyberpunk, Royal Castle, Romantic Rose"
      enableThemePlacement
    />
  );
}
