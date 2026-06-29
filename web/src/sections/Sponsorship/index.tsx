"use client";
import { InlineEditable } from "@/components/InlineEditable";
import React, { useState } from "react";
import { FaArrowRight, FaTimes } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SponsorshipProps {
  sectionIndex?: number;
    title?: string;
    subtitle?: string;
    buttonText?: string;
    gradientStart?: string;
    gradientMiddle?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    patternEnabled?: boolean;
    patternOpacity?: number;
    patternColor?: string;
    patternDirection?: string;
}

export default function Sponsorship({ data, sectionIndex }: { data: SponsorshipProps, sectionIndex?: number }) {
    const {
        title = "Interested in Sponsoring?",
        subtitle = "Join us in creating an unforgettable experience",
        buttonText = "BECOME A SPONSOR",
        gradientStart = "#b91d73",
        gradientMiddle = "#3a0e3b",
        gradientEnd = "#000000",
        gradientDirection = "135deg", // bottom right
        patternEnabled = true,
        patternOpacity = 0.2,
        patternColor = "#000000",
        patternDirection = "45deg",
    } = data;

    const [open, setOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1"}/communication/inquiry`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-tenant-domain": window.location.hostname,
                },
                body: JSON.stringify({
                    type: "contact_us",
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    subject: "partnership",
                    message: formData.message,
                    metadata: { companyName: formData.company },
                }),
            });

            if (response.ok) {
                alert("Thank you for your interest! We will contact you soon.");
                setOpen(false);
                setFormData({ name: "", email: "", phone: "", company: "", message: "" });
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to submit inquiry. Please try again.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("An error occurred. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="relative w-full py-20 px-4 md:px-8 overflow-hidden">
            {/* Background Gradient */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientMiddle}, ${gradientEnd})`
                }}
            />

            {/* Diagonal Line Pattern Overlay */}
            {patternEnabled && (
                <div className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        opacity: patternOpacity,
                        backgroundImage: `repeating-linear-gradient(${patternDirection}, transparent, transparent 10px, ${patternColor} 10px, ${patternColor} 11px)`
                    }}
                />
            )}
            {/* Content Container */}
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto border border-yellow-500/50 bg-black/50 backdrop-blur-sm p-12 md:p-16 text-center">
                    <h2 className="text-2xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
                        <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">
                        <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                    </p>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <button className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold py-3 px-8 hover:bg-yellow-400 transition-colors uppercase tracking-wide">
                                <InlineEditable tag="span" value={buttonText || ""} fieldPath="buttonText" sectionIndex={sectionIndex} />
                                <FaArrowRight className="w-5 h-5" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-800 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-white mb-2">Sponsorship Inquiry</DialogTitle>
                                <p className="text-gray-400 text-sm">
                                    Fill out the form below and our team will get back to you effectively.
                                </p>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-300">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="Your Name"
                                        className="bg-neutral-800 border-neutral-700 text-white focus:border-yellow-500"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="your@email.com"
                                        className="bg-neutral-800 border-neutral-700 text-white focus:border-yellow-500"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        placeholder="+1 234 567 890"
                                        className="bg-neutral-800 border-neutral-700 text-white focus:border-yellow-500"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company" className="text-gray-300">Company</Label>
                                    <Input
                                        id="company"
                                        name="company"
                                        placeholder="Company Name"
                                        className="bg-neutral-800 border-neutral-700 text-white focus:border-yellow-500"
                                        value={formData.company}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-gray-300">Message</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Tell us about your sponsorship interest..."
                                        className="bg-neutral-800 border-neutral-700 text-white focus:border-yellow-500 min-h-[100px]"
                                        value={formData.message}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-yellow-500 text-black font-bold py-2 px-6 hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                                    </button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </section>
    );
}
