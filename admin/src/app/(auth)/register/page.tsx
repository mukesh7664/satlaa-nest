'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    TextField,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Mail, Phone, Store as StoreIcon, Person } from '@mui/icons-material';
import {
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    ShoppingBag,
    LayoutTemplate,
    Check,
    Zap,
    BarChart3,
    Package,
    Globe,
    CreditCard,
    TrendingUp,
    Truck,
    Palette,
    Store,
    Sparkles,
    ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginStart, loginFailure } from '@/store/slices/authSlice';
import { apiService, Plan } from '@/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const stepsInfo = [
    { label: "Goal", desc: "Choose goal", icon: Zap },
    { label: "Account", desc: "Credentials", icon: Person },
    { label: "Store", desc: "Store details", icon: Store },
    { label: "Plan & Pay", desc: "Review & Pay", icon: CreditCard },
];

const overviewFeatures = [
    {
        icon: Store,
        title: "Your own online store",
        desc: "Launch a fully branded storefront with custom domain in minutes.",
        color: "bg-violet-50 text-violet-600",
        span: "col-span-2 sm:col-span-1",
    },
    {
        icon: CreditCard,
        title: "Integrated payments",
        desc: "Razorpay, Stripe & UPI — zero transaction fees.",
        color: "bg-emerald-50 text-emerald-600",
        span: "col-span-2 sm:col-span-1",
    },
    {
        icon: Palette,
        title: "No-code page builder",
        desc: "Drag-and-drop sections. Beautiful storefronts, no coding required.",
        color: "bg-sky-50 text-sky-600",
        span: "col-span-2 sm:col-span-1",
    },
    {
        icon: TrendingUp,
        title: "Advanced analytics",
        desc: "Sales, conversion & customer insights in real-time.",
        color: "bg-amber-50 text-amber-600",
        span: "col-span-2 sm:col-span-1",
    },
    {
        icon: Truck,
        title: "Logistics & fulfilment",
        desc: "Multiple courier integrations with live order tracking.",
        color: "bg-rose-50 text-rose-600",
        span: "col-span-2 sm:col-span-1",
    },
    {
        icon: Globe,
        title: "Sell globally",
        desc: "Multi-currency, unlimited products, and worldwide shipping.",
        color: "bg-indigo-50 text-indigo-600",
        span: "col-span-2 sm:col-span-1",
    },
];

