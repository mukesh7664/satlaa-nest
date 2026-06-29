import { useState, useEffect } from 'react';
import { subscriptionApiService, Subscription } from '@/services/subscription.api';

export const usePlanLimits = () => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptionAndUsage = async () => {
        try {
            const [sub, use] = await Promise.all([
                subscriptionApiService.getMySubscription(),
                subscriptionApiService.getUsage()
            ]);
            setSubscription(sub);
            setUsage(use);
        } catch (error) {
            console.error('Failed to fetch plan data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptionAndUsage();
    }, []);

    const limits = {
        products: subscription?.plan?.productLimit ?? subscription?.plan?.product_limit ?? 0,
        pages: subscription?.plan?.pageLimit ?? subscription?.plan?.page_limit ?? 0,
        storageMb: subscription?.plan?.storageMb ?? subscription?.plan?.storage_mb ?? 0,
        custom_domains: (subscription?.plan?.customDomainLimit ?? subscription?.plan?.custom_domain_limit ?? 0),
        users: subscription?.plan?.adminLimit ?? subscription?.plan?.admin_limit?? 5,
    };

    return {
        subscription,
        limits,
        usage,
        loading,
        refresh: fetchSubscriptionAndUsage
    };
};
