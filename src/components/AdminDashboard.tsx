import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, DollarSign, Settings, ArrowLeft, LogOut, Users } from 'lucide-react';
import { ordersService, Order, productsService, couponsService, Coupon } from '@/services/firebaseService';
import { Product } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductManagement } from '@/components/ProductManagement';
import { OffersManagement } from '@/components/OffersManagement';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const { adminLogout, currentUser } = useAdminAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState<{ code: string; discountPercentage: string; isActive: boolean; id?: string }>({ code: '', discountPercentage: '', isActive: true });
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading admin dashboard data...');
        const [fetchedOrders, fetchedProducts, income] = await Promise.all([
          ordersService.getOrders(),
          productsService.getProducts(),
          ordersService.getTotalIncome()
        ]);
        
        console.log('Loaded orders:', fetchedOrders.length);
        console.log('Loaded products:', fetchedProducts.length);
        console.log('Total income:', income);
        
        setOrders(fetchedOrders);
        setProducts(fetchedProducts);
        setTotalIncome(income);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Real-time updates for orders
    const unsubscribeOrders = ordersService.onOrdersChange((updatedOrders) => {
      console.log('Orders updated in real-time:', updatedOrders.length);
      setOrders(updatedOrders);
    });

    // Real-time updates for products
    const unsubscribeProducts = productsService.onProductsChange((updatedProducts) => {
      console.log('Products updated in real-time:', updatedProducts.length);
      setProducts(updatedProducts);
    });

    // Load coupons
    const loadCoupons = async () => {
      try {
        const fetchedCoupons = await couponsService.getCoupons();
        setCoupons(fetchedCoupons);
      } catch (error) {
        setCouponError('Failed to load coupons');
      }
    };
    loadCoupons();

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      console.log('Updating order status:', orderId, status);
      await ordersService.updateOrderStatus(orderId, status);
      
      // Recalculate income after status update
      const newIncome = await ordersService.getTotalIncome();
      setTotalIncome(newIncome);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      onClose();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const cancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'cancelled');
  };

  const deleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await ordersService.deleteOrder(orderId);
        setOrders(orders.filter(order => order.id !== orderId));
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleCouponFormChange = (field: string, value: string | boolean) => {
    setCouponForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddOrUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponLoading(true);
    setCouponError(null);
    try {
      if (!couponForm.code.trim() || !couponForm.discountPercentage) {
        setCouponError('Please enter a code and discount percentage');
        setCouponLoading(false);
        return;
      }
      if (couponForm.id) {
        // Update
        await couponsService.updateCoupon(couponForm.id, {
          code: couponForm.code.trim(),
          discountPercentage: Number(couponForm.discountPercentage),
          isActive: couponForm.isActive,
        });
      } else {
        // Add
        await couponsService.addCoupon({
          code: couponForm.code.trim(),
          discountPercentage: Number(couponForm.discountPercentage),
          isActive: couponForm.isActive,
        });
      }
      setCouponForm({ code: '', discountPercentage: '', isActive: true });
      setCoupons(await couponsService.getCoupons());
    } catch (error) {
      setCouponError('Failed to save coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setCouponForm({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage.toString(),
      isActive: coupon.isActive,
      id: coupon.id,
    });
  };

  const handleDeleteCoupon = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Delete this coupon?')) return;
    setCouponLoading(true);
    try {
      await couponsService.deleteCoupon(id);
      setCoupons(await couponsService.getCoupons());
      if (couponForm.id === id) setCouponForm({ code: '', discountPercentage: '', isActive: true });
    } catch (error) {
      setCouponError('Failed to delete coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const tabs = [
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'offers', label: 'Offers', icon: DollarSign },
    { id: 'income', label: 'Income', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
            <h1 className="text-3xl font-bold text-shine">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-24 h-12 object-contain bg-white" />
            <span className="font-medium">
              {currentUser?.email || 'Elite Supps Admin'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{orders.length}</div>
            </CardContent>
          </Card>
          
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{products.length}</div>
            </CardContent>
          </Card>
          
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {orders.filter(order => order.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Delivered Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {orders.filter(order => order.status === 'delivered').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{totalIncome} EGP</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-primary text-black'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
            {orders.length === 0 ? (
              <Card className="card-glow">
                <CardContent className="text-center py-8">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="card-glow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold">Order #{order.id?.slice(-6)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.customerInfo.fullName} - {order.customerInfo.phoneNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {order.status}
                        </Badge>
                        <span className="font-bold text-accent">{order.orderSummary.totalCost} EGP</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Items ({order.items.length})</h4>
                        <div className="space-y-1">
                          {order.items.slice(0, 3).map((item, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              {item.quantity}x {item.name}
                              {item.selectedFlavor && ` (${item.selectedFlavor})`}
                            </p>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-sm text-muted-foreground">
                              +{order.items.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Delivery Address</h4>
                        <p className="text-sm text-muted-foreground">{order.customerInfo.address}</p>
                        <p className="text-sm text-muted-foreground">Payment: {order.customerInfo.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id!, 'confirmed')}
                          className="btn-primary"
                        >
                          Confirm Order
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id!, 'preparing')}
                          className="btn-accent"
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id!, 'shipped')}
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          Mark as Shipped
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id!, 'delivered')}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => cancelOrder(order.id!)}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteOrder(order.id!)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'products' && <ProductManagement />}

        {activeTab === 'offers' && <OffersManagement />}

        {activeTab === 'income' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Income Overview</h2>
            <Card className="card-glow">
              <CardContent className="p-6">
                <div className="text-center">
                  <DollarSign className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-accent mb-2">{totalIncome} EGP</h3>
                  <p className="text-muted-foreground">Total income from delivered orders</p>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Based on {orders.filter(order => order.status === 'delivered').length} delivered orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Admin Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleLogout} variant="destructive" className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout from Admin Panel
                  </Button>
                  <Button onClick={onClose} className="w-full btn-primary">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Return to Main Site
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle>Admin Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Logged in as:</strong> {currentUser?.email || 'Unknown'}</p>
                    <p><strong>Access Level:</strong> Full Admin Access</p>
                    <p><strong>Last Login:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Data Source:</strong> Firebase Firestore</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-glow md:col-span-2">
                <CardHeader>
                  <CardTitle>Coupon Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <form id="coupon-form" onSubmit={handleAddOrUpdateCoupon} className={`flex flex-col md:flex-row md:items-end gap-4 mb-4 ${couponForm.id ? 'ring-2 ring-accent rounded-lg p-2 transition-all duration-300' : ''}`}>
                    <div>
                      <label className="block text-sm font-medium mb-1">Code</label>
                      <input type="text" className="input border border-border rounded px-2 py-1" value={couponForm.code} onChange={e => handleCouponFormChange('code', e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Discount %</label>
                      <input type="number" className="input border border-border rounded px-2 py-1" min="1" max="100" value={couponForm.discountPercentage} onChange={e => handleCouponFormChange('discountPercentage', e.target.value)} required />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={couponForm.isActive} onChange={e => handleCouponFormChange('isActive', e.target.checked)} />
                      <span>Active</span>
                    </div>
                    <Button type="submit" disabled={couponLoading} className="btn-primary">
                      {couponForm.id ? 'Update Coupon' : 'Add Coupon'}
                    </Button>
                    {couponForm.id && (
                      <Button type="button" variant="outline" onClick={() => setCouponForm({ code: '', discountPercentage: '', isActive: true })}>
                        Cancel
                      </Button>
                    )}
                  </form>
                  {couponError && <div className="text-red-500 mb-2">{couponError}</div>}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-border rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-secondary">
                          <th className="px-2 py-1 text-left">Code</th>
                          <th className="px-2 py-1 text-left">Discount %</th>
                          <th className="px-2 py-1 text-left">Active</th>
                          <th className="px-2 py-1">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map(coupon => (
                          <tr
                            key={coupon.id}
                            className={`border-b border-border transition-colors ${couponForm.id === coupon.id ? 'bg-accent/20' : 'hover:bg-accent/10'}`}
                          >
                            <td className="px-2 py-1 font-mono">{coupon.code}</td>
                            <td className="px-2 py-1">{coupon.discountPercentage}%</td>
                            <td className="px-2 py-1">{coupon.isActive ? 'Yes' : 'No'}</td>
                            <td className="px-2 py-1 flex gap-2">
                              <Button
                                size="sm"
                                variant={couponForm.id === coupon.id ? 'default' : 'outline'}
                                className={`transition-all ${couponForm.id === coupon.id ? 'ring-2 ring-accent' : ''}`}
                                onClick={() => {
                                  handleEditCoupon(coupon);
                                  setTimeout(() => {
                                    document.getElementById('coupon-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }, 100);
                                }}
                              >
                                Edit
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteCoupon(coupon.id)}>Delete</Button>
                            </td>
                          </tr>
                        ))}
                        {coupons.length === 0 && (
                          <tr><td colSpan={4} className="text-center py-2 text-muted-foreground">No coupons found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
