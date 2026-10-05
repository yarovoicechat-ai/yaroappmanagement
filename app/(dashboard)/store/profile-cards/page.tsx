'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { CreditCard } from 'lucide-react';

export default function ProfileCardsStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Profile Card"
      categoryTitle="User Profile Cards"
      categoryDescription="Custom stylized business & VIP cards displayed when tapping a user profile."
      themeColor="#6366F1"
      icon={CreditCard}
      defaultPrice={7500}
      extraFieldLabel="Card Gradient / Border Accent"
      extraFieldKey="cardStyle"
      extraFieldPlaceholder="e.g. Platinum Hologram, Obsidian Gold"
    />
  );
}
