'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { createStripeSession } from '@/lib/stripe';
import { useSubscription } from 'hooks/useSubscription';
import { PlanCards } from './PlanCards';
import { useState } from 'react';

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function PricingModal({
  open,
  onOpenChange,
  userId,
}: PricingModalProps) {
  const { status } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (priceId: string) => {
    if (!priceId) {
      console.error('No Price ID provided for upgrade.');
      return;
    }

    setIsLoading(true);
    try {
      const session = await createStripeSession({
        userId,
        priceId: priceId,
        returnUrl: window.location.href,
        metadata: {
          userId: userId,
          planType: 'PRO',
        },
      });

      if (session?.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <div className="p-6">
          <PlanCards
            status={status}
            onUpgrade={handleUpgrade}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
