import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, CartItem } from '@/contexts/CartContext';

export interface FirebaseProduct extends Omit<Product, 'id'> {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Order {
  id?: string;
  items: CartItem[];
  customerInfo: {
    fullName: string;
    address: string;
    phoneNumber: string;
    paymentMethod: string;
  };
  orderSummary: {
    subtotal: number;
    deliveryFee: number;
    couponDiscount: number;
    totalCost: number;
    couponCode?: string;
  };
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Offer {
  id?: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  discountPercentage: number;
  productIds: string[];
  isActive: boolean;
  validUntil: Timestamp;
  createdAt: Timestamp;
}

export interface Coupon {
  id?: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Products Service
export const productsService = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      if (category === 'allProducts') {
        return await this.getProducts();
      }
      
      const q = query(collection(db, 'products'), where('category', '==', category));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Get products with offers
  async getOfferProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, 'products'), where('isOffer', '==', true));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error('Error fetching offer products:', error);
      throw error;
    }
  },

  // Add new product (Admin only)
  async addProduct(product: FirebaseProduct): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  // Update product (Admin only)
  async updateProduct(productId: string, updates: Partial<FirebaseProduct>): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product (Admin only)
  async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Listen to products changes (real-time)
  onProductsChange(callback: (products: Product[]) => void) {
    return onSnapshot(collection(db, 'products'), (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      callback(products);
    });
  }
};

// Orders Service
export const ordersService = {
  // Place new order
  async placeOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },

  // Get all orders (Admin only)
  async getOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Update order status (Admin only)
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Listen to orders changes (real-time)
  onOrdersChange(callback: (orders: Order[]) => void) {
    return onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        callback(orders);
      }
    );
  },

  // Calculate total income
  async getTotalIncome(): Promise<number> {
    try {
      const orders = await this.getOrders();
      return orders
        .filter(order => order.status === 'delivered')
        .reduce((total, order) => total + order.orderSummary.totalCost, 0);
    } catch (error) {
      console.error('Error calculating total income:', error);
      throw error;
    }
  },

  // Delete order (Admin only)
  async deleteOrder(orderId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};

// Offers Service
export const offersService = {
  // Get active offers
  async getActiveOffers(): Promise<Offer[]> {
    try {
      const q = query(
        collection(db, 'offers'), 
        where('isActive', '==', true),
        where('validUntil', '>', new Date())
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Offer));
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  },

  // Add new offer (Admin only)
  async addOffer(offer: Omit<Offer, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'offers'), {
        ...offer,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding offer:', error);
      throw error;
    }
  },

  // Update offer (Admin only)
  async updateOffer(offerId: string, updates: Partial<Offer>): Promise<void> {
    try {
      const offerRef = doc(db, 'offers', offerId);
      await updateDoc(offerRef, updates);
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    }
  },

  // Delete offer (Admin only)
  async deleteOffer(offerId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'offers', offerId));
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  }
};

// Coupons Service
export const couponsService = {
  // Get all coupons
  async getCoupons(): Promise<Coupon[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Coupon));
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  },

  // Add new coupon
  async addCoupon(coupon: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'coupons'), {
        ...coupon,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding coupon:', error);
      throw error;
    }
  },

  // Update coupon
  async updateCoupon(couponId: string, updates: Partial<Coupon>): Promise<void> {
    try {
      const couponRef = doc(db, 'coupons', couponId);
      await updateDoc(couponRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  },

  // Delete coupon
  async deleteCoupon(couponId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  }
};

// Initialize sample data (run once)
export const initializeSampleData = async () => {
  try {
    // Check if products already exist
    const existingProducts = await productsService.getProducts();
    if (existingProducts.length > 0) {
      console.log('Sample data already exists');
      return;
    }

    // Sample products data
    const sampleProducts: FirebaseProduct[] = [
      {
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
      {
        name: 'Elite Pre-Workout',
        nameAr: 'إليت ما قبل التمرين',
        price: 650,
        category: 'energyProducts',
        image: '/api/placeholder/300/300',
        description: 'Explosive energy and focus for intense workouts',
        descriptionAr: 'طاقة انفجارية وتركيز للتمارين المكثفة',
        flavors: ['Fruit Punch', 'Blue Raspberry', 'Green Apple'],
        inStock: true
      }
    ];

    // Add sample products
    for (const product of sampleProducts) {
      await productsService.addProduct(product);
    }

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};