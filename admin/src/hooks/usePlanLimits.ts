// Single-store mode: plans/subscriptions concept removed.
// This hook is a stub that reports "unlimited" so existing pages keep working
// without any limit/usage gating. No API calls are made.
export const usePlanLimits = () => {
    const subscription = { plan: { name: 'Unlimited' } } as any;

    const limits = {
        products: -1,
        pages: -1,
        storageMb: -1,
        custom_domains: -1,
        users: -1,
    };

    return {
        subscription,
        limits,
        usage: null as any,
        loading: false,
        refresh: async () => { },
    };
};
