"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface ButtonItem {
    id: string;
    label: string;
    url: string;
    variant: "primary" | "secondary" | "outline";
}

interface EventHeroProps {
    backgroundVideo?: string;
    backgroundImage?: string;
    sponsorText?: string;
    logoImage?: string;
    subtitle?: string;
    eventDateText?: string;
    locationText?: string;
    extraInfoText?: string;
    targetDate?: string;
    buttons?: ButtonItem[];
    gradientStart?: string;
    gradientMiddle?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    patternEnabled?: boolean;
    patternOpacity?: number;
    patternColor?: string;
    sectionIndex?: number;
}

// Countdown Timer Component
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        if (targetDate) {
            setTimeLeft(calculateTimeLeft());
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [targetDate]);

    if (!timeLeft) return null;

    return (
        <div className="flex gap-10 md:gap-20 justify-start mb-4 w-full border-t border-b border-white/10 py-4">
            {[
                { label: "days", value: timeLeft.days },
                { label: "hours", value: timeLeft.hours },
                { label: "mins", value: timeLeft.minutes },
                { label: "secs", value: timeLeft.seconds },
            ].map((item, idx) => (
                <div key={idx} className={`flex relative items-start ${idx === 0 ? "pl-6 md:pl-8" : ""}`}>
                    {idx === 0 && (
                        <div className="absolute top-2 left-0 w-[1px] h-10 md:h-12 bg-red-600" />
                    )}
                    <div className="flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-bold italic text-white leading-none">
                            {String(item.value).padStart(2, "0")}
                        </span>
                        <span className="text-sm md:text-base font-bold uppercase text-white/80 mt-2">
                            {item.label}
                        </span>
                    </div>
                    <div className="absolute top-2 -right-5 md:-right-10 w-[1px] h-10 md:h-12 bg-red-600" />
                </div>
            ))}
        </div>
    );
};

export default function EventHero({ data, sectionIndex }: { data: EventHeroProps, sectionIndex?: number }) {
    const {
        backgroundVideo,
        backgroundImage,
        sponsorText,
        logoImage,
        subtitle,
        eventDateText,
        locationText,
        extraInfoText,
        targetDate,
        buttons,
        gradientStart = "#4a0f3d",
        gradientMiddle = "transparent", // or rgba(0,0,0,0.2)
        gradientEnd = "#4a0f3d",
        gradientDirection = "to bottom",
        patternEnabled = true,
        patternOpacity = 0.2,
        patternColor = "#000000",
    } = data;

    // Construct the gradient string
    // Note: The original had two separate gradients. We might want to combine/overlay them or just provide one main one.
    // The user request was "bg grading chagne ka opitn do".
    // I will replace the first hardcoded gradient with the user's choice, and keep the second one if it's structural (e.g. fade at bottom).
    // Original 1: bg-gradient-to-t from-[#4a0f3d] via-black/20 to-black/40 mix-blend-multiply
    // Original 2: bg-gradient-to-b from-transparent via-transparent to-[#4a0f3d]/90

    // For simplicity and user control, let's allow them to define the main underlying gradient.
    const gradientStyle = {
        background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientMiddle}, ${gradientEnd})`,
    };

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black pb-10 md:pb-20">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
                {backgroundVideo ? (
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-60"
                    >
                        <source src={backgroundVideo} type="video/mp4" />
                    </video>
                ) : backgroundImage ? (
                    <InlineImageEditable
                        src={backgroundImage}
                        alt="Event Background"
                        fill
                        fieldPath="backgroundImage"
                        sectionIndex={sectionIndex}
                        className="object-cover object-center opacity-60"
                    />
                ) : null}

                {/* Dynamic Gradient Overlay requested by user */}
                <div
                    className="absolute inset-0 mix-blend-multiply"
                    style={{
                        background: `linear-gradient(to top, ${gradientEnd}, rgba(0,0,0,0.2), rgba(0,0,0,0.4))`
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(to bottom, transparent, transparent, ${gradientEnd}E6)`
                    }}
                />

            </div>

            <div className="container mx-auto px-4 z-10 relative flex flex-col items-start text-left w-full max-w-3xl">

                {/* Top Content: Countdown */}
                <div className=" w-full">
                    {targetDate && <CountdownTimer targetDate={targetDate} />}
                </div>

                {/* Center Content: Sponsor & Logo */}
                <div className="flex flex-col items-start justify-center mb-4 w-full gap-1">
                    {sponsorText && (
                        <div className="text-white font-black text-xl md:text-3xl uppercase tracking-widest mb-2">
                            <InlineEditable tag="span" value={sponsorText || ""} fieldPath="sponsorText" sectionIndex={sectionIndex} />
                        </div>
                    )}

                    {logoImage ? (
                        <div className="relative w-full max-w-3xl h-32 md:h-56">
                            <InlineImageEditable
                                src={logoImage}
                                alt="Event Logo"
                                fill
                                fieldPath="logoImage"
                                sectionIndex={sectionIndex}
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <h1 className="text-6xl md:text-8xl font-black text-white  uppercase italic tracking-tighter">
                            EVENT TITLE
                        </h1>
                    )}

                    {subtitle && (
                        <h2 className="text-lg md:text-2xl font-extrabold text-white uppercase tracking-[0.8em]  w-full">
                            <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                        </h2>
                    )}
                </div>

                {/* Bottom Content: Stacked */}
                <div className="w-full mt-auto ">
                    {/* Date & Location Info row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full mb-6 font-bold text-lg md:text-xl uppercase leading-tight text-[#eaff00] tracking-wide">
                        <div className="text-left space-y-1">
                            {eventDateText && <p><InlineEditable tag="span" value={eventDateText || ""} fieldPath="eventDateText" sectionIndex={sectionIndex} /></p>}
                            {locationText && <p><InlineEditable tag="span" value={locationText || ""} fieldPath="locationText" sectionIndex={sectionIndex} /></p>}
                        </div>
                        <div className="text-left md:text-right mt-4 md:mt-0">
                            {extraInfoText && <p><InlineEditable tag="span" value={extraInfoText || ""} fieldPath="extraInfoText" sectionIndex={sectionIndex} /></p>}
                        </div>
                    </div>

                    {/* Buttons Stack */}
                    <div className="flex flex-col w-full border-b border-white/30">
                        {(buttons || []).map((btn, index) => (
                            <Link
                                key={btn.id}
                                href={btn.url}
                                className="group relative flex items-center justify-between w-full py-5 text-white font-bold text-xl md:text-2xl transition-all before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-white/30 before:transition-all hover:before:h-[6px] hover:before:bg-white"
                            >
                                <span><InlineEditable tag="span" value={btn.label || ""} fieldPath={`buttons.${index}.label`} sectionIndex={sectionIndex} /></span>
                                <div className="bg-transparent text-white transition-colors">
                                    <ChevronRight size={28} strokeWidth={3} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
