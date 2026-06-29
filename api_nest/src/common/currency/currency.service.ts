import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyService {
    // Mock exchange rates relative to INR (base)
    // In a real app, these would be fetched from an API or DB
    private readonly mockRates: Record<string, number> = {
        'INR': 1,
        'USD': 0.012,
        'EUR': 0.011,
        'GBP': 0.0095,
        'AED': 0.044,
    };

    async getExchangeRates(baseCurrency: string = 'INR') {
        const rates: Record<string, number> = {};
        const baseRate = this.mockRates[baseCurrency] || 1;

        for (const [curr, rate] of Object.entries(this.mockRates)) {
            rates[curr] = rate / baseRate;
        }

        return rates;
    }

    async convert(amount: number, from: string, to: string) {
        const rates = await this.getExchangeRates(from);
        const targetRate = rates[to] || 1;
        return amount * targetRate;
    }

    async getSupportedCurrencies() {
        return Object.keys(this.mockRates).map(code => ({
            code,
            name: this.getCurrencyName(code),
            symbol: this.getCurrencySymbol(code)
        }));
    }

    private getCurrencyName(code: string): string {
        const names: Record<string, string> = {
            'INR': 'Indian Rupee',
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound',
            'AED': 'UAE Dirham',
        };
        return names[code] || code;
    }

    private getCurrencySymbol(code: string): string {
        const symbols: Record<string, string> = {
            'INR': '₹',
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'AED': 'د.إ',
        };
        return symbols[code] || code;
    }
}
