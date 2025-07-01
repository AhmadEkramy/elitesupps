import { Product } from '@/contexts/CartContext';
import { productsService } from '@/services/firebaseService';

// Fallback static data for offline mode or initial load
export const staticProducts: Product[] = [
  // Protein Category
  {
    id: 'p1',
    name: 'Elite Whey Protein',
    nameAr: 'بروتين إليت واي',
    price: 850,
    category: 'protein',
    image: '/api/placeholder/300/300',
    description: 'Premium whey protein isolate for maximum muscle growth',
    descriptionAr: 'بروتين واي عالي الجودة لنمو العضلات الأقصى',
    flavors: ['Chocolate', 'Vanilla', 'Strawberry', 'Cookies & Cream'],
    inStock: true
  },
  {
    id: 'p2',
    name: 'Casein Protein',
    nameAr: 'بروتين كازين',
    price: 950,
    category: 'protein',
    image: '/api/placeholder/300/300',
    description: 'Slow-release protein for overnight muscle recovery',
    descriptionAr: 'بروتين بطيء الإطلاق للإستشفاء الليلي',
    flavors: ['Chocolate', 'Vanilla'],
    inStock: true,
    isOffer: true,
    originalPrice: 1100,
    discountPercentage: 15
  },
  
  // Creatine Category
  {
    id: 'c1',
    name: 'Elite Creatine Monohydrate',
    nameAr: 'كرياتين إليت مونوهيدرات',
    price: 450,
    category: 'creatine',
    image: '/api/placeholder/300/300',
    description: 'Pure creatine monohydrate for explosive power',
    descriptionAr: 'كرياتين نقي للقوة الانفجارية',
    inStock: true
  },
  
  // Mass Gainer Category
  {
    id: 'm1',
    name: 'Elite Mass Gainer',
    nameAr: 'إليت لزيادة الكتلة',
    price: 1200,
    category: 'massGainer',
    image: '/api/placeholder/300/300',
    description: 'High-calorie mass gainer for serious size gains',
    descriptionAr: 'مكمل عالي السعرات لزيادة الكتلة',
    flavors: ['Chocolate', 'Vanilla', 'Banana'],
    inStock: true,
    isOffer: true,
    originalPrice: 1400,
    discountPercentage: 20
  },
  
  // Energy Products
  {
    id: 'e1',
    name: 'Elite Pre-Workout',
    nameAr: 'إليت ما قبل التمرين',
    price: 650,
    category: 'energyProducts',
    image: '/api/placeholder/300/300',
    description: 'Explosive energy and focus for intense workouts',
    descriptionAr: 'طاقة انفجارية وتركيز للتمارين المكثفة',
    flavors: ['Fruit Punch', 'Blue Raspberry', 'Green Apple'],
    inStock: true
  },
  
  // Fat Burner
  {
    id: 'f1',
    name: 'Elite Fat Burner',
    nameAr: 'إليت حارق الدهون',
    price: 750,
    category: 'fatDialogue',
    image: '/api/placeholder/300/300',
    description: 'Advanced thermogenic fat burning formula',
    descriptionAr: 'تركيبة متطورة لحرق الدهون',
    inStock: true,
    isOffer: true,
    originalPrice: 900,
    discountPercentage: 25
  },
  
  // Vitamins
  {
    id: 'v1',
    name: 'Elite Multivitamin',
    nameAr: 'إليت مالتي فيتامين',
    price: 400,
    category: 'vitamins',
    image: '/api/placeholder/300/300',
    description: 'Complete daily vitamin and mineral support',
    descriptionAr: 'دعم كامل بالفيتامينات والمعادن اليومية',
    inStock: true
  },
  
  // Accessories
  {
    id: 'a1',
    name: 'Elite Shaker Bottle',
    nameAr: 'زجاجة إليت الخلاط',
    price: 85,
    category: 'accessories',
    image: '/api/placeholder/300/300',
    description: 'Premium 700ml shaker bottle with mixing ball',
    descriptionAr: 'زجاجة خلط فاخرة 700 مل مع كرة الخلط',
    inStock: true
  }
];

// Firebase-powered functions
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    return await productsService.getProductsByCategory(category);
  } catch (error) {
    console.error('Firebase error, using static data:', error);
    // Fallback to static data
    if (category === 'allProducts') return staticProducts;
    return staticProducts.filter(product => product.category === category);
  }
};

export const getOfferProducts = async (): Promise<Product[]> => {
  try {
    return await productsService.getOfferProducts();
  } catch (error) {
    console.error('Firebase error, using static data:', error);
    // Fallback to static data
    return staticProducts.filter(product => product.isOffer);
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const products = await productsService.getProducts();
    return products.find(product => product.id === id);
  } catch (error) {
    console.error('Firebase error, using static data:', error);
    // Fallback to static data
    return staticProducts.find(product => product.id === id);
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    return await productsService.getProducts();
  } catch (error) {
    console.error('Firebase error, using static data:', error);
    // Fallback to static data
    return staticProducts;
  }
};