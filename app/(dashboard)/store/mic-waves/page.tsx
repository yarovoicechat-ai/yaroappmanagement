'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { Mic } from 'lucide-react';

export default function MicWavesStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Mic Wave"
      categoryTitle="Microphone Sound Waves"
      categoryDescription="Dynamic sound wave and equalizer animations shown when user speaks in voice rooms."
      themeColor="#10B981"
      icon={Mic}
      defaultPrice={6000}
      extraFieldLabel="Wave Glow Color / Frequency Code"
      extraFieldKey="waveColors"
      extraFieldPlaceholder="e.g. #10B981,#3B82F6 or Neon Pulsar"
    />
  );
}
