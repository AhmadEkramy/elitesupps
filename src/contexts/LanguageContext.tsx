import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    home: 'Home',
    offers: 'Offers',
    menu: 'Menu',
    about: 'About',
    contact: 'Contact',
    
    // Brand
    brandName: 'Elite Supps',
    brandSlogan: 'Fuel Your Elite Performance',
    
    // Home Section
    heroTitle: 'Transform Your Body with Elite Supplements',
    heroSubtitle: 'Premium quality supplements for serious athletes',
    shopNow: 'Shop Now',
    
    // Menu Section
    shopByCategory: 'Shop by Category',
    allProducts: 'All Products',
    protein: 'Protein',
    creatine: 'Creatine',
    massGainer: 'Mass Gainer',
    fatDialogue: 'Fat Dialogue',
    energyProducts: 'Energy Products',
    vitamins: 'Vitamins',
    generalSupplements: 'General Supplements',
    accessories: 'Accessories',
    addToCart: 'Add to Cart',
    addedToCart: 'Added to cart',
    
    // Offers
    specialOffers: 'Special Offers',
    limitedTime: 'Limited Time',
    specialBannerTitle: 'Special Launch Offer!',
    specialBannerDesc: 'Get FREE shipping on all orders above 2000 EGP + FREE Elite Shaker Bottle!',
    specialBannerCode: 'Use code:',
    
    // Cart & Checkout
    cart: 'Cart',
    checkout: 'Checkout',
    fullName: 'Full Name',
    address: 'Address',
    phoneNumber: 'Phone Number',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    vodafoneCash: 'Vodafone Cash',
    instaPay: 'InstaPay',
    orderSummary: 'Order Summary',
    deliveryFee: 'Delivery Fee',
    coupon: 'Coupon Code',
    totalCost: 'Total Cost',
    placeOrder: 'Place Order',
    orderPlacedSuccess: 'Order placed successfully!',
    
    // Products
    highProtein: 'High Protein Formula',
    preWorkout: 'Pre-Workout Energy',
    recovery: 'Recovery & Repair',
    
    // Common
    egp: 'EGP',
    perProduct: 'per product',
    discount: 'Discount',
    off: 'OFF',
    aboutTitle: 'About Elite Supps',
    aboutP1: 'Elite Supps is your trusted partner in achieving peak physical performance. We specialize in premium quality supplements designed for serious athletes and fitness enthusiasts.',
    aboutP2: 'Our commitment to excellence ensures that every product meets the highest standards of purity, potency, and effectiveness.',
    contactTitle: 'Contact Us',
    contactWhatsApp: 'WhatsApp',
    contactEmail: 'Email',
    contactLocation: 'Location',
    contactLocationValue: 'Cairo, Egypt'
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    offers: 'العروض',
    menu: 'المنتجات',
    about: 'من نحن',
    contact: 'تواصل معنا',
    
    // Brand
    brandName: 'إليت سابس',
    brandSlogan: 'وقود أدائك المتميز',
    
    // Home Section
    heroTitle: 'حول جسمك مع المكملات المتميزة',
    heroSubtitle: 'مكملات عالية الجودة للرياضيين الجادين',
    shopNow: 'تسوق الآن',
    
    // Menu Section
    shopByCategory: 'تسوق حسب الفئة',
    allProducts: 'جميع المنتجات',
    protein: 'البروتين',
    creatine: 'الكرياتين',
    massGainer: 'زيادة الكتلة',
    fatDialogue: 'حرق الدهون',
    energyProducts: 'منتجات الطاقة',
    vitamins: 'الفيتامينات',
    generalSupplements: 'مكملات عامة',
    accessories: 'الإكسسوارات',
    addToCart: 'أضف للسلة',
    addedToCart: 'تم الإضافة للسلة',
    
    // Offers
    specialOffers: 'عروض خاصة',
    limitedTime: 'لفترة محدودة',
    specialBannerTitle: 'عرض الإطلاق الخاص!',
    specialBannerDesc: 'احصل على شحن مجاني لكل الطلبات فوق 2000 جنيه + شيكر إليت مجاني!',
    specialBannerCode: 'استخدم الكود:',
    
    // Cart & Checkout
    cart: 'السلة',
    checkout: 'إتمام الطلب',
    fullName: 'الاسم كاملاً',
    address: 'العنوان',
    phoneNumber: 'رقم الهاتف',
    paymentMethod: 'طريقة الدفع',
    cashOnDelivery: 'الدفع عند الاستلام',
    vodafoneCash: 'فودافون كاش',
    instaPay: 'إنستا باي',
    orderSummary: 'ملخص الطلب',
    deliveryFee: 'رسوم التوصيل',
    coupon: 'كود الخصم',
    totalCost: 'المجموع الكلي',
    placeOrder: 'إتمام الطلب',
    orderPlacedSuccess: 'تم إتمام الطلب بنجاح!',
    
    // Products
    highProtein: 'تركيبة عالية البروتين',
    preWorkout: 'طاقة ما قبل التمرين',
    recovery: 'الإستشفاء والإصلاح',
    
    // Common
    egp: 'جنيه',
    perProduct: 'للمنتج',
    discount: 'خصم',
    off: 'خصم',
    aboutTitle: 'عن إيليت سبس',
    aboutP1: 'إيليت سبس هو شريكك الموثوق لتحقيق الأداء البدني الأمثل. نحن متخصصون في المكملات الغذائية عالية الجودة المصممة للرياضيين الجادين ومحبي اللياقة البدنية.',
    aboutP2: 'التزامنا بالتميز يضمن أن كل منتج يفي بأعلى معايير النقاء والفعالية والجودة.',
    contactTitle: 'اتصل بنا',
    contactWhatsApp: 'واتساب',
    contactEmail: 'البريد الإلكتروني',
    contactLocation: 'الموقع',
    contactLocationValue: 'القاهرة، مصر'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={language === 'ar' ? 'rtl' : 'ltr'} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};