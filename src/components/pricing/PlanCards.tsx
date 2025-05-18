'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

// Define the plan type for better type safety
export type Plan = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  productId?: string | null;
  highlight?: boolean;
  action?: string;
  contactEmail?: string;
};

// Export the plans array so it can be imported elsewhere
export const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    description:
      'Perfect for individuals and small teams just getting started.',
    features: [
      'Up to 10 responses in summaries',
      '5 meeting templates',
      'Email notifications',
      'Basic summary generation',
      '24-hour data retention',
    ],
    productId: null,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For teams that need advanced features and more flexibility.',
    features: [
      'Unlimited responses in summaries',
      'Unlimited meeting templates',
      'Custom templates',
      'Cross-pollination of ideas',
      'Ask AI prompting',
      'Analytics dashboard',
      '90-day data retention',
      'Priority support',
      'Advanced integrations',
    ],
    productId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations requiring maximum control and support.',
    features: [
      'Everything in Pro',
      'Unlimited data retention',
      'Dedicated account manager',
      'Custom AI model training',
      'SLA guarantees',
      'SSO & advanced security',
      'API access',
      'Custom integrations',
      'Onboarding & training',
    ],
    action: 'Contact Sales',
    contactEmail: 'enterprise@harmonica.chat',
  },
];

interface PlanCardsProps {
  status: string;
  onUpgrade: (priceId: string) => Promise<void>;
  isLoading?: boolean;
  columns?: number;
  showCurrentPlanBadge?: boolean;
}

export function PlanCards({
  status,
  onUpgrade,
  isLoading = false,
  columns = 3,
  showCurrentPlanBadge = true,
}: PlanCardsProps) {
  // Helper function to determine if a plan is the current one
  const isCurrentPlan = (planName: string) => {
    return (
      (status === 'FREE' && planName === 'Free') ||
      (status === 'PRO' && planName === 'Pro')
    );
  };

  return (
    <div className={`grid md:grid-cols-${columns} gap-6`}>
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`flex flex-col ${isCurrentPlan(plan.name) ? 'border-purple-500 shadow-md' : ''}`}
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{plan.name}</CardTitle>
              {showCurrentPlanBadge && isCurrentPlan(plan.name) && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                  Current Plan
                </Badge>
              )}
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{plan.price}</span>
              {plan.period && (
                <span className="text-gray-500 ml-1">{plan.period}</span>
              )}
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="ml-3 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter className="mt-auto pt-6">
            {plan.name === 'Pro' ? (
              status !== 'PRO' ? (
                <Button
                  className="w-full"
                  onClick={() => plan.productId && onUpgrade(plan.productId)}
                  disabled={isLoading || !plan.productId}
                >
                  {isLoading ? 'Please wait...' : 'Upgrade to Pro'}
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              )
            ) : plan.action ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  plan.contactEmail &&
                  (window.location.href = `mailto:${plan.contactEmail}`)
                }
              >
                {plan.action}
              </Button>
            ) : (
              <Button
                className="w-full"
                variant="outline"
                disabled={status === 'FREE'}
              >
                {status === 'FREE' ? 'Current Plan' : 'Downgrade to Free'}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
