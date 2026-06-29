'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Tag, X, Check } from 'lucide-react';

interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    maxUses: number | null;
    usedCount: number;
    expiresAt: string | null;
    applicablePlanIds: string[] | null;
    isActive: boolean;
    createdAt: string;
}

const emptyForm = {
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    maxUses: '',
    expiresAt: '',
    isActive: true,
};

export default function SubscriptionCouponsPage() {
    const { token } = useAppSelector((state) => state.auth);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchCoupons = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await apiService.getSubscriptionCoupons(token);
            setCoupons(data);
        } catch (err: any) {
            toast.error(err.message || 'Failed to load coupons');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setShowModal(true);
    };

    const openEdit = (c: Coupon) => {
        setEditingId(c.id);
        setForm({
            code: c.code,
            discountType: c.discountType,
            discountValue: String(c.discountValue),
            maxUses: c.maxUses != null ? String(c.maxUses) : '',
            expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
            isActive: c.isActive,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.code.trim() || !form.discountValue) {
            toast.error('Code and discount value are required');
            return;
        }
        setSaving(true);
        try {
            const payload: any = {
                code: form.code.trim().toUpperCase(),
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                isActive: form.isActive,
                maxUses: form.maxUses ? Number(form.maxUses) : null,
                expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
            };
            if (editingId) {
                await apiService.updateSubscriptionCoupon(editingId, payload, token!);
                toast.success('Coupon updated');
            } else {
                await apiService.createSubscriptionCoupon(payload, token!);
                toast.success('Coupon created');
            }
            setShowModal(false);
            fetchCoupons();
        } catch (err: any) {
            toast.error(err.message || 'Failed to save coupon');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (c: Coupon) => {
        try {
            await apiService.updateSubscriptionCoupon(c.id, { isActive: !c.isActive }, token!);
            toast.success(`Coupon ${c.isActive ? 'deactivated' : 'activated'}`);
            fetchCoupons();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update coupon');
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await apiService.deleteSubscriptionCoupon(id, token!);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete coupon');
        } finally {
            setDeletingId(null);
        }
    };

    const inputCls = 'w-full h-10 px-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 outline-none focus:border-[#6c3aed] focus:ring-1 focus:ring-[#6c3aed] bg-white transition-all';

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Tag className="w-6 h-6 text-[#6c3aed]" />
                        Subscription Coupons
                    </h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Create and manage subscription discount coupons for store registration</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#6c3aed] hover:bg-[#5b21b6] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-purple-200"
                >
                    <Plus className="w-4 h-4" /> Create Coupon
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 font-semibold text-sm">Loading coupons...</div>
                ) : coupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                            <Tag className="w-6 h-6 text-[#6c3aed]" />
                        </div>
                        <p className="text-gray-500 font-bold">No coupons yet</p>
                        <button onClick={openCreate} className="text-sm text-[#6c3aed] font-bold hover:underline">Create your first coupon</button>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-black text-gray-500 uppercase text-xs tracking-wider">Code</th>
                                <th className="text-left px-5 py-3 font-black text-gray-500 uppercase text-xs tracking-wider">Discount</th>
                                <th className="text-left px-5 py-3 font-black text-gray-500 uppercase text-xs tracking-wider">Uses</th>
                                <th className="text-left px-5 py-3 font-black text-gray-500 uppercase text-xs tracking-wider">Expires</th>
                                <th className="text-left px-5 py-3 font-black text-gray-500 uppercase text-xs tracking-wider">Status</th>
                                <th className="text-right px-5 py-3 font-black text-gray-500 uppercase text-xs tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {coupons.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <span className="font-black text-gray-900 bg-purple-50 text-[#6c3aed] px-2.5 py-1 rounded-lg text-xs tracking-wider">{c.code}</span>
                                    </td>
                                    <td className="px-5 py-3.5 font-bold text-gray-700">
                                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                                        {c.discountType === 'PERCENTAGE' && Number(c.discountValue) === 100 && (
                                            <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 font-black px-1.5 py-0.5 rounded-md">FREE</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500 font-medium">
                                        {c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ' / ∞'}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500 font-medium">
                                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button onClick={() => handleToggle(c)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${c.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                            {c.isActive ? <><Check className="w-3 h-3" /> Active</> : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-[#6c3aed] hover:bg-purple-50 rounded-lg transition-all">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                disabled={deletingId === c.id}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-black text-gray-900">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Coupon Code *</label>
                                <input
                                    className={inputCls}
                                    placeholder="e.g. LAUNCH50"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Discount Type *</label>
                                    <select
                                        className={inputCls}
                                        value={form.discountType}
                                        onChange={(e) => setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">
                                        Value {form.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'} *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={form.discountType === 'PERCENTAGE' ? 100 : undefined}
                                        className={inputCls}
                                        placeholder={form.discountType === 'PERCENTAGE' ? '50' : '500'}
                                        value={form.discountValue}
                                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                    />
                                </div>
                            </div>

                            {form.discountType === 'PERCENTAGE' && Number(form.discountValue) === 100 && (
                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <p className="text-xs text-emerald-700 font-bold">100% coupon — users will activate their store for free (no Razorpay)</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Max Uses (blank = unlimited)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className={inputCls}
                                        placeholder="e.g. 100"
                                        value={form.maxUses}
                                        onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 block">Expiry Date (optional)</label>
                                    <input
                                        type="date"
                                        className={inputCls}
                                        value={form.expiresAt}
                                        onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-[#6c3aed]' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                                <span className="text-sm font-semibold text-gray-700">{form.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-2.5 bg-[#6c3aed] hover:bg-[#5b21b6] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm rounded-xl transition-all"
                            >
                                {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
