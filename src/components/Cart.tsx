import React from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { t, language } = useLanguage();

  const deliveryFee = 85;
  const totalWithDelivery = getTotalPrice() + deliveryFee;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            {t('cart')} ({cartItems.length})
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto max-h-96 p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedFlavor || 'default'}`} className="card-glow">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.image} 
                      alt={language === 'ar' ? item.nameAr : item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {language === 'ar' ? item.nameAr : item.name}
                      </h3>
                      {/* Show included product names for offers */}
                      {item.id.startsWith('offer-') && item.description && item.description.includes('Includes:') && (
                        <p className="text-xs text-muted-foreground">
                          {item.description.split('Includes:')[1].trim()}
                        </p>
                      )}
                      {item.selectedFlavor && (
                        <p className="text-sm text-muted-foreground">
                          Flavor: {item.selectedFlavor}
                        </p>
                      )}
                      <p className="text-sm text-primary font-bold">
                        {item.price} {t('egp')} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="font-bold text-accent">
                        {item.price * item.quantity} {t('egp')}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            {/* Cost Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{getTotalPrice()} {t('egp')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t('deliveryFee')} (+85 {t('egp')} per order):</span>
                <span>{deliveryFee} {t('egp')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                <span>{t('totalCost')}:</span>
                <span className="text-accent">{totalWithDelivery} {t('egp')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button 
              onClick={onCheckout}
              className="w-full btn-primary text-lg py-3"
            >
              {t('checkout')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};