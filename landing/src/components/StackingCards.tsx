"use client";
import React from "react";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Globe, Share2 } from "lucide-react";
import Link from "next/link";

const cards = [
    {
        id: 1,
        title: "Sell on your e-commerce website",
        description: "Launch your products on your custom e-commerce website. Leverage powerful tools and features to attract and convert visitors into loyal customers.",
        image: "/assets/ecommerce_mw.png",
        bgColor: "bg-[#fee2e2]", // Light Pink
        icon: <ShoppingBag className="w-6 h-6 text-pink-600" />,
        top: "top-[120px]",
        paddingTop: "pt-8"
    },
    {
        id: 2,
        title: "Sell on marketplaces",
        description: "Connect with millions of shoppers on global marketplaces. Streamline your sales processes and reach a wider audience across multiple platforms effortlessly.",
        image: "/assets/marketplace_mw.png",
        bgColor: "bg-[#e0f2fe]", // Light Blue
        icon: <Globe className="w-6 h-6 text-blue-600" />,
        top: "top-[160px]",
        paddingTop: "pt-12"
    },
    {
        id: 3,
        title: "Reach customers on social media",
        description: "Engage with your audience on popular social media platforms. Drive traffic and sales by integrating your store directly into your social feeds and stories.",
        image: "/assets/social_mw.png",
        bgColor: "bg-[#fef9c3]", // Light Yellow
        icon: <Share2 className="w-6 h-6 text-amber-600" />,
        top: "top-[200px]",
        paddingTop: "pt-16"
    }
];

export default function StackingCards() {
    return (
        <section className="pt-32 pb-1 bg-white relative">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header Section from Screenshot */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-[48px] font-bold text-black leading-[1.1] tracking-tight">
                            Reach customers wherever they are. Sell to every buyer, everywhere.
                        </h2>
                    </div>
                    <div className="max-w-sm">
                        <p className="text-gray-500 text-lg leading-relaxed">
                            Sell your products online, in person, and globally with essential marketing tools, social media integrations, and diverse sales channels to reach your customers.
                        </p>
                    </div>
                </div>

                {/* Stacking Cards Container */}
                <div className="relative flex flex-col gap-0 pb-10">
                    {cards.map((card, index) => (
                        <div
                            key={card.id}
                            className={`sticky ${card.top} w-full rounded-[28px] overflow-hidden shadow-[0_20px_30px_rgba(0,0,0,0.05)] mb-12 transform-gpu transition-all duration-500 hover:scale-[1.01]`}
                        >
                            <div className={`${card.bgColor} p-10 lg:p-12 min-h-[400px] flex items-center`}>
                                <div className="grid md:grid-cols-2 gap-12 items-center w-full">
                                    {/* Left Content */}
                                    <div className="flex flex-col space-y-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            {card.icon}
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-900 leading-tight">
                                            {card.title}
                                        </h3>
                                        <p className="text-slate-600 text-lg leading-relaxed max-w-md">
                                            {card.description}
                                        </p>
                                        <div>
                                            <Link
                                                href={`${process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"}/register`}
                                                className="inline-flex items-center px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all group"
                                            >
                                                <span>Get Started</span>
                                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Right Image/Mockup */}
                                    <div className="relative h-[350px] lg:h-[380px] overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
                                        <Image
                                            src={card.image}
                                            alt={card.title}
                                            fill
                                            className="object-cover transition-transform duration-700 hover:scale-105"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
