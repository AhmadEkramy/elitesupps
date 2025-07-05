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
  const [previewOffer, setPreviewOffer] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);

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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {offers.map((offer, index) => {
              const offerProducts = offer.productIds?.length > 0 ? offer.productIds.map((pid: string) => products.find((p: any) => p.id === pid)).filter(Boolean) : [];
              
              // Calculate total price of all products in the offer
              const totalOriginalPrice = offerProducts.reduce((total, product) => total + (product?.price || 0), 0);
              const discountAmount = (totalOriginalPrice * offer.discountPercentage) / 100;
              const finalPrice = totalOriginalPrice - discountAmount;
              
              return (
                <div key={offer.id} style={{ display: 'contents' }}>
                  {/* Custom Modal for Offer Preview */}
                  {previewOffer?.id === offer.id && (
                    <div style={{
                      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                      background: 'rgba(0,0,0,0.8)', zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{background: 'white', padding: 32, borderRadius: 16, minWidth: 320, maxWidth: 400, width: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <button onClick={() => setPreviewOffer(null)} style={{position: 'absolute', top: 12, right: 16, fontSize: 28, background: 'none', border: 'none', color: '#888', cursor: 'pointer', zIndex: 2}} aria-label="Close">&times;</button>
                        {/* Product Images Grid in Modal */}
                        {offer.productIds?.length > 0 && (
                          <div style={{width: '100%', marginBottom: 16}}>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxHeight: 200, overflow: 'hidden', borderRadius: 12}}>
                              {offer.productIds.slice(0, 4).map((pid: string) => {
                                const product = products.find((p: any) => p.id === pid);
                                return product ? (
                                  <img
                                    key={pid}
                                    src={product.image}
                                    alt={product.name}
                                    style={{width: '100%', height: 80, objectFit: 'cover', borderRadius: 8}}
                                  />
                                ) : null;
                              })}
                            </div>
                            {offer.productIds.length > 4 && (
                              <div style={{textAlign: 'center', marginTop: 8, fontSize: 12, color: '#666'}}>
                                +{offer.productIds.length - 4} more products
                              </div>
                            )}
                          </div>
                        )}
                        <h3 style={{fontWeight: 'bold', fontSize: 24, textAlign: 'center', marginBottom: 8}}>{offer.title}</h3>
                        <div style={{fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#f59e42'}}>{finalPrice.toFixed(0)} EGP</div>
                        <div style={{fontSize: 14, color: '#888', marginBottom: 8, textDecoration: 'line-through'}}>{totalOriginalPrice.toFixed(0)} EGP</div>
                        <p style={{fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 8}}>{offer.description}</p>
                        <div style={{marginBottom: 8, fontWeight: 'bold', color: '#f59e42', fontSize: 16}}>{offer.discountPercentage}% OFF</div>
                        <div style={{marginBottom: 8, fontSize: 13, color: '#888'}}>Valid until: {offer.validUntil?.toDate?.().toLocaleDateString?.() || ''}</div>
                        {/* Quantity Counter */}
                        <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0'}}>
                          <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{width: 36, height: 36, borderRadius: 8, border: '1px solid #eee', background: '#fafafa', fontSize: 22, cursor: 'pointer'}}>−</button>
                          <span style={{fontWeight: 'bold', fontSize: 20, width: 32, textAlign: 'center'}}>{quantity}</span>
                          <button onClick={() => setQuantity(q => q + 1)} style={{width: 36, height: 36, borderRadius: 8, border: '1px solid #eee', background: '#fafafa', fontSize: 22, cursor: 'pointer'}}>+</button>
                        </div>
                        <button
                          onClick={() => {
                            const appliedProductNames = offer.productIds?.map((pid: string) => {
                              const product = products.find((p: any) => p.id === pid);
                              return product ? product.name : null;
                            }).filter(Boolean).join(', ');
                            const offerProduct = {
                              id: `offer-${offer.id}`,
                              name: offer.title,
                              nameAr: offer.titleAr || offer.title,
                              price: finalPrice,
                              category: 'special-offer',
                              image: offer.productIds?.[0] ? products.find((p: any) => p.id === offer.productIds[0])?.image || '' : '',
                              description: offer.description + (appliedProductNames ? `\nIncludes: ${appliedProductNames}` : ''),
                              descriptionAr: offer.descriptionAr || offer.description,
                              flavors: [],
                              inStock: true,
                              isOffer: true,
                              originalPrice: totalOriginalPrice,
                              discountPercentage: offer.discountPercentage,
                            };
                            for (let i = 0; i < quantity; i++) {
                              addToCart(offerProduct);
                            }
                            setPreviewOffer(null);
                          }}
                          style={{width: '100%', background: 'linear-gradient(90deg, #FFD600 0%, #FFB800 100%)', color: '#222', fontWeight: 'bold', fontSize: 20, border: 'none', borderRadius: 8, padding: '12px 0', marginTop: 8, cursor: 'pointer', boxShadow: '0 2px 8px #ffb80033'}}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Offer Card */}
                  <div
                    className="group transition-all duration-500 transform hover:scale-105"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="relative p-6 rounded-3xl shadow-2xl bg-white/70 dark:bg-gray-900/80 border-2 border-transparent group-hover:border-primary/80 group-hover:shadow-primary/30 group-hover:shadow-2xl transition-all duration-500 flex flex-col items-center overflow-hidden backdrop-blur-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:to-accent/10 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500">
                      {/* Product Images Grid */}
                      {offer.productIds?.length > 0 && (
                        <div className="w-full mb-4">
                          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-hidden rounded-xl">
                            {offer.productIds.slice(0, 4).map((pid: string) => {
                              const product = products.find((p: any) => p.id === pid);
                              return product ? (
                                <img
                                  key={pid}
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-20 object-contain bg-white rounded-lg group-hover:shadow-lg transition-all duration-500 cursor-pointer z-10"
                                  onClick={() => { setPreviewOffer(offer); setQuantity(1); }}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setPreviewOffer(offer); setQuantity(1); } }}
                                />
                              ) : null;
                            })}
                          </div>
                          {offer.productIds.length > 4 && (
                            <div className="text-center mt-2 text-sm text-muted-foreground">
                              +{offer.productIds.length - 4} more products
                            </div>
                          )}
                        </div>
                      )}
                      <h3 className="font-bold text-2xl mb-2 text-center group-hover:text-primary transition-colors duration-500 drop-shadow-lg">
                        {offer.title}
                      </h3>
                      <div className="text-lg font-bold text-primary mb-2 text-center drop-shadow">
                        {finalPrice.toFixed(0)} EGP
                      </div>
                      <div className="text-sm text-muted-foreground mb-2 text-center line-through">
                        {totalOriginalPrice.toFixed(0)} EGP
                      </div>
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
                      
                      {/* Add to Cart Button */}
                      <button
                        onClick={() => {
                          const appliedProductNames = offer.productIds?.map((pid: string) => {
                            const product = products.find((p: any) => p.id === pid);
                            return product ? product.name : null;
                          }).filter(Boolean).join(', ');
                          const offerProduct = {
                            id: `offer-${offer.id}`,
                            name: offer.title,
                            nameAr: offer.titleAr || offer.title,
                            price: finalPrice,
                            category: 'special-offer',
                            image: offer.productIds?.[0] ? products.find((p: any) => p.id === offer.productIds[0])?.image || '' : '',
                            description: offer.description + (appliedProductNames ? `\nIncludes: ${appliedProductNames}` : ''),
                            descriptionAr: offer.descriptionAr || offer.description,
                            flavors: [],
                            inStock: true,
                            isOffer: true,
                            originalPrice: totalOriginalPrice,
                            discountPercentage: offer.discountPercentage,
                          };
                          addToCart(offerProduct);
                        }}
                        className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        Add to Cart
                      </button>
                      
                      <div className="absolute inset-0 pointer-events-none rounded-3xl group-hover:ring-4 group-hover:ring-primary/30 transition-all duration-500"></div>
                    </div>
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