import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductCard } from './ProductCard';
import { getProductsByCategory } from '@/data/products';
import { Product } from '@/contexts/CartContext';

const categories = [
  'allProducts',
  'protein',
  'creatine',
  'massGainer',
  'carb',
  'fatBurner',
  'testBoster',
  'aminoAcids',
  'preworkout'
];

export const MenuSection: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('allProducts');
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load products when category changes
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await getProductsByCategory(selectedCategory);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVisibleProducts(8); // Reset visible products when category changes
  };

  const loadMoreProducts = () => {
    setVisibleProducts(prev => prev + 8);
  };

  return (
    <section id="menu" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12 slide-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-shine">
            {t('shopByCategory')}
          </h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto"></div>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'btn-primary shadow-glow'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground hover:scale-105'
                }`}
              >
                {t(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.slice(0, visibleProducts).map((product, index) => (
            <div 
              key={product.id} 
              className="slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleProducts < products.length && (
          <div className="text-center">
            <button
              onClick={loadMoreProducts}
              className="btn-accent hover:scale-105 transition-transform duration-300"
            >
              Load More Products
            </button>
          </div>
        )}

        {/* No Products Message */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};