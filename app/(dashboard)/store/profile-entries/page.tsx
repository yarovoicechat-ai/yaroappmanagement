'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Sparkles } from 'lucide-react';

export default function ProfileEntriesStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Profile Entry"
      categoryTitle="Profile Entry Effects"
      categoryDescription="Special popup animations, sparkle particles, and audio chimes when opening a user's profile."
      themeColor="#F43F5E"
      icon={Sparkles}
      defaultPrice={12000}
      extraFieldLabel="Particle / Sound Preset Tag"
      extraFieldKey="particlePreset"
      extraFieldPlaceholder="e.g. Cherry Blossoms, Golden Dust, Galaxy Portal"
    />
  );
}
