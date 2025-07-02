import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product.flavors && product.flavors.length > 0 && !selectedFlavor) {
      toast({
        title: "Please select a flavor",
        description: "Choose a flavor before adding to cart",
        variant: "destructive"
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedFlavor);
    }
    toast({
      title: t('addedToCart'),
      description: `${language === 'ar' ? product.nameAr : product.name} ${selectedFlavor ? `(${selectedFlavor})` : ''} x${quantity}`
    });
  };

  return (
    <div className="card-glow group flex flex-col min-h-[420px] h-full">
      {/* Product Image with Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogTrigger asChild>
          <div className="relative mb-4 overflow-hidden rounded-lg cursor-pointer h-48 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={language === 'ar' ? product.nameAr : product.name}
              className="w-full h-48 object-contain bg-white transition-transform duration-300 group-hover:scale-110"
              onClick={() => setPreviewOpen(true)}
            />
            {/* Out of Stock Overlay */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold">Out of Stock</span>
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-md w-full bg-background rounded-lg p-6 flex flex-col items-center gap-4">
          <img src={product.image} alt={language === 'ar' ? product.nameAr : product.name} className="w-full h-64 object-contain rounded-lg mb-4" />
          <h3 className="font-bold text-2xl text-center mb-2">
            {language === 'ar' ? product.nameAr : product.name}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-2">
            {language === 'ar' ? product.descriptionAr : product.description}
          </p>
          {product.flavors && product.flavors.length > 0 && (
            <div className="w-full mb-2">
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
          {/* Quantity Counter */}
          <div className="flex items-center gap-3 my-2">
            <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-lg font-bold w-8 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-lg font-bold text-foreground">
              {product.price} {t('egp')}
            </span>
            {!product.inStock && (
              <span className="text-red-600 font-bold ml-4">Out of Stock</span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full btn-primary text-lg"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('addToCart')}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Product Info */}
      <div className="space-y-3 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
          {language === 'ar' ? product.nameAr : product.name}
        </h3>
        <p className="text-sm text-muted-foreground flex-1">
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
        <div className="mt-auto">
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
    </div>
  );
};