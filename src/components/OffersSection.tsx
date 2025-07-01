import React, { useState, useEffect, useContext } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductCard } from './ProductCard';
import { getOfferProducts } from '@/data/products';
import { Product } from '@/contexts/CartContext';
import { offersService } from '@/services/firebaseService';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';

export const OffersSection: React.FC = () => {
  const { t } = useLanguage();
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedOffers, fetchedProducts] = await Promise.all([
          offersService.getActiveOffers(),
          import('@/services/firebaseService').then(m => m.productsService.getProducts())
        ]);
        setOffers(fetchedOffers);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading offers:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <section id="offers" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12 slide-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-shine">
            {t('specialOffers')}
          </h2>
          <p className="text-xl text-accent font-semibold mb-4">
            {t('limitedTime')}
          </p>
          <div className="w-24 h-1 bg-gradient-primary mx-auto"></div>
        </div>

        {/* Offers Grid */}
        {offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {offers.map((offer, index) => {
              const offerProducts = offer.productIds?.length > 0 ? offer.productIds.map((pid: string) => products.find((p: any) => p.id === pid)).filter(Boolean) : [];
              return (
                <div
                  key={offer.id}
                  className="group transition-all duration-500 transform hover:scale-105"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="relative p-6 rounded-3xl shadow-2xl bg-white/70 dark:bg-gray-900/80 border-2 border-transparent group-hover:border-primary/80 group-hover:shadow-primary/30 group-hover:shadow-2xl transition-all duration-500 flex flex-col items-center overflow-hidden backdrop-blur-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:to-accent/10 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500">
                    {offer.imageUrl && (
                      <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="w-full h-40 object-contain rounded-xl mb-4 group-hover:shadow-lg transition-all duration-500"
                      />
                    )}
                    <h3 className="font-bold text-2xl mb-2 text-center group-hover:text-primary transition-colors duration-500 drop-shadow-lg">
                      {offer.title}
                    </h3>
                    {typeof (offer as any).price === 'number' && (offer as any).price > 0 && (
                      <div className="text-lg font-bold text-primary mb-2 text-center drop-shadow">
                        {(offer as any).price} EGP
                      </div>
                    )}
                    <p className="mb-2 text-center text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                      {offer.description}
                    </p>
                    <div className="mb-2 font-semibold text-primary text-center bg-primary/10 px-3 py-1 rounded-full inline-block shadow group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:text-white transition-all duration-500">
                      {offer.discountPercentage}% OFF
                    </div>
                    <div className="mb-2 text-sm text-muted-foreground text-center">
                      Valid until: {offer.validUntil?.toDate?.().toLocaleDateString?.() || ''}
                    </div>
                    {offer.productIds?.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mt-2 mb-2">
                        {offer.productIds.map((pid: string) => {
                          const product = products.find((p: any) => p.id === pid);
                          return product ? (
                            <Badge key={pid} variant="secondary" className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent-foreground shadow group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500">
                              {product.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    {offerProducts.length > 0 && (
                      <button
                        className="btn-primary px-8 py-2 rounded-xl mt-4 font-bold shadow-lg transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:text-white group-hover:scale-110 group-hover:shadow-primary/40"
                        onClick={() => {
                          const appliedProductNames = offer.productIds?.map((pid: string) => {
                            const product = products.find((p: any) => p.id === pid);
                            return product ? product.name : null;
                          }).filter(Boolean).join(', ');
                          const offerProduct = {
                            id: `offer-${offer.id}`,
                            name: offer.title,
                            nameAr: offer.titleAr || offer.title,
                            price: (offer as any).price || 0,
                            category: 'special-offer',
                            image: offer.imageUrl || '',
                            description: offer.description + (appliedProductNames ? `\nIncludes: ${appliedProductNames}` : ''),
                            descriptionAr: offer.descriptionAr || offer.description,
                            flavors: [],
                            inStock: true,
                            isOffer: true,
                            originalPrice: undefined,
                            discountPercentage: offer.discountPercentage,
                          };
                          addToCart(offerProduct);
                        }}
                      >
                        Add to Cart
                      </button>
                    )}
                    <div className="absolute inset-0 pointer-events-none rounded-3xl group-hover:ring-4 group-hover:ring-primary/30 transition-all duration-500"></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 float-animation">
              <span className="text-4xl">🔥</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">No Special Offers Right Now</h3>
            <p className="text-muted-foreground">
              Check back soon for amazing deals on your favorite supplements!
            </p>
          </div>
        )}

        {/* Special Offer Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary via-accent to-highlight rounded-2xl p-8 text-center text-black">
          <h3 className="text-3xl font-bold mb-4">🎉 {t('specialBannerTitle')}</h3>
          <p className="text-lg mb-6">
            {t('specialBannerDesc')}
          </p>
          <div className="text-sm font-medium">
            {t('specialBannerCode')} <span className="bg-black text-primary px-3 py-1 rounded-full font-bold">ELITE2024</span>
          </div>
        </div>
      </div>
    </section>
  );
};