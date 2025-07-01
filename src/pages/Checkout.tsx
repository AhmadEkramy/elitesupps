import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { ordersService, couponsService, Coupon } from '@/services/firebaseService';

interface CheckoutProps {
  onBack: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onBack }) => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { t, language } = useLanguage();
  
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phoneNumber: '',
    paymentMethod: 'cod',
    couponCode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponStatus, setCouponStatus] = useState<'idle' | 'valid' | 'invalid' | 'loading'>('idle');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Delivery fee logic: free shipping for orders above 2500 EGP
  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 2500 ? 0 : 85;
  const couponDiscount = appliedCoupon ? Math.round(getTotalPrice() * (appliedCoupon.discountPercentage / 100)) : 0;
  const totalCost = subtotal + deliveryFee - couponDiscount;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.address || !formData.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    setShowSummary(true);
  };

  // New: Place order after summary is shown
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // Prepare order summary - start with base fields
      const orderSummary = {
        subtotal,
        deliveryFee,
        couponDiscount,
        totalCost
      };
      // Only add couponCode if it has a valid value
      const hasCouponCode = formData.couponCode && formData.couponCode.trim() !== '';
      if (hasCouponCode) {
        (orderSummary as any).couponCode = formData.couponCode.trim();
      }
      // Prepare order data for Firebase
      const orderData = {
        items: cartItems,
        customerInfo: {
          fullName: formData.fullName,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          paymentMethod: formData.paymentMethod
        },
        orderSummary,
        status: 'pending' as const
      };
      // Sanitize order data to remove undefined values
      const sanitizedOrderData = JSON.parse(JSON.stringify(orderData));
      console.log('Order data being sent:', sanitizedOrderData);
      // Save order to Firebase
      const orderId = await ordersService.placeOrder(sanitizedOrderData);
      toast({
        title: t('orderPlacedSuccess'),
        description: `Order #${orderId.slice(-6)} has been placed successfully!`
      });
      clearCart();
      onBack();
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Coupon submit handler
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponStatus('loading');
    setAppliedCoupon(null);
    setShowSummary(false);
    try {
      const coupons = await couponsService.getCoupons();
      const found = coupons.find(c => c.code.toLowerCase() === formData.couponCode.trim().toLowerCase() && c.isActive);
      if (found) {
        setAppliedCoupon(found);
        setCouponStatus('valid');
        setShowSummary(true);
      } else {
        setCouponStatus('invalid');
        setShowSummary(false);
      }
    } catch {
      setCouponStatus('invalid');
      setShowSummary(false);
    }
  };

  const paymentMethods = [
    { id: 'cod', label: t('cashOnDelivery'), icon: Banknote },
    { id: 'vodafone', label: t('vodafoneCash'), icon: Smartphone },
    { id: 'instapay', label: t('instaPay'), icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack} className="flex-shrink-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-shine">{t('checkout')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="card-glow">
            <h2 className="text-2xl font-bold mb-6">Order Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">{t('fullName')} *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">{t('address')} *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your delivery address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">{t('phoneNumber')} *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">{t('paymentMethod')}</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <method.icon className="w-5 h-5 text-primary" />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        {method.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Coupon Code */}
              <div className="mt-6 pb-4 border-t pt-6">
                <Label htmlFor="couponCode">{t('coupon')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="couponCode"
                    value={formData.couponCode}
                    onChange={(e) => {
                      handleInputChange('couponCode', e.target.value);
                      setCouponStatus('idle');
                      setAppliedCoupon(null);
                      setShowSummary(false);
                    }}
                    placeholder="Enter coupon code (optional)"
                  />
                  <Button type="button" onClick={handleCouponSubmit} disabled={couponStatus === 'loading' || !formData.couponCode.trim()}>
                    {couponStatus === 'loading' ? 'Checking...' : 'Apply'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">You can leave this blank if you don't have a coupon. Proceed to checkout below.</p>
                {couponStatus === 'valid' && appliedCoupon && (
                  <p className="text-green-600 text-sm mt-1">✅ Coupon applied! {appliedCoupon.discountPercentage}% discount</p>
                )}
                {couponStatus === 'invalid' && (
                  <p className="text-red-600 text-sm mt-1">❌ Invalid or inactive coupon</p>
                )}
              </div>
              {/* Submit Button for Order Information */}
              <Button
                type="submit"
                className="w-full btn-glow text-lg py-3 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Continue to Summary'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          {showSummary && (
            <div className="card-glow">
              <h2 className="text-2xl font-bold mb-6">{t('orderSummary')}</h2>
              {/* Items List */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedFlavor || 'default'}`} className="flex items-center gap-3 py-3 border-b border-border">
                    <img 
                      src={item.image} 
                      alt={language === 'ar' ? item.nameAr : item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{language === 'ar' ? item.nameAr : item.name}</h4>
                      {item.selectedFlavor && (
                        <p className="text-sm text-muted-foreground">{item.selectedFlavor}</p>
                      )}
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold">{item.price * item.quantity} {t('egp')}</span>
                  </div>
                ))}
              </div>
              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{subtotal} {t('egp')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('deliveryFee')}:</span>
                  <span>{deliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `${deliveryFee} ${t('egp')}`}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount:</span>
                    <span>-{couponDiscount} {t('egp')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-border pt-3">
                  <span>{t('totalCost')}:</span>
                  <span className="text-accent">{totalCost} {t('egp')}</span>
                </div>
              </div>
              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full btn-glow text-lg py-3"
              >
                {isSubmitting ? 'Processing...' : t('placeOrder')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

