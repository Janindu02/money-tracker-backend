"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_CURRENCY_CODES = exports.SUPPORTED_CURRENCIES = exports.BASE_CURRENCY = void 0;
exports.BASE_CURRENCY = 'USD';
exports.SUPPORTED_CURRENCIES = [
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', locale: 'en-LK', flag: '🇱🇰' },
    { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB', flag: '🇬🇧' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN', flag: '🇮🇳' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU', flag: '🇦🇺' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA', flag: '🇨🇦' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG', flag: '🇸🇬' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP', flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN', flag: '🇨🇳' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH', flag: '🇨🇭' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE', flag: '🇦🇪' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', locale: 'ar-SA', flag: '🇸🇦' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', locale: 'en-PK', flag: '🇵🇰' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', locale: 'en-BD', flag: '🇧🇩' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', locale: 'th-TH', flag: '🇹🇭' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', locale: 'ms-MY', flag: '🇲🇾' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', locale: 'en-PH', flag: '🇵🇭' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', locale: 'id-ID', flag: '🇮🇩' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR', flag: '🇰🇷' },
];
exports.SUPPORTED_CURRENCY_CODES = exports.SUPPORTED_CURRENCIES.map((c) => c.code);
//# sourceMappingURL=currency.constants.js.map