import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');

  const handleAddToCart = () => {
    if (product.flavors && product.flavors.length > 0 && !selectedFlavor) {
      toast({
        title: "Please select a flavor",
        description: "Choose a flavor before adding to cart",
        variant: "destructive"
      });
      return;
    }

    addToCart(product, selectedFlavor);
    toast({
      title: t('addedToCart'),
      description: `${language === 'ar' ? product.nameAr : product.name} ${selectedFlavor ? `(${selectedFlavor})` : ''}`
    });
  };

  return (
    <div className="card-glow group">
      {/* Product Image */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img 
          src={product.image} 
          alt={language === 'ar' ? product.nameAr : product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
          {language === 'ar' ? product.nameAr : product.name}
        </h3>
        
        <p className="text-sm text-muted-foreground">
          {language === 'ar' ? product.descriptionAr : product.description}
        </p>

        {/* Flavors Selection */}
        {product.flavors && product.flavors.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Flavor:</label>
            <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select flavor" />
              </SelectTrigger>
              <SelectContent>
                {product.flavors.map((flavor) => (
                  <SelectItem key={flavor} value={flavor}>
                    {flavor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-lg font-bold text-foreground">
              {product.price} {t('egp')}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full btn-primary group-hover:scale-105 transition-transform duration-300"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {t('addToCart')}
        </Button>
      </div>
    </div>
  );
};