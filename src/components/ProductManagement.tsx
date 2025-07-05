import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productsService, FirebaseProduct } from '@/services/firebaseService';
import { Product } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<FirebaseProduct>>({
    name: '',
    nameAr: '',
    price: 0,
    category: 'protein',
    description: '',
    descriptionAr: '',
    flavors: [],
    inStock: true,
    image: '/api/placeholder/300/300'
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const fetchedProducts = await productsService.getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      await productsService.addProduct(formData as FirebaseProduct);
      toast({
        title: "Success",
        description: "Product added successfully"
      });
      setShowAddForm(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProduct = async (productId: string) => {
    try {
      const sanitizedData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== undefined)
      );
      await productsService.updateProduct(productId, sanitizedData);
      toast({
        title: "Success",
        description: "Product updated successfully"
      });
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsService.deleteProduct(productId);
        toast({
          title: "Success",
          description: "Product deleted successfully"
        });
        loadProducts();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive"
        });
      }
    }
  };

  const startEditing = (product: Product) => {
    setFormData({
      name: product.name ?? '',
      nameAr: product.nameAr ?? '',
      price: product.price ?? 0,
      category: product.category ?? 'protein',
      description: product.description ?? '',
      descriptionAr: product.descriptionAr ?? '',
      flavors: Array.isArray(product.flavors) ? product.flavors : [],
      inStock: product.inStock ?? true,
      image: product.image ?? '/api/placeholder/300/300',
      isOffer: product.isOffer,
      originalPrice: product.originalPrice,
      discountPercentage: product.discountPercentage
    });
    setEditingProduct(product.id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      price: 0,
      category: 'protein',
      description: '',
      descriptionAr: '',
      flavors: [],
      inStock: true,
      image: '/api/placeholder/300/300'
    });
  };

  const addFlavor = () => {
    const flavor = prompt('Enter flavor name:');
    setFormData((prev) => ({
      ...prev,
      flavors: [...(prev.flavors ?? []), ...(flavor ? [flavor] : [])]
    }));
  };

  const removeFlavor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      flavors: (prev.flavors ?? []).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <Button onClick={() => setShowAddForm(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showAddForm && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <Input
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Product Name (Arabic)"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Textarea
                placeholder="Description (Arabic)"
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              />
              <Input
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Price (EGP)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="protein">Protein</SelectItem>
                  <SelectItem value="creatine">Creatine</SelectItem>
                  <SelectItem value="massGainer">Mass Gainer</SelectItem>
                  <SelectItem value="carb">Carb</SelectItem>
                  <SelectItem value="fatBurner">Fat burner</SelectItem>
                  <SelectItem value="testBoster">Test Boster</SelectItem>
                  <SelectItem value="aminoAcids">Amino Acids</SelectItem>
                  <SelectItem value="preworkout">Preworkout</SelectItem>
                  <SelectItem value="vitamins">Vitamins</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Button type="button" onClick={addFlavor} size="sm">Add Flavor</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.flavors?.map((flavor, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFlavor(index)}>
                      {flavor} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddProduct} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Save Product
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="card-glow">
            <CardContent className="p-4">
              {editingProduct === product.id ? (
                <div className="space-y-3">
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Product Name"
                  />
                  <Input
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="Product Name (Arabic)"
                  />
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="Price"
                  />
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description"
                  />
                  <Textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="Description (Arabic)"
                  />
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Image URL"
                  />
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="protein">Protein</SelectItem>
                      <SelectItem value="creatine">Creatine</SelectItem>
                      <SelectItem value="massGainer">Mass Gainer</SelectItem>
                      <SelectItem value="carb">Carb</SelectItem>
                      <SelectItem value="fatBurner">Fat burner</SelectItem>
                      <SelectItem value="testBoster">Test Boster</SelectItem>
                      <SelectItem value="aminoAcids">Amino Acids</SelectItem>
                      <SelectItem value="preworkout">Preworkout</SelectItem>
                      <SelectItem value="vitamins">Vitamins</SelectItem>
                    </SelectContent>
                  </Select>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Button type="button" onClick={addFlavor} size="sm">Add Flavor</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.flavors?.map((flavor, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFlavor(index)}>
                          {flavor} <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateProduct(product.id)}
                      className="btn-primary"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingProduct(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-bold mb-2">{product.name}</h3>
                  <p className="text-accent font-bold mb-2">{product.price} EGP</p>
                  <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.flavors?.map((flavor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {flavor}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => startEditing(product)}
                      className="btn-accent"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
