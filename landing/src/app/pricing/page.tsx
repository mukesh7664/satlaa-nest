"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Check, X, Shield, Zap, Globe, MessageSquare, ArrowRight, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface Plan {
    id: string;
    name: string;
    category: 'page_builder' | 'ecommerce';
    monthlyPrice: number;
    yearlyPrice: number;
    pageLimit: number;
    productLimit: number;
    storageMb: number;
    adminLimit: number;
    customDomainLimit: number;
    features: {
        [key: string]: any;
    };
    isActive: boolean;
    trial_days: number;
}

// Map database keys to human-readable names
const labelMap: { [key: string]: string } = {
    adminLimit: "Admin Accounts",
    productLimit: "Product Limit",
    pageLimit: "Landing Pages",
    customDomainLimit: "Custom Domains",
    storageMb: "Storage (MB)",
    trial_days: "Trial Period (Days)",
    seo: "SEO Tools",
    support: "Customer Support",
    analytics: "Analytics Level",
    payment_gateway: "Payment Options",
    white_label: "White-labeling",
    api_access: "API Access",
    custom_branding: "Custom Branding",
    team_collaboration: "Team Features",
    multicurrency: "Multi-currency",
    inventory_management: "Inventory Tools"
};

const getPrettyLabel = (key: string) => labelMap[key] || key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(false);
    const [category, setCategory] = useState<"page_builder" | "ecommerce">("ecommerce");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

    useEffect(() => {
        async function loadPlans() {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/plans?isActive=true`);
                if (!res.ok) throw new Error("Failed to fetch plans");
                const data = await res.json();
                setPlans(data);
                setError(null);
            } catch (err) {
                console.error("Error loading plans:", err);
                setError("Could not load pricing plans. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        loadPlans();
    }, [API_URL]);

    const filteredPlans = useMemo(() => {
        return plans
            .filter(p => p.category === category)
            .sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    }, [plans, category]);

    // Dynamically identify all feature rows based on the data present in the filtered plans
    const dynamicRows = useMemo(() => {
        if (filteredPlans.length === 0) return [];

        const rowKeys = new Set<string>();
        
        // Always include basic limits
        const standardColumns = ['adminLimit', 'productLimit', 'pageLimit', 'customDomainLimit'];
        standardColumns.forEach(col => rowKeys.add(col));

        // Add keys from the features JSON
        filteredPlans.forEach(plan => {
            if (plan.features) {
                Object.keys(plan.features).forEach(key => rowKeys.add(key));
            }
        });

        return Array.from(rowKeys).map(key => ({
            name: getPrettyLabel(key),
            key,
            // Resolver function returns the value for a specific plan
            resolve: (p: Plan) => {
                // Check if it's a standard column
                if (key in p && typeof (p as any)[key] !== 'object') {
                    const val = (p as any)[key];
                    if (typeof val === 'number') {
                        if (val === -1) return "Unlimited";
                        if (val === 0) return false;
                        if (key === 'customDomainLimit' && val > 0) return true;
                        return val.toString();
                    }
                    return val;
                }
                // Check if it's in the features JSON
                if (p.features && key in p.features) {
                    const val = p.features[key];
                    if (val === "true" || val === true) return true;
                    if (val === "false" || val === false) return false;
                    return val;
                }
                return false;
            }
        }));
    }, [filteredPlans]);

    const getPlanCardFeatures = (plan: Plan) => {
        const features: string[] = [];
        
        // 1. Add limits if they are positive
        if (plan.adminLimit > 0) features.push(`${plan.adminLimit === -1 ? 'Unlimited' : plan.adminLimit} Admin Account${plan.adminLimit === 1 ? '' : 's'}`);
        if (plan.productLimit > 0 || plan.productLimit === -1) features.push(`${plan.productLimit === -1 ? 'Unlimited' : plan.productLimit} Products`);
        if (plan.pageLimit > 0 || plan.pageLimit === -1) features.push(`${plan.pageLimit === -1 ? 'Unlimited' : plan.pageLimit} Landing Pages`);
        if (plan.customDomainLimit > 0) features.push("Custom Domain Support");

        // 2. Add features from JSON if they are truthy
        if (plan.features) {
            Object.entries(plan.features).forEach(([key, val]) => {
                if (val === true || val === "true") {
                    features.push(getPrettyLabel(key));
                } else if (typeof val === 'string' && val.length > 0 && val !== "false") {
                    features.push(`${getPrettyLabel(key)}: ${val}`);
                }
            });
        }
        return features.slice(0, 7); // Limit items shown on card for clean UI
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white pt-24">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium tracking-tight">Syncing with database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pt-24">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h1 className="text-[56px] font-bold text-black tracking-tight leading-[1.1] mb-6">
                    Ready to launch your <br />
                    <span className="text-indigo-600">multi-store empire?</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
                    Simple, transparent pricing for every stage of your business. 
                    Save up to 20% with our yearly plans.
                </p>

                {/* Category Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                        <button
                            onClick={() => setCategory("page_builder")}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${category === "page_builder"
                                ? "bg-white text-indigo-600 shadow-md"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Page Builder
                        </button>
                        <button
                            onClick={() => setCategory("ecommerce")}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${category === "ecommerce"
                                ? "bg-white text-indigo-600 shadow-md"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            E-commerce
                        </button>
                    </div>
                </div>

                {/* Yearly Toggle */}
                <div className="flex justify-center items-center space-x-4 mb-20">
                    <span className={`text-[15px] font-semibold ${!isYearly ? "text-black" : "text-gray-400"}`}>Monthly</span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className="relative rounded-full w-14 h-8 bg-indigo-600 transition-colors"
                    >
                        <span
                            className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${isYearly ? "translate-x-6" : "translate-x-0"}`}
                        />
                    </button>
                    <span className={`text-[15px] font-semibold ${isYearly ? "text-black" : "text-gray-400"}`}>
                        Yearly <span className="ml-1 text-emerald-500 text-xs font-bold uppercase tracking-wider">Save 20%</span>
                    </span>
                </div>

                {error && <div className="max-w-3xl mx-auto mb-12 p-6 rounded-3xl bg-red-50 border border-red-100 text-red-600 font-medium">{error}</div>}

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-32">
                    {filteredPlans.map((plan, idx) => (
                        <div 
                            key={plan.id}
                            className={`relative flex flex-col p-10 rounded-[40px] border transition-all duration-300 ${
                                idx === 1 
                                ? "border-indigo-600 bg-white shadow-[0_32px_64px_-16px_rgba(79,70,229,0.1)] z-10 scale-105" 
                                : "border-gray-100 bg-gray-50/50"
                            }`}
                        >
                            {idx === 1 && (
                                <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}
                            <div className="text-left mb-8">
                                <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                                <div className="flex items-baseline mt-4">
                                    <span className="text-5xl font-bold text-black tracking-tight">₹{Math.round(isYearly ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString()}</span>
                                    <span className="text-gray-400 font-medium ml-1">{isYearly ? "/year" : "/month"}</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-10 text-left flex-grow">
                                {getPlanCardFeatures(plan).map((feat, i) => (
                                    <li key={i} className="flex items-center space-x-3 text-[15px] text-gray-600">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-emerald-600" />
                                        </div>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={`${process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"}/register`}
                                className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center space-x-2 ${
                                    idx === 1 
                                    ? "bg-black text-white hover:bg-indigo-700 shadow-xl" 
                                    : "bg-white border border-gray-200 text-black hover:border-gray-900"
                                }`}
                            >
                                <span>Get Started</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="mb-32">
                    <h2 className="text-[32px] font-bold text-black mb-16 px-4">Compare features across <span className="text-indigo-600 font-extrabold">{category === "ecommerce" ? "E-commerce" : "Page Builder"}</span> plans</h2>
                    <div className="overflow-x-auto rounded-[32px] border border-gray-100 bg-white shadow-sm">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left p-8 text-black font-bold text-[18px]">Feature</th>
                                    {filteredPlans.map(p => (
                                        <th key={p.id} className="p-8 text-black font-bold text-[18px]">{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {dynamicRows.map((row) => (
                                    <tr key={row.key} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-8 text-left text-[15px] font-medium text-gray-600">{row.name}</td>
                                        {filteredPlans.map(plan => {
                                            const val = row.resolve(plan);
                                            return (
                                                <td key={plan.id} className="p-8 text-center text-[15px] text-gray-500">
                                                    {typeof val === "boolean" ? (val ? <Check className="mx-auto w-5 h-5 text-emerald-500" /> : <X className="mx-auto w-5 h-5 text-gray-300" />) : val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mb-32">
                    <h2 className="text-[32px] font-bold text-black mb-12">Frequently asked questions</h2>
                    <div className="space-y-6 text-left">
                        {[
                            { q: "Can I change plans at any time?", a: "Yes, you can upgrade or downgrade your plan at any time through your dashboard. All charges will be prorated." },
                            { q: "Do you offer a free trial?", a: "Absolutely! You can try any of our premium plans free for 14 days. No credit card required to start." },
                            { q: "What happens if I exceed my product limit?", a: "We won't shut down your store! You'll receive a notification and 7 days to upgrade to the next tier." },
                            { q: "Is there a transaction fee?", a: "No, we don't charge any transaction fees. You only pay the processing fee of your chosen payment gateway." }
                        ].map((faq) => (
                            <div key={faq.q} className="p-8 rounded-[24px] bg-gray-50/50 border border-gray-100">
                                <h3 className="text-lg font-bold text-black mb-3">{faq.q}</h3>
                                <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="bg-indigo-600 rounded-[48px] p-16 text-center text-white">
                    <h2 className="text-4xl font-bold mb-6">Need a custom solution for your brand?</h2>
                    <p className="text-lg text-indigo-100 mb-10 max-w-xl mx-auto">
                        Our enterprise team can help you build bespoke features and scale your multi-store empire globally.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link href={`${process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"}/register`} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center space-x-2">
                            <span>Contact Enterprise Team</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="#" className="text-white border border-indigo-400 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all">
                            Check Case Studies
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