export default function RegisterPage() {
    // 0 = overview screen, 1-4 = wizard steps
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [storeName, setStoreName] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [storeType, setStoreType] = useState<'page_builder' | 'ecommerce' | null>(null);

    const [couponCode, setCouponCode] = useState('');
    const [couponInput, setCouponInput] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLabel, setCouponLabel] = useState('');
    const [couponIsFree, setCouponIsFree] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) router.push('/dashboard');
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (!storeType) return;
        const fetchPlans = async () => {
            try {
                const activePlans = await apiService.getPlans(true, storeType);
                if (activePlans && activePlans.length > 0) {
                    setPlans(activePlans);
                    setSelectedPlanId(activePlans[0].id);
                } else {
                    setPlans([]);
                    setSelectedPlanId('');
                }
            } catch (err) {
                console.error('Failed to fetch plans:', err);
                toast.error('Failed to load subscription plans');
            }
        };
        fetchPlans();
    }, [storeType]);

    const handleNextStep = async () => {
        setError('');
        if (step === 1 && !storeType) {
            setError('Please select a platform goal to continue.');
            return;
        }
        if (step === 2) {
            if (!name || !email || !password || !confirmPassword) {
                setError('All credentials are required.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                return;
            }

            try {
                setIsProcessing(true);
                const res = await apiService.checkEmail(email);
                if (res.exists) {
                    setError('Admin with this email already exists.');
                    setIsProcessing(false);
                    return;
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to verify email address. Please try again.');
                setIsProcessing(false);
                return;
            } finally {
                setIsProcessing(false);
            }
        }
        if (step === 3) {
            if (!storeName) {
                setError('Please enter a store name.');
                return;
            }
        }
        setStep((prev) => prev + 1);
    };

    const handlePrevStep = () => {
        setError('');
        if (step === 2) setStoreType(null);
        setStep((prev) => Math.max(1, prev - 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedPlanId) { setError('Please select a plan to continue.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); setStep(2); return; }
        if (!storeName) { setError('Please enter a store name'); setStep(3); return; }

        try {
            dispatch(loginStart());
            const storeSlug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const orderData = await apiService.createRegistrationSubscriptionOrder({
                planId: selectedPlanId, storeName, storeSlug, billingCycle,
                registrationData: { name, email, password, phone: phone ? `${countryCode}${phone}` : undefined, storeName, role: 'ADMIN' },
                couponCode: couponApplied ? couponCode : undefined,
            });

            // 100% coupon — skip Razorpay entirely
            if (orderData.isFree) {
                setIsProcessing(true);
                try {
                    await apiService.verifySubscriptionPayment({
                        attemptId: orderData.attemptId,
                        couponCode,
                    });
                    toast.success('Your store is ready! Redirecting to login...');
                    dispatch(loginFailure());
                    setTimeout(() => router.push('/login?registered=true'), 2000);
                } catch (err: any) {
                    setError(err.message || 'Activation failed');
                    toast.error('Activation failed. Please contact support.');
                    dispatch(loginFailure());
                } finally {
                    setIsProcessing(false);
                }
                return;
            }

            // Paid flow (full or partial discount)
            const options = {
                key: orderData.razorpayKey || '',
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: "EPxWEB",
                description: `Subscription for ${storeName}`,
                order_id: orderData.order.id,
                handler: async function (response: any) {
                    try {
                        setIsProcessing(true);
                        await apiService.verifySubscriptionPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            attemptId: orderData.attemptId,
                            couponCode: couponApplied ? couponCode : undefined,
                        });
                        toast.success('Your store is ready! Redirecting to login...');
                        dispatch(loginFailure());
                        setTimeout(() => router.push('/login?registered=true'), 2000);
                    } catch (err: any) {
                        setError(err.message || 'Payment verification failed');
                        toast.error('Payment verification failed. Please contact support.');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: { name, email, contact: phone },
                theme: { color: "#6c3aed" },
                modal: {
                    ondismiss: function () { setIsProcessing(false); dispatch(loginFailure()); }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                setIsProcessing(false);
                dispatch(loginFailure());
                setError(response.error.description);
                toast.error('Payment failed: ' + response.error.description);
            });
            rzp.open();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Registration failed';
            setError(msg);
            toast.error(msg);
            dispatch(loginFailure());
        }
    };

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            height: '44px',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            '& fieldset': { borderColor: '#e5e7eb' },
            '&:hover fieldset': { borderColor: '#d1d5db' },
            '&.Mui-focused fieldset': { borderColor: '#6c3aed', borderWidth: '1.5px' },
            '&.Mui-focused': { backgroundColor: '#fff' },
        },
        '& .MuiInputLabel-root': {
            color: '#9ca3af',
            '&.Mui-focused': { color: '#6c3aed' },
        },
        '& .MuiOutlinedInput-input': {
            padding: '10px 14px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#1f2937',
            '&:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 1000px #fafafa inset',
                WebkitTextFillColor: 'inherit',
            },
        },
    };

    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    const selectedPrice = selectedPlan
        ? (billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice)
        : null;
    const finalPrice = couponApplied && selectedPrice != null
        ? Math.max(0, selectedPrice - couponDiscount)
        : selectedPrice;

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        if (!selectedPlanId || selectedPrice == null) {
            setCouponError('Please select a plan first');
            return;
        }
        setCouponError('');
        setCouponLoading(true);
        try {
            const result = await apiService.validateSubscriptionCoupon(couponInput.trim(), selectedPlanId, selectedPrice);
            if (!result.valid) {
                setCouponError(result.reason || 'Invalid coupon');
                setCouponApplied(false);
            } else {
                setCouponApplied(true);
                setCouponCode(couponInput.trim().toUpperCase());
                setCouponDiscount(result.discountAmount || 0);
                setCouponLabel(result.discountLabel || '');
                setCouponIsFree(result.isFree || false);
            }
        } catch (err: any) {
            setCouponError(err.message || 'Failed to validate coupon');
            setCouponApplied(false);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponInput('');
        setCouponCode('');
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponLabel('');
        setCouponIsFree(false);
        setCouponError('');
    };

    return (
        <div className="min-h-screen w-full flex flex-col" style={{ background: 'linear-gradient(135deg, #f8f7ff 0%, #f0ebff 45%, #ede9fe 100%)' }}>

            {/* ── Top Nav ── */}
            <header className="w-full flex items-center justify-between px-6 sm:px-12 py-5 flex-shrink-0">
                <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 bg-[#6c3aed] rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                        <span className="text-white font-black text-lg leading-none">E</span>
                    </div>
                    <span className="text-xl font-black tracking-tight text-gray-900 uppercase">EPxWEB</span>
                </div>
                <p className="text-sm text-gray-500 font-medium hidden sm:block">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#6c3aed] font-bold hover:underline">Sign in</Link>
                </p>
            </header>

            {/* ── Main ── */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <AnimatePresence mode="wait">

                    {/* ════════════════════════════════════
                        OVERVIEW SCREEN  (step === 0)
                    ════════════════════════════════════ */}
                    {step === 0 && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="w-full max-w-3xl flex flex-col items-center"
                        >
                            {/* Headline */}
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#6c3aed]/10 text-[#6c3aed] rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    All-in-one commerce platform
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                    What you'll get
                                </h1>
                                <p className="text-gray-500 font-medium mt-3 text-base sm:text-lg max-w-lg mx-auto">
                                    Everything you need to start, run, and grow your online business — in one place.
                                </p>
                            </div>

                            {/* Feature grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full mb-6">
                                {overviewFeatures.map((f, i) => {
                                    const Icon = f.icon;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.05 * i, ease: 'easeOut' }}
                                            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <p className="font-extrabold text-gray-900 text-sm leading-snug">{f.title}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{f.desc}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* "Everything else" pill */}
                            <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold mb-10">
                                <div className="w-16 h-px bg-gray-200" />
                                <span>+ Everything else you need to run a business</span>
                                <div className="w-16 h-px bg-gray-200" />
                            </div>

                            {/* CTA */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setStep(1)}
                                className="flex items-center gap-2.5 px-10 py-4 bg-[#6c3aed] hover:bg-[#5b21b6] text-white font-black text-base rounded-full shadow-xl shadow-purple-200 transition-colors duration-200"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>

                            <p className="text-xs text-gray-400 font-medium mt-4">
                                Already have an account?{' '}
                                <Link href="/login" className="text-[#6c3aed] font-bold hover:underline">Sign in</Link>
                            </p>
                        </motion.div>
                    )}

                    {/* ════════════════════════════════════
                        WIZARD  (step 1–4)
                    ════════════════════════════════════ */}
                    {step >= 1 && (
                        <motion.div
                            key="wizard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="w-full max-w-2xl flex flex-col items-center"
                        >
                            {/* ── Step wizard progress ── */}
                            <div className="w-full mb-16 px-4">
                                <div className="flex items-center justify-between w-full max-w-xl mx-auto">
                                    {stepsInfo.map((s, idx) => {
                                        const stepNum = idx + 1;
                                        const isActive = step === stepNum;
                                        const isCompleted = step > stepNum;
                                        const Icon = s.icon;
                                        return (
                                            <div key={idx} className={`flex items-center ${idx < 3 ? 'flex-1' : 'flex-shrink-0'}`}>
                                                {/* Step Circle & Absolute Label */}
                                                <div className="flex flex-col items-center relative flex-shrink-0">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${isCompleted
                                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                                                        : isActive
                                                            ? 'bg-[#6c3aed] text-white shadow-lg shadow-purple-200 scale-110'
                                                            : 'bg-white text-gray-400 border-2 border-gray-200'
                                                        }`}>
                                                        {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : <Icon className="w-4 h-4" />}
                                                    </div>
                                                    <div className="mt-2 text-center absolute top-10 w-28 left-1/2 -translate-x-1/2 hidden sm:block">
                                                        <p className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-[#6c3aed]' : isCompleted ? 'text-emerald-500' : 'text-gray-400'}`}>{s.label}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{s.desc}</p>
                                                    </div>
                                                </div>

                                                {/* Connecting Line */}
                                                {idx < 3 && (
                                                    <div className="flex-1 h-0.5 bg-gray-200 relative mx-2">
                                                        <div className={`absolute inset-y-0 left-0 bg-emerald-400 transition-all duration-500 ${isCompleted ? 'w-full' : 'w-0'}`} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Card ── */}
                            <div className="w-full bg-white rounded-3xl shadow-xl shadow-purple-100/40 border border-purple-50 overflow-hidden">

                                {/* Error banner */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <Alert severity="error" onClose={() => setError('')} className="rounded-none border-b border-red-100 font-medium">
                                                {error}
                                            </Alert>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="p-8 sm:p-10">
                                    <AnimatePresence mode="wait">

                                        {/* ── STEP 1: Goal ── */}
                                        {step === 1 && (
                                            <motion.div key="step-1" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.25 }}>
                                                <div className="text-center mb-8">
                                                    <span className="inline-block px-3 py-1 bg-purple-50 text-[#6c3aed] text-xs font-black rounded-full uppercase tracking-widest mb-3">Step 1 of 4</span>
                                                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">What&apos;s your goal?</h2>
                                                    <p className="text-gray-500 font-medium mt-2">Pick the path that best describes your business.</p>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setStoreType('page_builder'); setStep(2); }}
                                                        className="group flex flex-col items-start p-6 bg-white border-2 border-gray-100 rounded-2xl transition-all duration-200 text-left hover:border-[#6c3aed] hover:shadow-lg hover:shadow-purple-50 hover:-translate-y-0.5"
                                                    >
                                                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-[#6c3aed] group-hover:text-white transition-all duration-200 mb-4">
                                                            <LayoutTemplate className="w-6 h-6" />
                                                        </div>
                                                        <h3 className="font-extrabold text-lg text-gray-900 mb-1">Build a Website</h3>
                                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Landing pages, agency sites, portfolios &amp; blogs.</p>
                                                        <div className="mt-4 flex items-center text-[#6c3aed] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Get started <ArrowRight className="w-4 h-4 ml-1" />
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => { setStoreType('ecommerce'); setStep(2); }}
                                                        className="group flex flex-col items-start p-6 bg-white border-2 border-gray-100 rounded-2xl transition-all duration-200 text-left hover:border-[#6c3aed] hover:shadow-lg hover:shadow-purple-50 hover:-translate-y-0.5"
                                                    >
                                                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-[#6c3aed] group-hover:text-white transition-all duration-200 mb-4">
                                                            <ShoppingBag className="w-6 h-6" />
                                                        </div>
                                                        <h3 className="font-extrabold text-lg text-gray-900 mb-1">Launch an Online Store</h3>
                                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Sell products, track inventory &amp; collect payments.</p>
                                                        <div className="mt-4 flex items-center text-[#6c3aed] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Get started <ArrowRight className="w-4 h-4 ml-1" />
                                                        </div>
                                                    </button>
                                                </div>

                                                <div className="mt-6 text-center">
                                                    <button onClick={() => setStep(0)} className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors">
                                                        ← Back to overview
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* ── STEP 2: Account ── */}
                                        {step === 2 && (
                                            <motion.div key="step-2" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.25 }}>
                                                <div className="flex items-start justify-between mb-8">
                                                    <div>
                                                        <span className="inline-block px-3 py-1 bg-purple-50 text-[#6c3aed] text-xs font-black rounded-full uppercase tracking-widest mb-3">Step 2 of 4</span>
                                                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Account Details</h2>
                                                        <p className="text-gray-500 font-medium mt-1.5">Set up your admin credentials.</p>
                                                    </div>
                                                    <button onClick={handlePrevStep} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 font-bold text-sm transition-colors mt-1">
                                                        <ArrowLeft className="w-4 h-4" /> Back
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-4 mb-8">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name <span className="text-red-500 font-black">*</span></label>
                                                            <TextField fullWidth value={name} onChange={(e) => setName(e.target.value)} required sx={inputStyles}
                                                                InputProps={{ startAdornment: <InputAdornment position="start"><Person className="text-gray-400 w-5 h-5" /></InputAdornment> }} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                                            <div className="flex gap-2">
                                                                <div
                                                                    className="relative"
                                                                    onBlur={(e) => {
                                                                        if (!e.currentTarget.contains(e.relatedTarget)) {
                                                                            setIsDropdownOpen(false);
                                                                        }
                                                                    }}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                                        className={`h-[44px] px-3 bg-[#fafafa] border ${isDropdownOpen ? 'border-[#6c3aed] ring-1 ring-[#6c3aed] bg-white' : 'border-[#e5e7eb] hover:border-[#d1d5db]'} rounded-[8px] text-sm font-semibold text-gray-700 outline-none transition-all w-[95px] flex items-center justify-between shadow-sm cursor-pointer`}
                                                                    >
                                                                        <span>{countryCode}</span>
                                                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                                                    </button>

                                                                    {isDropdownOpen && (
                                                                        <div className="absolute top-[48px] left-0 z-50 w-[120px] bg-white border border-[#e5e7eb] rounded-[8px] shadow-xl py-1 max-h-[200px] overflow-y-auto no-scrollbar">
                                                                            <style>{`
                                                                                .no-scrollbar::-webkit-scrollbar {
                                                                                    display: none;
                                                                                }
                                                                                .no-scrollbar {
                                                                                    -ms-overflow-style: none;
                                                                                    scrollbar-width: none;
                                                                                }
                                                                            `}</style>
                                                                            {[
                                                                                { value: '+91', label: '+91 (IN)' },
                                                                                { value: '+1', label: '+1 (US)' },
                                                                                { value: '+44', label: '+44 (UK)' },
                                                                                { value: '+971', label: '+971 (AE)' },
                                                                                { value: '+65', label: '+65 (SG)' },
                                                                                { value: '+61', label: '+61 (AU)' },
                                                                                { value: '+33', label: '+33 (FR)' },
                                                                                { value: '+49', label: '+49 (DE)' },
                                                                            ].map((opt) => {
                                                                                const isSelected = countryCode === opt.value;
                                                                                return (
                                                                                    <button
                                                                                        key={opt.value}
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            setCountryCode(opt.value);
                                                                                            setIsDropdownOpen(false);
                                                                                        }}
                                                                                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors ${isSelected
                                                                                            ? 'bg-[#6c3aed] text-white font-bold'
                                                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                                                            }`}
                                                                                    >
                                                                                        {opt.label}
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <TextField fullWidth type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} sx={inputStyles}
                                                                    InputProps={{ startAdornment: <InputAdornment position="start"><Phone className="text-gray-400 w-5 h-5" /></InputAdornment> }} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address <span className="text-red-500 font-black">*</span></label>
                                                        <TextField fullWidth type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={inputStyles}
                                                            InputProps={{ startAdornment: <InputAdornment position="start"><Mail className="text-gray-400 w-5 h-5" /></InputAdornment> }} />
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="flex flex-col">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password <span className="text-red-500 font-black">*</span></label>
                                                            <TextField fullWidth type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required sx={inputStyles}
                                                                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment> }} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password <span className="text-red-500 font-black">*</span></label>
                                                            <TextField fullWidth type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required sx={inputStyles}
                                                                InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">{showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment> }} />
                                                        </div>
                                                    </div>

                                                    {password && (
                                                        <div className="flex items-center gap-2 -mt-1">
                                                            <div className="flex gap-1 flex-1">
                                                                {[1, 2, 3, 4].map(i => (
                                                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${password.length >= i * 2 ? i <= 2 ? 'bg-red-400' : i === 3 ? 'bg-amber-400' : 'bg-emerald-400' : 'bg-gray-100'}`} />
                                                                ))}
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-400">
                                                                {password.length < 4 ? 'Weak' : password.length < 6 ? 'Fair' : password.length < 8 ? 'Good' : 'Strong'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <button type="button" onClick={handleNextStep} disabled={isProcessing}
                                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#6c3aed] hover:bg-[#5b21b6] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-lg shadow-purple-200">
                                                    {isProcessing ? <CircularProgress size={22} color="inherit" /> : <>Continue to Store Setup <ArrowRight className="w-5 h-5" /></>}
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* ── STEP 3: Store ── */}
                                        {step === 3 && (
                                            <motion.div key="step-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.25 }}>
                                                <div className="flex items-start justify-between mb-8">
                                                    <div>
                                                        <span className="inline-block px-3 py-1 bg-purple-50 text-[#6c3aed] text-xs font-black rounded-full uppercase tracking-widest mb-3">Step 3 of 4</span>
                                                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Store Details</h2>
                                                        <p className="text-gray-500 font-medium mt-1.5">Name your online store.</p>
                                                    </div>
                                                    <button onClick={handlePrevStep} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 font-bold text-sm transition-colors mt-1">
                                                        <ArrowLeft className="w-4 h-4" /> Back
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-2 mb-8">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Store Name <span className="text-red-500 font-black">*</span></label>
                                                    <TextField fullWidth value={storeName} onChange={(e) => setStoreName(e.target.value)} required sx={inputStyles}
                                                        InputProps={{ startAdornment: <InputAdornment position="start"><StoreIcon className="text-gray-400 w-5 h-5" /></InputAdornment> }} />
                                                </div>

                                                <button type="button" onClick={handleNextStep}
                                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#6c3aed] hover:bg-[#5b21b6] text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-lg shadow-purple-200">
                                                    Continue to Plan &amp; Pay <ArrowRight className="w-5 h-5" />
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* ── STEP 4: Plan & Pay ── */}
                                        {step === 4 && (
                                            <motion.div key="step-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.25 }}>
                                                <div className="flex items-start justify-between mb-8">
                                                    <div>
                                                        <span className="inline-block px-3 py-1 bg-purple-50 text-[#6c3aed] text-xs font-black rounded-full uppercase tracking-widest mb-3">Step 4 of 4</span>
                                                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Plan &amp; Pay</h2>
                                                        <p className="text-gray-500 font-medium mt-1.5">Choose the best tier and launch your store.</p>
                                                    </div>
                                                    <button type="button" onClick={handlePrevStep} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 font-bold text-sm transition-colors mt-1">
                                                        <ArrowLeft className="w-4 h-4" /> Back
                                                    </button>
                                                </div>

                                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                                    <div className="flex justify-center mb-4">
                                                        <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl">
                                                            <button type="button" onClick={() => setBillingCycle('monthly')}
                                                                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                                                Monthly
                                                            </button>
                                                            <button type="button" onClick={() => setBillingCycle('yearly')}
                                                                className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                                                Yearly <span className="text-emerald-500 font-black text-xs ml-1">Save 20%</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {plans.length > 0 ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                                            {plans.map((p) => {
                                                                const isSelected = selectedPlanId === p.id;
                                                                const price = billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice;
                                                                return (
                                                                    <div key={p.id} onClick={() => setSelectedPlanId(p.id)}
                                                                        className={`cursor-pointer relative border-2 rounded-2xl p-5 transition-all duration-200 ${isSelected ? 'border-[#6c3aed] bg-[#6c3aed]/[0.04] shadow-lg shadow-purple-100' : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-md'}`}>
                                                                        {isSelected && (
                                                                            <div className="absolute top-3 right-3 w-5 h-5 bg-[#6c3aed] rounded-full flex items-center justify-center">
                                                                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                                            </div>
                                                                        )}
                                                                        <p className="font-extrabold text-gray-900 text-base">{p.name}</p>
                                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">SaaS Tier Plan</p>
                                                                        <div className="mt-5 pt-4 border-t border-gray-100">
                                                                            <p className="text-2xl font-black text-gray-900">₹{price}</p>
                                                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-wide mt-0.5">
                                                                                billed {billingCycle === 'yearly' ? 'annually' : 'monthly'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl mb-4 gap-3">
                                                            <CircularProgress size={28} sx={{ color: '#6c3aed' }} />
                                                            <p className="text-gray-400 font-bold text-sm">Loading plans...</p>
                                                        </div>
                                                    )}

                                                    {/* Coupon Code Section */}
                                                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Coupon Code</p>
                                                        {couponApplied ? (
                                                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-black text-emerald-700">{couponCode}</p>
                                                                        <p className="text-xs text-emerald-600 font-medium">{couponLabel} applied</p>
                                                                    </div>
                                                                </div>
                                                                <button type="button" onClick={handleRemoveCoupon} className="text-xs text-gray-400 hover:text-red-500 font-bold transition-colors">Remove</button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter coupon code"
                                                                    value={couponInput}
                                                                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                                                                    className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-[#6c3aed] focus:ring-1 focus:ring-[#6c3aed] transition-all placeholder:font-normal placeholder:text-gray-400"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={handleApplyCoupon}
                                                                    disabled={couponLoading || !couponInput.trim()}
                                                                    className="px-4 h-10 bg-[#6c3aed] hover:bg-[#5b21b6] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm rounded-xl transition-all"
                                                                >
                                                                    {couponLoading ? <CircularProgress size={14} color="inherit" /> : 'Apply'}
                                                                </button>
                                                            </div>
                                                        )}
                                                        {couponError && <p className="text-xs text-red-500 font-medium mt-2">{couponError}</p>}
                                                    </div>

                                                    {selectedPlan && (
                                                        <div className="rounded-2xl overflow-hidden border border-purple-100">
                                                            <div className="bg-[#6c3aed]/[0.05] px-5 py-3 border-b border-purple-100">
                                                                <p className="text-xs font-black text-[#6c3aed] uppercase tracking-widest">Order Summary</p>
                                                            </div>
                                                            <div className="px-5 py-4 space-y-3 bg-white">
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <p className="font-extrabold text-gray-900">{selectedPlan.name} Plan</p>
                                                                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                                                                            {billingCycle === 'yearly' ? 'Billed Annually (20% off)' : 'Billed Monthly'}
                                                                        </p>
                                                                    </div>
                                                                    <p className="font-black text-gray-900 text-lg">₹{selectedPrice}</p>
                                                                </div>
                                                                {couponApplied && couponDiscount > 0 && (
                                                                    <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3">
                                                                        <p className="font-medium text-emerald-600">Coupon ({couponCode})</p>
                                                                        <p className="font-bold text-emerald-600">-₹{couponDiscount}</p>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-50 pt-3">
                                                                    <p className="font-medium">GST (18% inclusive)</p>
                                                                    <p className="font-medium">Included</p>
                                                                </div>
                                                                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                                                                    <p className="font-black text-gray-900 text-base">Total Due Now</p>
                                                                    <p className={`font-black text-2xl ${couponIsFree ? 'text-emerald-500' : 'text-[#6c3aed]'}`}>
                                                                        {couponIsFree ? 'FREE' : `₹${finalPrice}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <button type="submit" disabled={loading || isProcessing || !selectedPlanId}
                                                        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#6c3aed] hover:bg-[#5b21b6] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-base rounded-2xl transition-all duration-200 shadow-lg shadow-purple-200 disabled:shadow-none">
                                                        {(loading || isProcessing)
                                                            ? <CircularProgress size={22} color="inherit" />
                                                            : couponIsFree
                                                                ? <><span>Activate Free Plan</span> <ArrowRight className="w-5 h-5" /></>
                                                                : <><span>Pay &amp; Launch Store</span> <ArrowRight className="w-5 h-5" /></>
                                                        }
                                                    </button>

                                                    <div className="text-center space-y-2.5">
                                                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                            <span>Secure SSL Encrypted Checkout</span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 font-medium leading-relaxed px-4">
                                                            By signing up you agree to our{' '}
                                                            <Link href="#" className="text-[#6c3aed] font-bold hover:underline">Terms</Link>{' '}
                                                            and{' '}
                                                            <Link href="#" className="text-[#6c3aed] font-bold hover:underline">Privacy Policy</Link>.
                                                        </p>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        )}

                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            {/* ── Footer ── */}
            <footer className="w-full text-center py-5 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                © 2026 EPxWEB Technologies Inc. All rights reserved.
            </footer>
        </div>
    );
}
