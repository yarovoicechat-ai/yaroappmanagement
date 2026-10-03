'use client';

import React from 'react';
import GenericStoreCategoryPage from '@/components/store/GenericStoreCategoryPage';
import { MessageSquare } from 'lucide-react';

export default function ChatBubblesStorePage() {
  return (
    <GenericStoreCategoryPage
      categoryName="Chat Bubble"
      categoryTitle="Chat Bubbles"
      categoryDescription="Custom stylized message bubbles for room chat and direct messaging."
      themeColor="#3B82F6"
      icon={MessageSquare}
      defaultPrice={3000}
      extraFieldLabel="Chat Text Color (Hex code, e.g. #FFFFFF)"
      extraFieldKey="textColor"
      extraFieldPlaceholder="#FFFFFF"
    />
  );
}
