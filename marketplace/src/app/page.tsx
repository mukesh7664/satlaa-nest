'use client';

import React, { useEffect, useState } from 'react';
import { marketplaceApi } from '@/services/marketplace.api';
import MarketplaceHero from '@/components/MarketplaceHero';
import MarketplaceBrandSlider from '@/components/MarketplaceBrandSlider';
import MarketplaceStores from '@/components/MarketplaceStores';
import MarketplaceProducts from '@/components/MarketplaceProducts';
import MarketplaceFooter from '@/components/MarketplaceFooter';

export default function HomePage() {
    const [stores, setStores] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [storesData, productsData] = await Promise.all([
                    marketplaceApi.getStores(),
                    marketplaceApi.getProducts(8, 0)
                ]);
                setStores(storesData);
                setProducts(productsData.items || []);
            } catch (error) {
                console.error("Failed to load marketplace data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <MarketplaceHero />
            <MarketplaceBrandSlider />

            <MarketplaceStores stores={stores} loading={loading} />

            <MarketplaceProducts products={products} loading={loading} />

            <MarketplaceFooter />
        </div>
    );
}
