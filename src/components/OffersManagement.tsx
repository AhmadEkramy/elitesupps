import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { offersService, Offer, productsService } from '@/services/firebaseService';
import { Product } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';

export const OffersManagement: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Offer>>({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    discountPercentage: 0,
    productIds: [],
    isActive: true,
    validUntil: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedOffers, fetchedProducts] = await Promise.all([
        offersService.getActiveOffers(),
        productsService.getProducts()
      ]);
      setOffers(fetchedOffers);
      setProducts(fetchedProducts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffer = async () => {
    try {
      await offersService.addOffer(formData as Omit<Offer, 'id' | 'createdAt'>);
      toast({
        title: "Success",
        description: "Offer created successfully"
      });
      setShowAddForm(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create offer",
        variant: "destructive"
      });
    }
  };

  const handleUpdateOffer = async (offerId: string) => {
    try {
      await offersService.updateOffer(offerId, formData);
      toast({
        title: "Success",
        description: "Offer updated successfully"
      });
      setEditingOffer(null);
      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update offer",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await offersService.deleteOffer(offerId);
        toast({
          title: "Success",
          description: "Offer deleted successfully"
        });
        loadData();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete offer",
          variant: "destructive"
        });
      }
    }
  };

  const startEditing = (offer: Offer) => {
    setFormData({
      title: offer.title,
      titleAr: offer.titleAr,
      description: offer.description,
      descriptionAr: offer.descriptionAr,
      discountPercentage: offer.discountPercentage,
      productIds: offer.productIds,
      isActive: offer.isActive,
      validUntil: offer.validUntil
    });
    setEditingOffer(offer.id!);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      discountPercentage: 0,
      productIds: [],
      isActive: true,
      validUntil: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    });
  };

  const toggleProductSelection = (productId: string) => {
    const currentIds = formData.productIds || [];
    const newIds = currentIds.includes(productId)
      ? currentIds.filter(id => id !== productId)
      : [...currentIds, productId];
    
    setFormData({ ...formData, productIds: newIds });
  };

  if (loading) {
    return <div className="text-center py-8">Loading offers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Offers Management</h2>
        <Button onClick={() => setShowAddForm(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Offer
        </Button>
      </div>

      {showAddForm && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Offer Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Input
                placeholder="Offer Title (Arabic)"
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Discount Percentage"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
              />
              <Input
                type="date"
                value={formData.validUntil ? new Date(formData.validUntil.toDate()).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  validUntil: Timestamp.fromDate(new Date(e.target.value)) 
                })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="md:col-span-2"
              />
              <Textarea
                placeholder="Description (Arabic)"
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                className="md:col-span-2"
              />
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Select Products for Offer:</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={product.id}
                        checked={formData.productIds?.includes(product.id) || false}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded"
                      />
                      <label htmlFor={product.id} className="text-sm cursor-pointer">
                        {product.name}
                      </label>
                    </div>
                  ))}
                </div>
                
                {/* Price Preview */}
                {formData.productIds && formData.productIds.length > 0 && formData.discountPercentage > 0 && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <h4 className="font-medium mb-2">Price Preview:</h4>
                    {(() => {
                      const selectedProducts = formData.productIds.map(pid => products.find(p => p.id === pid)).filter(Boolean);
                      const totalOriginalPrice = selectedProducts.reduce((total, product) => total + (product?.price || 0), 0);
                      const discountAmount = (totalOriginalPrice * formData.discountPercentage) / 100;
                      const finalPrice = totalOriginalPrice - discountAmount;
                      
                      return (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Original Price:</span>
                            <span className="line-through">{totalOriginalPrice.toFixed(0)} EGP</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount ({formData.discountPercentage}%):</span>
                            <span className="text-red-600">-{discountAmount.toFixed(0)} EGP</span>
                          </div>
                          <div className="flex justify-between font-bold text-primary">
                            <span>Final Price:</span>
                            <span>{finalPrice.toFixed(0)} EGP</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <label className="text-sm">Active Offer</label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={editingOffer ? () => handleUpdateOffer(editingOffer) : handleAddOffer} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                {editingOffer ? 'Save Changes' : 'Create Offer'}
              </Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingOffer(null); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <Card key={offer.id} className="card-glow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{offer.title}</h3>
                <Badge variant={offer.isActive ? "default" : "secondary"}>
                  {offer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-2">{offer.description}</p>
              <div className="flex items-center gap-4 mb-3">
                <Badge variant="outline" className="bg-accent text-accent-foreground">
                  {offer.discountPercentage}% OFF
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Valid until: {offer.validUntil.toDate().toLocaleDateString()}
                </span>
              </div>
              {/* Calculate and display prices */}
              {offer.productIds?.length > 0 && (
                <div className="mb-3">
                  {(() => {
                    const offerProducts = offer.productIds.map(pid => products.find(p => p.id === pid)).filter(Boolean);
                    const totalOriginalPrice = offerProducts.reduce((total, product) => total + (product?.price || 0), 0);
                    const discountAmount = (totalOriginalPrice * offer.discountPercentage) / 100;
                    const finalPrice = totalOriginalPrice - discountAmount;
                    
                    return (
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-muted-foreground">Original Price:</span>
                          <span className="line-through">{totalOriginalPrice.toFixed(0)} EGP</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-muted-foreground">Discount:</span>
                          <span className="text-red-600">-{discountAmount.toFixed(0)} EGP</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Final Price:</span>
                          <span className="font-bold text-primary">{finalPrice.toFixed(0)} EGP</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Applied to {offer.productIds.length} products</p>
                <div className="flex flex-wrap gap-1">
                  {offer.productIds.slice(0, 3).map((productId) => {
                    const product = products.find(p => p.id === productId);
                    return product ? (
                      <Badge key={productId} variant="secondary" className="text-xs">
                        {product.name}
                      </Badge>
                    ) : null;
                  })}
                  {offer.productIds.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{offer.productIds.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => startEditing(offer)}
                  className="btn-accent"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteOffer(offer.id!)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
